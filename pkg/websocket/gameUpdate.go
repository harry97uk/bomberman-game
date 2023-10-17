package websocket

func handleGameUpdate(msg ReadMessage, c *Client) error {
	desc := msg.Info["desc"].(string)

	if desc == "new_powerup" || desc == "remove_powerup" {
		row := msg.Info["row"].(float64)
		col := msg.Info["col"].(float64)
		ptype := msg.Info["ptype"].(string)

		for _, client := range c.gameSession.clients {

			messageToSend := createMarshalledWriteMessage("game_update", map[string]interface{}{
				"desc":  desc,
				"row":   row,
				"col":   col,
				"ptype": ptype,
			})
			client.send <- messageToSend
		}
	}

	return nil
}
