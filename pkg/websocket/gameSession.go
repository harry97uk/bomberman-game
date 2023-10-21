package websocket

import (
	"bomberman_server/pkg/gamestate"
	"bomberman_server/pkg/helpers"
	"fmt"
	"log"
	"sync"
	"time"
)

type GameSession struct {
	clients      []*Client
	gameState    *gamestate.GameState
	chatMessages []ChatMessage
	timer        int
	started      bool
	mu           sync.Mutex
}

// AddPlayer adds a player to the game session.
func (gs *GameSession) AddPlayer(client *Client) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.clients = append(gs.clients, client)

	if len(gs.clients) > 1 {
		timeTicker := helpers.SetInterval(
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
					gs.timer = 10
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
		log.Println(timeTicker)
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
