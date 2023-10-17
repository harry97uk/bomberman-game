import RemoveChildElement from "../framework/removeElement.js";
import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import { randomIntFromInterval } from "../helpers/randomInt.js";

const POWERUPS = [
  { type: "increase_bombs" },
  { type: "increased_speed" },
  { type: "increased_blast_radius" },
];

export class PowerUp {
  constructor(row, col, game, ptype = null) {
    console.log("powerup created");
    this.alive = true;
    this.row = row;
    this.col = col;
    this.game = game;
    this.powerup = ptype ? ptype : POWERUPS[randomIntFromInterval(0, 2)];
    this.timer = 5000;

    const x = this.col * this.game.grid;
    const y = this.row * this.game.grid;

    this.powerupElement = CreateElement("div", {
      attrs: {
        class: `${this.powerup.type} powerup`,
        style: `top: ${y + this.game.grid / 4}px; left: ${
          x + this.game.grid / 4
        }px;`,
      },
    });

    NestElements(this.game.gameContainer, this.powerupElement);
  }

  update(dt) {
    this.timer -= dt;
    if (!this.alive || this.timer < 0) {
      this.alive = false;
      RemoveChildElement(this.game.gameContainer, this.powerupElement);
    }
  }

  // render the bomb each frame
  render() {
    //console.log("no render needed");
  }

  // Update the bomb's position on the DOM
  updatePowerUpPosition() {}
}
