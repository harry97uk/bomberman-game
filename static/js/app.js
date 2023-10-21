import CreateElement from "./framework/createElement.js";
import Mount from "./framework/mount.js";
import Render from "./framework/render.js";
import { Game } from "./game/game.js";
import { socket } from "./websocket/websocket.js";

const $app = Render(
  CreateElement("div", {
    attrs: { id: "bomberman-dom-app" },
    children: [CreateElement("div", { attrs: { id: "game" } })],
  })
);

let $rootEl = Mount($app, document.querySelector("#bomberman-dom-app"));

export const game = new Game($rootEl);
let playerName;
let players = [];
const boundLoop = game.loop.bind(game); // Bind the loop method to the game instance

export function startGame(template) {
  const gameTimer = document.getElementById("game-timer");

  gameTimer.innerHTML = "Game started!";
  players.forEach((player, index) => {
    game.generatePlayer(index, player, playerName);
  });
  game.generateLevel(template);
  requestAnimationFrame(boundLoop);
}

export function setPlayerName(name) {
  playerName = name;
  addChatFormListener();
}

export function setPlayers(playerArr) {
  players = playerArr;
}

function addChatFormListener() {
  document
    .getElementById("chat-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Get the user's name from the input field
      const message = document.getElementById("chat-message").value;

      socket.send(
        JSON.stringify({
          type: "chat_message",
          info: { sender: playerName, message: message },
        })
      );
    });
}
