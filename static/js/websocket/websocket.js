// Define the WebSocket server URL (replace with your server's URL)
const serverUrl = "ws://localhost:8080/ws";

// Create a WebSocket instance
const socket = new WebSocket(serverUrl);

// Event handler for when the connection is established
socket.addEventListener("open", (event) => {
  console.log("WebSocket connection opened:", event);

  // Send a message to the server
  socket.send("Hello, server!");
});

// Event handler for incoming messages from the server
socket.addEventListener("message", (event) => {
  console.log("Message from server:", event.data);

  // You can process and handle the incoming data here
});

// Event handler for when the connection is closed
socket.addEventListener("close", (event) => {
  if (event.wasClean) {
    console.log("WebSocket connection closed cleanly:", event);
  } else {
    console.error("WebSocket connection abruptly closed:", event);
  }
});

// Event handler for WebSocket errors
socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});
