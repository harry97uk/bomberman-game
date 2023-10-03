import { Bomb } from "./bomb.js";

export class Player {
  constructor(row, col, game) {
    this.game = game;
    this.row = row;
    this.col = col;
    this.numBombs = 1;
    this.bombSize = 3;
    this.radius = game.grid * 0.35;

    // Create a player DOM element
    this.playerElement = document.createElement("div");
    this.playerElement.classList.add("player");
    this.updatePlayerPosition();

    // Append the player element to the game container
    this.game.gameContainer.appendChild(this.playerElement);

    document.addEventListener("keydown", function (e) {
      let row = this.row;
      let col = this.col;

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
        !this.game.cells[row][col] &&
        // count the number of bombs the player has placed
        entities.filter((entity) => {
          return entity.type === this.game.types.bomb && entity.owner === this;
        }).length < this.numBombs
      ) {
        // place bomb
        const bomb = new Bomb(row, col, this.bombSize, this);
        this.game.entities.push(bomb);
        this.game.cells[row][col] = types.bomb;
      }

      // don't move the player if something is already at that position
      if (!this.game.cells[row][col]) {
        this.row = row;
        this.col = col;
      }
    });
  }

  // Update the player's position on the DOM
  updatePlayerPosition() {
    this.playerElement.style.top = this.row * this.game.grid + "px";
    this.playerElement.style.left = this.col * this.game.grid + "px";
  }

  render() {
    const x = (this.col + 0.5) * this.game.grid;
    const y = (this.row + 0.5) * this.game.grid;

    this.updatePlayerPosition();
  }
}
