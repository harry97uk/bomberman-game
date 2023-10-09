import { game, setPlayers, startGame } from "../app.js";

export function handleWebsocketMessage(msg) {
  switch (msg.type) {
    case "player_joined":
      console.log(msg.data.name);
      document.getElementById("game-players").innerText =
        msg.data.players.join(" ");
      setPlayers(msg.data.players);
      break;
    case "game_start":
      const template = msg.data.template;
      startGame(template);
      break;
    case "game_update":
      // Update the game state based on the server's update
      updateGameState(msg.data);
      break;
    case "player_action":
      // Handle actions from other players (e.g., move, place bomb)
      handlePlayerAction(msg.data);
      break;
    default:
      break;
  }
}

// Update the game state based on the server's update
function updateGameState(gameState) {
  // Update the client's game state with the new data from the server
}

// Handle actions from other players (e.g., move, place bomb)
function handlePlayerAction(actionData) {
  // Apply the action to the client's game state
  game.registerPlayerAction(actionData.player_number, actionData.player_action);
}
