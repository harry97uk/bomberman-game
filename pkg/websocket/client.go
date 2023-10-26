// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package websocket

import (
	"bomberman_server/pkg/gamestate"
	"bomberman_server/pkg/helpers"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// GameSession represents a game session with players.

type ChatMessage struct {
	Sender  string
	Message string
}

type ReadMessage struct {
	Type string                 `json:"type"`
	Info map[string]interface{} `json:"info"`
}
type WriteMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

var gameSessions []*GameSession

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send              chan []byte
	sendChannelClosed bool

	uuid        string
	name        string
	gameSession *GameSession
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.gameSession.RemovePlayer(c)
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		var msg ReadMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println(err)
			continue
		}

		switch msg.Type {
		case "player_joined":
			handleClientJoinedGameSession(msg, c)
			break
		case "player_input":
			handlePlayerInput(msg, c)
			break
		case "game_start":
			handleStartGame(msg, c)
			break
		case "game_update":
			handleGameUpdate(msg, c)
			break
		case "chat_message":
			handleChatMessage(msg, c)
			break
		default:
			log.Println(msg)
			break
		}

		//message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		//c.hub.broadcast <- message
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	onlineUsersTicker := time.NewTicker(1 * time.Second)
	defer func() {
		ticker.Stop()
		onlineUsersTicker.Stop()
		c.gameSession.RemovePlayer(c)
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				fmt.Println("channel closed!!")
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			//fmt.Println(string(message))
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Create or join a game session
	var session *GameSession
	for _, gs := range gameSessions {
		if len(gs.clients) < 4 && !gs.started {
			session = gs
			break
		}
	}

	if session == nil {
		session = &GameSession{}
		session.timer = 20
		session.gameState = &gamestate.GameState{}
		session.gameState.InitialiseMap()
		gameSessions = append(gameSessions, session)
	}

	uuid, err := helpers.CreateUUID()
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), uuid: uuid, gameSession: session}
	client.hub.register <- client
	session.AddPlayer(client)

	go client.readPump()
	go client.writePump()
}

func CreateMarshalledWriteMessage(typ string, data interface{}) []byte {
	var writeMessage WriteMessage
	writeMessage.Type = typ
	writeMessage.Data = data
	marshalledData, err := json.Marshal(writeMessage)
	if err != nil {
		log.Printf("error: %v", err)
	}
	return marshalledData
}
