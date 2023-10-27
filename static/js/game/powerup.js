import RemoveChildElement from "../framework/removeElement.js";
import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import { randomIntFromInterval } from "../helpers/randomInt.js";
import { findElementInVDom } from "../framework/findElemInVdom.js";

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

    this.affectedCell = findElementInVDom(this.game.newVDom, "div", {
      id: `${this.game.cells[this.row][this.col].id}`,
    });

    this.powerupElement = CreateElement("div", {
      attrs: {
        class: `${this.powerup.type} powerup`,
      },
    });

    NestElements(this.affectedCell, this.powerupElement);
  }

  update(dt) {
    this.timer -= dt;
    if (!this.alive || this.timer < 0) {
      this.alive = false;
      RemoveChildElement(this.affectedCell, this.powerupElement);
    }
  }

  // render the bomb each frame
  render() {
    //console.log("no render needed");
  }
}
