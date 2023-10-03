import { Explosion } from "./explosion.js";

// bomb constructor function
export class Bomb {
  constructor(row, col, size, owner, grid) {
    this.row = row;
    this.col = col;
    this.radius = grid * 0.4;
    this.size = size; // the size of the explosion
    this.owner = owner; // which player placed this bomb
    this.alive = true;
    this.type = types.bomb;

    // bomb blows up after 3 seconds
    this.timer = 3000;

    // update the bomb each frame
    this.update = function (dt) {
      this.timer -= dt;

      // blow up bomb if timer is done
      if (this.timer <= 0) {
        return blowUpBomb(this);
      }

      // change the size of the bomb every half second. we can determine the size
      // by dividing by 500 (half a second) and taking the ceiling of the result.
      // then we can check if the result is even or odd and change the size
      const interval = Math.ceil(this.timer / 500);
      if (interval % 2 === 0) {
        this.radius = grid * 0.4;
      } else {
        this.radius = grid * 0.5;
      }
    };

    // render the bomb each frame
    this.render = function () {
      const x = (this.col + 0.5) * grid;
      const y = (this.row + 0.5) * grid;

      // draw bomb
      context.fillStyle = "black";
      context.beginPath();
      context.arc(x, y, this.radius, 0, 2 * Math.PI);
      context.fill();

      // draw bomb fuse moving up and down with the bomb size
      const fuseY = this.radius === grid * 0.5 ? grid * 0.15 : 0;
      context.strokeStyle = "white";
      context.lineWidth = 5;
      context.beginPath();
      context.arc(
        (this.col + 0.75) * grid,
        (this.row + 0.25) * grid - fuseY,
        10,
        Math.PI,
        -Math.PI / 2
      );
      context.stroke();
    };
  }
}

// blow up a bomb and its surrounding tiles
function blowUpBomb(bomb) {
  // bomb has already exploded so don't blow up again
  if (!bomb.alive) return;

  bomb.alive = false;

  // remove bomb from grid
  cells[bomb.row][bomb.col] = null;

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
      const cell = cells[row][col];

      // stop the explosion if it hit a wall
      if (cell === types.wall) {
        return;
      }

      // center of the explosion is the first iteration of the loop
      entities.push(new Explosion(row, col, dir, i === 0 ? true : false));
      cells[row][col] = null;

      // bomb hit another bomb so blow that one up too
      if (cell === types.bomb) {
        // find the bomb that was hit by comparing positions
        const nextBomb = entities.find((entity) => {
          return (
            entity.type === types.bomb &&
            entity.row === row &&
            entity.col === col
          );
        });
        blowUpBomb(nextBomb);
      }

      // stop the explosion if hit anything
      if (cell) {
        return;
      }
    }
  });
}
