// explosion constructor function
export class Explosion {
  constructor(row, col, dir, center) {
    this.row = row;
    this.col = col;
    this.dir = dir;
    this.alive = true;

    // show explosion for 0.3 seconds
    this.timer = 300;

    // update the explosion each frame
    this.update = function (dt) {
      this.timer -= dt;

      if (this.timer <= 0) {
        this.alive = false;
      }
    };

    // render the explosion each frame
    this.render = function () {
      const x = this.col * grid;
      const y = this.row * grid;
      const horizontal = this.dir.col;
      const vertical = this.dir.row;

      // create a fire effect by stacking red, orange, and yellow on top of
      // each other using progressively smaller rectangles
      context.fillStyle = "#D72B16"; // red
      context.fillRect(x, y, grid, grid);

      context.fillStyle = "#F39642"; // orange

      // determine how to draw based on if it's vertical or horizontal
      // center draws both ways
      if (center || horizontal) {
        context.fillRect(x, y + 6, grid, grid - 12);
      }
      if (center || vertical) {
        context.fillRect(x + 6, y, grid - 12, grid);
      }

      context.fillStyle = "#FFE5A8"; // yellow

      if (center || horizontal) {
        context.fillRect(x, y + 12, grid, grid - 24);
      }
      if (center || vertical) {
        context.fillRect(x + 12, y, grid - 24, grid);
      }
    };
  }
}
