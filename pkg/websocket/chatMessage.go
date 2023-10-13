package websocket

func handleChatMessage(msg ReadMessage, c *Client) error {
	sender := msg.Info["sender"].(string)
	message := msg.Info["message"].(string)

	chatMessage := ChatMessage{}

	chatMessage.Message = message
	chatMessage.Sender = sender

	c.gameSession.chatMessages = append(c.gameSession.chatMessages, chatMessage)

	for _, client := range c.gameSession.clients {

		messageToSend := createMarshalledWriteMessage("chat_message", map[string]interface{}{
			"chat_messages": c.gameSession.chatMessages,
		})

		client.send <- messageToSend
	}
	return nil
}
