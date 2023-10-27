package websocket

import (
	"bomberman_server/pkg/gamestate"
	"bomberman_server/pkg/helpers"
	"fmt"
	"sync"
	"time"
)

const (
	JOIN_GAME_SESSION_COUNTDOWN_TIME = 20
	GAME_START_COUNTDOWN_TIME        = 10
	MAX_GAME_SESSION_CLIENTS         = 4
)

type GameSession struct {
	clients      []*Client
	gameState    *gamestate.GameState
	chatMessages []ChatMessage
	timeTicker   *helpers.Interval
	timer        int
	started      bool
	mu           sync.Mutex
}

// AddPlayer adds a player to the game session.
func (gs *GameSession) AddPlayer(client *Client) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.clients = append(gs.clients, client)

	if len(gs.clients) == MAX_GAME_SESSION_CLIENTS {
		gs.started = true
		gs.timer = GAME_START_COUNTDOWN_TIME
	} else {
		gs.timer = JOIN_GAME_SESSION_COUNTDOWN_TIME
	}

	if len(gs.clients) > 1 && gs.timeTicker == nil {
		gs.timeTicker = helpers.SetInterval(
			func() {
				//send ws message
				message := CreateMarshalledWriteMessage("time_information", map[string]interface{}{
					"time_type":  gs.DecideTimeType(),
					"time_value": gs.timer,
				})
				gs.SendMessageToGameSessionClients(message)

				gs.timer--

				if gs.timer == 0 && !gs.started {
					gs.started = true
					gs.timer = GAME_START_COUNTDOWN_TIME
				}

			},
			1*time.Second,
			func() bool {
				if gs.timer == 0 && gs.started {
					gs.StartGame()
					return true
				}
				return false
			})
	}
}

func (gs *GameSession) RemovePlayer(client *Client) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	clientIndex := gs.FindClientIndex(client.uuid)

	if clientIndex != -1 {
		gs.clients = append(gs.clients[:clientIndex], gs.clients[clientIndex+1:]...)
	}

}

func (gs *GameSession) StartGame() {
	fmt.Println("Starting the game...")
	message := CreateMarshalledWriteMessage("game_start", map[string]interface{}{
		"template": gs.gameState.Cells,
	})
	gs.SendMessageToGameSessionClients(message)
}

func (gs *GameSession) SendMessageToGameSessionClients(message []byte) {
	for _, client := range gs.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
		}
	}
}

func (gs *GameSession) DecideTimeType() string {
	if gs.started {
		return "starting"
	}
	return "joining"
}

func (gs *GameSession) FindClientIndex(targetUUID string) int {
	for i, client := range gs.clients {
		if client.uuid == targetUUID {
			return i
		}
	}
	return -1

}
