import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";

export class Player {
  constructor(row, col, game) {
    this.game = game;
    this.row = row;
    this.col = col;
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
    this.playerElement.attrs.style = `top: ${
      this.row * this.game.grid
    }px; left: ${this.col * this.game.grid}px;`;
  }

  render() {
    this.updatePlayerPosition();
  }
}
