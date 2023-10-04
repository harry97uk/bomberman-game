import { Player } from "./player.js";
import { Bomb } from "./bomb.js";

export class Game {
  constructor() {
    this.cells = [];
    this.entities = [];
    this.grid = 32;
    this.numRows = 13;
    this.numCols = 15;

    this.last = -1;
    this.dt = -1;

    // create a mapping of object types
    this.types = {
      wall: "▉",
      softWall: 1,
      bomb: 2,
    };

    this.gameContainer = document.getElementById("game-container");
  }

  generateLevel(template) {
    this.cells = [];
    let idCounter = 0;

    for (let row = 0; row < this.numRows; row++) {
      this.cells[row] = [];

      for (let col = 0; col < this.numCols; col++) {
        // 90% chance cells will contain a soft wall
        if (!template[row][col] && Math.random() < 0.9) {
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
        const cellElement = document.createElement("div");

        // Set the class and content based on the cell type
        if (cellType.type === this.types.wall) {
          cellElement.classList.add("wall");
        } else if (cellType.type === this.types.softWall) {
          cellElement.classList.add("soft-wall");
        } else {
          cellElement.classList.add("space");
        }

        cellElement.id = cellType.id;

        // Set the position and size of the cell
        cellElement.style.top = row * this.grid + "px";
        cellElement.style.left = col * this.grid + "px";
        cellElement.style.height = this.grid + "px";
        cellElement.style.width = this.grid + "px";

        this.gameContainer.appendChild(cellElement);
      }
    }
  }

  generatePlayer() {
    this.player = new Player(1, 1, this);
    document.addEventListener(
      "keydown",
      function (e) {
        let row = this.player.row;
        let col = this.player.col;

        // left arrow key
        if (e.key === "ArrowLeft") {
          col--;
        }
        // up arrow key
        else if (e.key === "ArrowUp") {
          row--;
        }
        // right arrow key
        else if (e.key === "ArrowRight") {
          col++;
        }
        // down arrow key
        else if (e.key === "ArrowDown") {
          row++;
        }
        // space key (bomb)
        else if (
          e.key === " " &&
          this.cells[row][col].type === "space" &&
          // count the number of bombs the player has placed
          this.entities.filter((entity) => {
            return (
              entity.type === this.types.bomb && entity.owner === this.player
            );
          }).length < this.player.numBombs
        ) {
          // place bomb
          const bomb = new Bomb(
            row,
            col,
            this.player.bombSize,
            this.player,
            this
          );
          this.entities.push(bomb);
          this.cells[row][col].type = this.types.bomb;
        }

        // don't move the player if something is already at that position
        if (this.cells[row][col].type === "space") {
          this.player.row = row;
          this.player.col = col;
        }
      }.bind(this)
    );
  }

  loop(timestamp) {
    const boundLoop = this.loop.bind(this);

    requestAnimationFrame(boundLoop);

    // calculate the time difference since the last update. requestAnimationFrame
    // passes the current timestamp as a parameter to the loop
    if (this.last === -1) {
      this.last = timestamp;
    }
    this.dt = timestamp - this.last;
    this.last = timestamp;

    // update and render all entities
    this.entities.forEach((entity) => {
      entity.update(this.dt);
      entity.render();
    });

    // remove dead entities
    this.entities = this.entities.filter((entity) => entity.alive);

    this.player.render();
  }
}
