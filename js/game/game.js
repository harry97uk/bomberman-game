import { Player } from "./player.js";

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

    this.player = new Player(1, 1, this);
  }

  generateLevel(template) {
    this.cells = [];

    for (let row = 0; row < this.numRows; row++) {
      this.cells[row] = [];

      for (let col = 0; col < this.numCols; col++) {
        // 90% chance cells will contain a soft wall
        if (!template[row][col] && Math.random() < 0.9) {
          this.cells[row][col] = this.types.softWall;
        } else if (template[row][col] === this.types.wall) {
          this.cells[row][col] = this.types.wall;
        }
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
        if (cellType === this.types.wall) {
          cellElement.classList.add("wall");
        } else if (cellType === this.types.softWall) {
          cellElement.classList.add("soft-wall");
        }

        // Set the position and size of the cell
        cellElement.style.top = row * this.grid + "px";
        cellElement.style.left = col * this.grid + "px";
        cellElement.style.height = this.grid + "px";
        cellElement.style.width = this.grid + "px";

        this.gameContainer.appendChild(cellElement);
      }
    }
  }

  loop(timestamp) {
    let last = this.last;
    let dt = this.dt;
    const boundLoop = this.loop.bind(this);

    requestAnimationFrame(boundLoop);

    // calculate the time difference since the last update. requestAnimationFrame
    // passes the current timestamp as a parameter to the loop
    if (!last) {
      last = timestamp;
    }
    dt = timestamp - last;
    last = timestamp;

    // update and render all entities
    this.entities.forEach((entity) => {
      entity.update(dt);
      entity.render();
    });

    // remove dead entities
    this.entities = this.entities.filter((entity) => entity.alive);

    this.player.render();
  }
}
