// explosion constructor function
export class Explosion {
  constructor(row, col, dir, center, game) {
    this.game = game;
    this.row = row;
    this.col = col;
    this.dir = dir;
    this.alive = true;

    // Create an explosion container element
    this.explosionElement = document.createElement("div");
    this.explosionElement.classList.add("explosion");
    this.game.gameContainer.appendChild(this.explosionElement);

    // show explosion for 0.3 seconds
    this.timer = 300;

    // update the explosion each frame
    this.update = function (dt) {
      this.timer -= dt;

      if (this.timer <= 0) {
        this.alive = false;
        // Remove the explosion element from the DOM when the explosion is done
        this.explosionElement.remove();
      }
    };

    // Create fire effect by stacking colored elements progressively
    const colors = ["#D72B16", "#F39642", "#FFE5A8"];
    for (let i = 0; i < colors.length; i++) {
      const fireElement = document.createElement("div");
      fireElement.classList.add("fire");
      fireElement.style.backgroundColor = colors[i];

      if (center || (i === 0 && (dir.row || dir.col))) {
        // Only add the innermost fire element for center or horizontal/vertical explosions
        this.explosionElement.appendChild(fireElement);
      }
    }
  }

  // render the explosion each frame
  render() {
    this.updateExplosionPosition();
  }

  // Update the explosion's position on the DOM
  updateExplosionPosition() {
    const x = this.col * this.game.grid;
    const y = this.row * this.game.grid;
    this.explosionElement.style.top = y + "px";
    this.explosionElement.style.left = x + "px";
  }
}
