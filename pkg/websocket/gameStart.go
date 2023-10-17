package websocket

func handleStartGame(msg ReadMessage, c *Client) error {
	c.gameSession.StartGame()
	return nil
}
