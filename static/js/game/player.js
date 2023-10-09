import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import { Bomb } from "./bomb.js";

const PLAYERS = [
  { colour: "blue", row: 1, col: 1 },
  { colour: "red", row: 1, col: 13 },
  { colour: "green", row: 11, col: 1 },
  { colour: "yellow", row: 11, col: 13 },
];

export class Player {
  constructor(playerNum, game, displayName) {
    this.game = game;
    this.row = PLAYERS[playerNum].row;
    this.col = PLAYERS[playerNum].col;
    this.colour = PLAYERS[playerNum].colour;
    this.displayName = displayName;
    this.playerNum = playerNum;
    this.numBombs = 1;
    this.bombSize = 3;
    this.radius = game.grid * 0.35;

    // Create a player DOM element
    // this.playerElement = document.createElement("div");
    // this.playerElement.classList.add("player");
    this.playerElement = CreateElement("div", { attrs: { class: "player" } });
    this.updatePlayerPosition();

    // Append the player element to the game container
    //this.game.gameContainer.appendChild(this.playerElement);

    NestElements(this.game.gameContainer, this.playerElement);
  }

  // Update the player's position on the DOM
  updatePlayerPosition() {
    this.playerElement.attrs.style = `background-color: ${this.colour};top: ${
      this.row * this.game.grid
    }px; left: ${this.col * this.game.grid}px;`;
  }

  render() {
    this.updatePlayerPosition();
  }

  registerAction(action) {
    let row = this.row;
    let col = this.col;

    // left arrow key
    if (action === "ArrowLeft") {
      col--;
    }
    // up arrow key
    else if (action === "ArrowUp") {
      row--;
    }
    // right arrow key
    else if (action === "ArrowRight") {
      col++;
    }
    // down arrow key
    else if (action === "ArrowDown") {
      row++;
    }
    // space key (bomb)
    else if (
      action === " " &&
      this.game.cells[row][col].type === "space" &&
      // count the number of bombs the player has placed
      this.game.entities.filter((entity) => {
        return entity.type === this.game.types.bomb && entity.owner === this;
      }).length < this.numBombs
    ) {
      // place bomb
      const bomb = new Bomb(row, col, this.bombSize, this, this.game);
      this.game.entities.push(bomb);
      this.game.cells[row][col].type = this.game.types.bomb;
    }

    // don't move the player if something is already at that position
    if (this.game.cells[row][col].type === "space") {
      this.row = row;
      this.col = col;
    }
  }
}
