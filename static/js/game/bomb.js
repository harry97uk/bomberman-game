import CreateElement from "../framework/createElement.js";
import { findElementInVDom } from "../framework/findElemInVdom.js";
import NestElements from "../framework/nestElements.js";
import RemoveChildElement from "../framework/removeElement.js";
import { randomIntFromInterval } from "../helpers/randomInt.js";
import { socket } from "../websocket/websocket.js";
import { Explosion } from "./explosion.js";
import { PowerUp } from "./powerup.js";

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

    //const affectedCell = document.querySelector(`#cell${this.game.cells[this.row][this.col].id}`)
    this.affectedCell = findElementInVDom(this.game.newVDom, "div", {
      id: `${this.game.cells[this.row][this.col].id}`,
    });

    NestElements(this.affectedCell, this.bombElement);

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
  }

  // render the bomb each frame
  render() {
    //console.log("no render needed");
  }

  // blow up a bomb and its surrounding tiles
  blowUpBomb() {
    // bomb has already exploded so don't blow up again
    if (!this.alive) return;

    this.alive = false;

    // remove bomb from grid
    RemoveChildElement(this.affectedCell, this.bombElement);

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

    //players already hit by bomb
    const affectedPlayers = [];

    dirs.forEach((dir) => {
      for (let i = 0; i < this.size; i++) {
        const row = this.row + dir.row * i;
        const col = this.col + dir.col * i;
        const cell = this.game.cells[row][col];
        const initialCellType = cell.type;

        // stop the explosion if it hit a wall
        if (cell.type === this.game.types.wall) {
          return;
        }

        if (cell.type === this.game.types.softWall) {
          if (randomIntFromInterval(0, 4) === 0) {
            const powerups = this.game.entities.filter((ent) => {
              return ent.powerup && ent.row === row && ent.col === col;
            });
            if (powerups.length === 0) {
              const powerup = new PowerUp(row, col, this.game);
              this.game.entities.push(powerup);
              socket.send(
                JSON.stringify({
                  type: "game_update",
                  info: {
                    desc: "new_powerup",
                    row: powerup.row,
                    col: powerup.col,
                    ptype: powerup.powerup.type,
                  },
                })
              );
            }
          }
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
        if (
          (row !== this.row || col !== this.col) &&
          initialCellType === this.game.types.bomb
        ) {
          // find the bomb that was hit by comparing positions
          const nextBomb = this.game.entities.find((entity) => {
            return (
              entity.type === this.game.types.bomb &&
              entity.row === row &&
              entity.col === col
            );
          });
          nextBomb.blowUpBomb();
        }

        // stop the explosion if hit anything
        if (initialCellType !== "space" && initialCellType !== 2) {
          return;
        }

        this.game.players.forEach((player) => {
          if (affectedPlayers.includes(player.playerNum)) return;
          if (player.row === row && player.col === col) {
            player.loseLife();
            affectedPlayers.push(player.playerNum);
          }
        });
      }
    });
  }
}
