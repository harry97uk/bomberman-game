import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import RemoveChildElement from "../framework/removeElement.js";
import { socket } from "../websocket/websocket.js";
import { Bomb } from "./bomb.js";

const PLAYERS = [
  { colour: "blue", row: 1, col: 1, backgroundYPosition: 0 },
  { colour: "red", row: 1, col: 13, backgroundYPosition: -40 },
  { colour: "green", row: 11, col: 1, backgroundYPosition: -80 },
  { colour: "yellow", row: 11, col: 13, backgroundYPosition: -120 },
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
    this.backgroundYPosition = PLAYERS[playerNum].backgroundYPosition;
    this.speed = 1;
    this.colour = PLAYERS[playerNum].colour;
    this.displayName = displayName;
    this.playerNum = playerNum;
    this.numBombs = 1;
    this.bombSize = 3;
    this.lives = 3;
    this.radius = game.grid * 0.35;
    this.timer = 500;
    this.playerInfoDisplay = document.querySelector(
      `#player-info-${playerNum + 1}`
    );

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
    this.playerElement.attrs.style = `top: ${
      this.row * this.game.grid + 2
    }px; left: ${
      this.col * this.game.grid + 6
    }px;background-position: -120.5px ${this.backgroundYPosition}px`;
  }

  render(dt) {
    let count = 0;
    let done = false;
    let rowDirectionOffset = 0;
    let colDirectionOffset = 0;
    let backgroundXPosition = -120.5;

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
        backgroundXPosition = -100.5;
        if (this.col % 2 == 0) backgroundXPosition += 20;
      } else {
        rowDirectionOffset = this.dy < 0 ? 1 : -1;
        count *= this.dy < 0 ? -1 : 1;
        backgroundXPosition = this.dy < 0 ? -20.5 : -140.5;
        if (this.row % 2 == 0) backgroundXPosition += 20;
      }

      this.transformPlayerPosition(
        rowDirectionOffset,
        colDirectionOffset,
        backgroundXPosition,
        count
      );
    }

    if (done || this.timer < 0) {
      this.updatePlayerPosition();
    }

    this.playerInfoDisplay.innerHTML = `Player: ${this.displayName}${"\n"}${
      this.lives >= 0
        ? `Lives: ${this.lives}`
        : `This player placed ${
            this.game.players.filter((p) => p.lives > -1).length + 1
          }`
    }`;
  }

  transformPlayerPosition(
    rowDirectionOffset,
    colDirectionOffset,
    backgroundXPosition,
    count
  ) {
    let axis;
    let flip = "";

    if (rowDirectionOffset !== 0) axis = "Y";
    else if (colDirectionOffset !== 0) axis = "X";

    if (colDirectionOffset < 0 && count > 0) {
      flip = "scaleX(-1) ";
      count *= -1;
    }

    this.playerElement.attrs.style = `top: ${
      (this.row + rowDirectionOffset) * this.game.grid + 2
    }px; left: ${
      (this.col + colDirectionOffset) * this.game.grid + 6
    }px;transform: ${flip}translate${axis}(${count}px);background-position: ${backgroundXPosition}px ${
      this.backgroundYPosition
    }px`;
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
      const powerup = this.game.entities.filter((ent) => {
        return ent.powerup && ent.row === this.row && ent.col === this.col;
      });
      if (powerup.length > 0) {
        this.applyPowerUp(powerup[0]);
        powerup[0].timer = 0;
        socket.send(
          JSON.stringify({
            type: "game_update",
            info: {
              desc: "remove_powerup",
              row: powerup[0].row,
              col: powerup[0].col,
              ptype: powerup[0].powerup.type,
            },
          })
        );
      }
    }
  }

  loseLife() {
    this.lives--;
    if (this.lives < 0) {
      RemoveChildElement(this.game.gameContainer, this.playerElement);
    }
    this.row = this.initRow;
    this.col = this.initCol;
    this.updatePlayerPosition();
  }

  applyPowerUp(powerup) {
    switch (powerup.powerup.type) {
      case "increase_bombs":
        this.numBombs++;
        break;
      case "increased_speed":
        this.speed += 0.2;
        break;
      case "increased_blast_radius":
        this.bombSize++;
        break;

      default:
        break;
    }
  }
}
