import { Player } from "./player.js";
import { findElementInVDom } from "../framework/findElemInVdom.js";
import CreateElement from "../framework/createElement.js";
import AddAttributesToElem from "../framework/addAttributes.js";
import NestElements from "../framework/nestElements.js";
import diff from "../framework/diff.js";
import CreateEvent from "../framework/createEvent.js";
import { socket } from "../websocket/websocket.js";

export class Game {
  constructor(root) {
    this.root = root;
    this.vDom = CreateElement("div", {
      attrs: { id: "bomberman-dom-app" },
      children: [CreateElement("div", { attrs: { id: "game" } })],
    });
    this.newVDom = CreateElement("div", {
      attrs: { id: "bomberman-dom-app" },
      children: [CreateElement("div", { attrs: { id: "game" } })],
    });
    this.cells = [];
    this.entities = [];
    this.players = [];
    this.grid = 32;
    this.numRows = 13;
    this.numCols = 15;

    this.last = -1;
    this.dt = -1;

    // create a mapping of object types
    this.types = {
      wall: "#",
      softWall: 1,
      bomb: 2,
    };

    this.gameContainer = findElementInVDom(this.newVDom, "div", { id: "game" });
  }

  generateLevel(template) {
    this.cells = [];
    let idCounter = 0;

    for (let row = 0; row < this.numRows; row++) {
      this.cells[row] = [];

      for (let col = 0; col < this.numCols; col++) {
        // 90% chance cells will contain a soft wall
        console.log(template[row][col]);
        if (template[row][col] === "1") {
          this.cells[row][col] = {
            type: this.types.softWall,
            id: "cell" + idCounter,
          };
        } else if (template[row][col] === this.types.wall) {
          this.cells[row][col] = {
            type: this.types.wall,
            id: "cell" + idCounter,
          };
        } else {
          this.cells[row][col] = { type: "space", id: "cell" + idCounter };
        }
        idCounter++;
      }
    }

    this.renderGrid();
  }

  renderGrid() {
    this.gameContainer.innerHTML = ""; // Clear previous content

    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const cellType = this.cells[row][col];
        const cellElement = CreateElement("div");

        // Set the class and content based on the cell type
        if (cellType.type === this.types.wall) {
          AddAttributesToElem(cellElement, { class: "wall" });
        } else if (cellType.type === this.types.softWall) {
          AddAttributesToElem(cellElement, { class: "soft-wall" });
        } else {
          AddAttributesToElem(cellElement, { class: "space" });
        }

        AddAttributesToElem(cellElement, {
          id: cellType.id,
          style: `top: ${row * this.grid}px; left: ${
            col * this.grid
          }px; height: ${this.grid}px; width: ${this.grid}px;`,
        });

        NestElements(this.gameContainer, cellElement);
      }
    }
  }

  generatePlayer(playerNum, displayName, playerName) {
    const player = new Player(playerNum, this, displayName);
    this.players.push(player);

    if (player.displayName !== playerName) {
      return;
    }
    const actions = (e) => {
      if (player.timer !== 500) return;
      player.registerAction(e.key);
      const row = player.row;
      const col = player.col;

      // Send player's input and playerId to the server
      const playerInput = {
        displayName,
        playerNum,
        row,
        col,
        action: e.key, // Store the action (e.g., "ArrowLeft", "ArrowUp", etc.)
      };

      // Send player input to the server via WebSocket
      this.sendPlayerInput(playerInput);
    };
    CreateEvent(document.documentElement, "keydown", actions);
  }

  registerPlayerAction(playerNum, action) {
    const player = this.players.find((p) => p.playerNum === playerNum);
    if (player) {
      player.registerAction(action);
    } else {
      console.error(`Player ${playerNum} not found.`);
    }
  }

  sendPlayerInput(playerInput) {
    socket.send(
      JSON.stringify({
        type: "player_input",
        info: playerInput,
      })
    );
  }

  loop(timestamp) {
    const boundLoop = this.loop.bind(this);

    // calculate the time difference since the last update. requestAnimationFrame
    // passes the current timestamp as a parameter to the loop
    if (this.last === -1) {
      this.last = timestamp;
    }
    this.dt = timestamp - this.last;

    // update and render all entities
    this.entities.forEach((entity) => {
      entity.update(this.dt);
      entity.render();
    });

    // remove dead entities
    this.entities = this.entities.filter((entity) => entity.alive);

    this.players.forEach((player) => {
      player.render(this.dt);
    });

    const patch = diff(this.vDom, this.newVDom);
    patch(this.root);
    this.vDom = JSON.parse(JSON.stringify(this.newVDom));

    this.last = timestamp;
    requestAnimationFrame(boundLoop);
  }
}
