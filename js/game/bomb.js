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
    this.bombElement = document.createElement("div");
    this.bombElement.classList.add("bomb");
    this.bombElement.innerText = "3";

    this.game.gameContainer.appendChild(this.bombElement);

    // bomb blows up after 3 seconds
    this.timer = 3000;
  }

  // update the bomb each frame
  update(dt) {
    this.timer -= dt;

    // blow up bomb if timer is done
    if (this.timer <= 0) {
      return blowUpBomb(this);
    }

    if (this.timer < 2000 && this.timer > 1000) {
      this.bombElement.innerText = "2";
    } else if (this.timer < 1000) {
      this.bombElement.innerText = "1";
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
    this.bombElement.style.top = y + "px";
    this.bombElement.style.left = x + "px";
  }
}

// blow up a bomb and its surrounding tiles
function blowUpBomb(bomb) {
  // bomb has already exploded so don't blow up again
  if (!bomb.alive) return;

  bomb.alive = false;

  // remove bomb from grid
  bomb.bombElement.remove();

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
    for (let i = 0; i < bomb.size; i++) {
      const row = bomb.row + dir.row * i;
      const col = bomb.col + dir.col * i;
      const cell = bomb.game.cells[row][col];

      // stop the explosion if it hit a wall
      if (cell.type === bomb.game.types.wall) {
        return;
      }

      if (cell.type !== bomb.game.types.wall) {
        const cellElement = document.querySelector("#" + cell.id);
        cellElement.classList.remove("soft-wall");
        cellElement.classList.add("space");
        cell.type = "space";
      }

      // center of the explosion is the first iteration of the loop
      bomb.game.entities.push(
        new Explosion(row, col, dir, i === 0 ? true : false, bomb.game)
      );

      // bomb hit another bomb so blow that one up too
      if (cell === bomb.game.types.bomb) {
        // find the bomb that was hit by comparing positions
        const nextBomb = bomb.game.entities.find((entity) => {
          return (
            entity.type === bomb.game.types.bomb &&
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
