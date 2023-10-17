import { game, startGame } from "../app.js";
import { handleChatMessages } from "./chatMessages.js";
import { updatePlayersInformation } from "./updatePlayerInfo.js";
import { updateGame } from "./updateGame.js";
import { handlePlayerAction } from "./playerAction.js";

export function handleWebsocketMessage(msg) {
  switch (msg.type) {
    case "player_joined":
      updatePlayersInformation(msg);
      break;
    case "game_start":
      const template = msg.data.template;
      startGame(template);
      break;
    case "game_update":
      // Update the game state based on the server's update
      updateGame(msg.data);
      break;
    case "player_action":
      // Handle actions from other players (e.g., move, place bomb)
      handlePlayerAction(msg.data);
      break;
    case "chat_message":
      handleChatMessages(msg);
    case "time_information":
      handleTimeInformation(msg);
      break;
      break;
    default:
      break;
  }
}
