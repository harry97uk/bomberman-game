import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import RemoveChildElement from "../framework/removeElement.js";
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
    this.initRow = PLAYERS[playerNum].row;
    this.initCol = PLAYERS[playerNum].col;
    this.row = PLAYERS[playerNum].row;
    this.col = PLAYERS[playerNum].col;
    this.dx = 0;
    this.dy = 0;
    this.speed = 2;
    this.colour = PLAYERS[playerNum].colour;
    this.displayName = displayName;
    this.playerNum = playerNum;
    this.numBombs = 1;
    this.bombSize = 3;
    this.lives = 3;
    this.radius = game.grid * 0.35;
    this.timer = 500;

    // Create a player DOM element
    // this.playerElement = document.createElement("div");
    // this.playerElement.classList.add("player");
    this.playerElement = CreateElement("div", {
      attrs: { class: "player", id: displayName + playerNum },
    });
    this.updatePlayerPosition();

    // Append the player element to the game container
    //this.game.gameContainer.appendChild(this.playerElement);

    NestElements(this.game.gameContainer, this.playerElement);
  }

  // Update the player's position on the DOM
  updatePlayerPosition() {
    this.timer = 500;
    this.dx = 0;
    this.dy = 0;
    this.playerElement.attrs.style = `background-color: ${this.colour};top: ${
      this.row * this.game.grid
    }px; left: ${this.col * this.game.grid}px;`;
    this.playerElement.children = [`${this.lives}`];
  }

  render(dt) {
    let count = 0;
    let done = false;
    let rowDirectionOffset = 0;
    let colDirectionOffset = 0;

    const direction = this.dx !== 0 ? "x" : this.dy !== 0 ? "y" : null;
    if (direction) {
      this.timer -= dt;
      count = Math.min(
        (this.speed / 10) * (500 - this.timer),
        Math.abs(direction === "x" ? this.dx : this.dy) * this.game.grid
      );
      if (
        count >=
        Math.abs(direction === "x" ? this.dx : this.dy) * this.game.grid
      ) {
        done = true;
      }
      if (direction === "x") {
        colDirectionOffset = this.dx < 0 ? 1 : -1;
        count *= this.dx < 0 ? -1 : 1;
      } else {
        rowDirectionOffset = this.dy < 0 ? 1 : -1;
        count *= this.dy < 0 ? -1 : 1;
      }
      this.transformPlayerPosition(
        rowDirectionOffset,
        colDirectionOffset,
        count
      );
    }

    if (done || this.timer < 0) {
      this.updatePlayerPosition();
    }
  }

  transformPlayerPosition(rowDirectionOffset, colDirectionOffset, count) {
    let axis;

    if (rowDirectionOffset !== 0) axis = "Y";
    else if (colDirectionOffset !== 0) axis = "X";

    this.playerElement.attrs.style = `background-color: ${this.colour};top: ${
      (this.row + rowDirectionOffset) * this.game.grid
    }px; left: ${
      (this.col + colDirectionOffset) * this.game.grid
    }px;transform: translate${axis}(${count}px)`;
  }

  registerAction(action) {
    let row = this.row;
    let col = this.col;
    let dx = 0;
    let dy = 0;

    // left arrow key
    if (action === "ArrowLeft") {
      col--;
      dx--;
    }
    // up arrow key
    else if (action === "ArrowUp") {
      row--;
      dy--;
    }
    // right arrow key
    else if (action === "ArrowRight") {
      col++;
      dx++;
    }
    // down arrow key
    else if (action === "ArrowDown") {
      row++;
      dy++;
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
      this.dx = dx;
      this.dy = dy;
    }
  }

  loseLife() {
    this.lives--;
    if (this.lives < 0) {
      RemoveChildElement(this.game.gameContainer, player.playerElement);
    }
    this.row = this.initRow;
    this.col = this.initCol;
    this.updatePlayerPosition();
  }
}
