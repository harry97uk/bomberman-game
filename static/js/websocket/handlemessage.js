import { game, setPlayers, startGame } from "../app.js";

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
      updateGameState(msg.data);
      break;
    case "player_action":
      // Handle actions from other players (e.g., move, place bomb)
      handlePlayerAction(msg.data);
      break;
    case "chat_message":
      handleChatMessages(msg);
      break;
    default:
      break;
  }
}

// Update the game state based on the server's update
function updateGameState(gameState) {
  // Update the client's game state with the new data from the server
  //starting game or finishing game??
}

// Handle actions from other players (e.g., move, place bomb)
function handlePlayerAction(actionData) {
  // Apply the action to the client's game state
  game.registerPlayerAction(actionData.player_number, actionData.player_action);
}

function updatePlayersInformation(msg) {
  const playersNameDisplay = document.getElementById("game-players");
  const playersNameArray = msg.data.players;
  const totalPlayersCount = msg.data.number_of_players;

  playersNameDisplay.innerText = `Total Players: ${totalPlayersCount}` + "\n";
  playersNameDisplay.innerText += playersNameArray.join("\n");
  setPlayers(playersNameArray);
}

function handleChatMessages(msg) {
  console.log(msg.data.chat_messages[0].Message);
  const gameChat = document.getElementById("game-chat");
  const gameChatLength = gameChat.children.length - 1;
  const chats = msg.data.chat_messages.map((message) => {
    const messageEl = document.createElement("div");
    messageEl.innerText = `${message.Sender}: ${message.Message}`;
    messageEl.classList.add("chat-message");
    return messageEl;
  });
  for (let i = gameChatLength; i < chats.length; i++) {
    if (gameChat.children.length > 1) {
      gameChat.insertBefore(chats[i], gameChat.childNodes[2]);
    } else {
      gameChat.appendChild(chats[i]);
    }
  }
}
