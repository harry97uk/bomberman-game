package websocket

import (
	"fmt"
)

func handleClientJoinedGameSession(msg ReadMessage, c *Client) error {
	c.name = msg.Info["name"].(string)
	fmt.Println(c.name)
	c.gameSession.gameState.AddPlayer(len(c.gameSession.gameState.Players), c.name)
	names := []string{}
	for _, client := range c.gameSession.clients {
		names = append(names, client.name)
	}
	//send message that user is online to all of the online clients
	for _, client := range c.gameSession.clients {

		messageToSend := CreateMarshalledWriteMessage("player_joined", map[string]interface{}{
			"name":              c.name,
			"players":           names,
			"number_of_players": len(c.gameSession.clients),
		})
		client.send <- messageToSend
	}

	return nil
}
