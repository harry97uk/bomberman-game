import CreateElement from "../framework/createElement.js";
import { findElementInVDom } from "../framework/findElemInVdom.js";
import NestElements from "../framework/nestElements.js";
import RemoveChildElement from "../framework/removeElement.js";
import { Explosion } from "./explosion.js";

// bomb constructor function
export class Bomb {
  constructor(row, col, size, owner, game) {
    this.game = game;
    this.row = row;
    this.col = col;
    this.radius = this.game.grid * 0.4;
    this.size = size; // the size of the explosion
    this.owner = owner; // which player placed this bomb
    this.alive = true;
    this.type = this.game.types.bomb;

    // Create a bomb DOM element
    this.bombElement = CreateElement("div", {
      attrs: { class: "bomb" },
      children: ["3"],
    });

    NestElements(this.game.gameContainer, this.bombElement);

    // bomb blows up after 3 seconds
    this.timer = 3000;
  }

  // update the bomb each frame
  update(dt) {
    this.timer -= dt;

    // blow up bomb if timer is done
    if (this.timer <= 0) {
      return this.blowUpBomb();
    }

    if (this.timer < 2000 && this.timer > 1000) {
      this.bombElement.children = ["2"];
    } else if (this.timer < 1000) {
      this.bombElement.children = ["1"];
    }

    // change the size of the bomb every half second. we can determine the size
    // by dividing by 500 (half a second) and taking the ceiling of the result.
    // then we can check if the result is even or odd and change the size
    const interval = Math.ceil(this.timer / 500);
    if (interval % 2 === 0) {
      this.radius = this.game.grid * 0.4;
    } else {
      this.radius = this.game.grid * 0.5;
    }
  }

  // render the bomb each frame
  render() {
    this.updateBombPosition();
  }

  // Update the bomb's position on the DOM
  updateBombPosition() {
    const x = this.col * this.game.grid;
    const y = this.row * this.game.grid;
    this.bombElement.attrs.style = `top: ${y}px; left: ${x}px;`;
  }

  // blow up a bomb and its surrounding tiles
  blowUpBomb() {
    // bomb has already exploded so don't blow up again
    if (!this.alive) return;

    this.alive = false;

    // remove bomb from grid
    RemoveChildElement(this.game.gameContainer, this.bombElement);

    // explode bomb outward by size
    const dirs = [
      {
        // up
        row: -1,
        col: 0,
      },
      {
        // down
        row: 1,
        col: 0,
      },
      {
        // left
        row: 0,
        col: -1,
      },
      {
        // right
        row: 0,
        col: 1,
      },
    ];
    dirs.forEach((dir) => {
      for (let i = 0; i < this.size; i++) {
        const row = this.row + dir.row * i;
        const col = this.col + dir.col * i;
        const cell = this.game.cells[row][col];

        // stop the explosion if it hit a wall
        if (cell.type === this.game.types.wall) {
          return;
        }

        if (cell.type !== this.game.types.wall) {
          const cellElement = findElementInVDom(this.game.newVDom, "div", {
            id: `${cell.id}`,
          });
          cellElement.attrs.class = "space";
          cell.type = "space";
        }

        // center of the explosion is the first iteration of the loop
        this.game.entities.push(
          new Explosion(row, col, dir, i === 0 ? true : false, this.game)
        );

        // bomb hit another bomb so blow that one up too
        if (cell === this.game.types.bomb) {
          // find the bomb that was hit by comparing positions
          const nextBomb = this.game.entities.find((entity) => {
            return (
              entity.type === this.game.types.bomb &&
              entity.row === row &&
              entity.col === col
            );
          });
          blowUpBomb(nextBomb);
        }

        // stop the explosion if hit anything
        if (cell.type !== "space") {
          return;
        }
      }
    });
  }
}
