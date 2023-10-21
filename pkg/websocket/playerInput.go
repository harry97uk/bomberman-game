package websocket

func handlePlayerInput(msg ReadMessage, c *Client) error {
	playerNum := msg.Info["playerNum"].(float64)
	row := msg.Info["row"].(float64)
	col := msg.Info["col"].(float64)
	action := msg.Info["action"].(string)
	displayName := msg.Info["displayName"].(string)

	c.gameSession.gameState.ChangePlayerPosition(int(playerNum), int(row), int(col))

	for _, client := range c.gameSession.clients {

		messageToSend := CreateMarshalledWriteMessage("player_action", map[string]interface{}{
			"player_number": playerNum,
			"player_action": action,
		})

		if client.name != displayName {
			client.send <- messageToSend
		}
	}
	return nil
}
