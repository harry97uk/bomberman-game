import { setPlayerName } from "../app.js";
import { handleWebsocketMessage } from "./handlemessage.js";

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return "";
}

// Define the WebSocket server URL (replace with your server's URL)
const serverUrl = "ws://localhost:8080/ws";
const userName = getCookie("userName");

// Create a WebSocket instance
export const socket = new WebSocket(serverUrl);

// Event handler for when the connection is established
socket.addEventListener("open", (event) => {
  console.log("WebSocket connection opened:", event);
  // Send a message to the server
  socket.send(
    JSON.stringify({
      type: "player_joined",
      info: { name: userName, online: true },
    })
  );
  setPlayerName(userName);
});

// Event handler for incoming messages from the server
socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  console.log("Message from server:", msg);

  handleWebsocketMessage(msg);
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

// Handle player actions (e.g., move, place bomb)
function sendPlayerAction(action) {
  const message = {
    type: "player_action",
    data: action,
  };

  // Send the action to the server
  socket.send(JSON.stringify(message));
}
