import CreateElement from "../framework/createElement.js";
import NestElements from "../framework/nestElements.js";
import RemoveChildElement from "../framework/removeElement.js";

// explosion constructor function
export class Explosion {
  constructor(row, col, dir, center, game) {
    this.game = game;
    this.row = row;
    this.col = col;
    this.dir = dir;
    this.alive = true;

    const x = this.col * this.game.grid;
    const y = this.row * this.game.grid;

    // Create an explosion container element
    this.explosionElement = CreateElement("div", {
      attrs: { class: "explosion", style: `top: ${y}px; left: ${x}px;` },
    });

    NestElements(this.game.gameContainer, this.explosionElement);

    // show explosion for 0.3 seconds
    this.timer = 300;

    // Create fire effect by stacking colored elements progressively
    const colors = ["#D72B16", "#F39642", "#FFE5A8"];
    for (let i = 0; i < colors.length; i++) {
      const fireElement = CreateElement("div", {
        attrs: {
          class: "fire",
          style: `background-color: ${colors[i]};`,
        },
      });

      if (center || (i === 0 && (dir.row || dir.col))) {
        // Only add the innermost fire element for center or horizontal/vertical explosions
        NestElements(
          this.explosionElement,
          fireElement,
          this.explosionElement.children.length
        );
      }
    }
  }

  update(dt) {
    this.timer -= dt;

    if (this.timer <= 0) {
      this.alive = false;
      // Remove the explosion element from the DOM when the explosion is done
      RemoveChildElement(this.game.gameContainer, this.explosionElement);
    }
  }

  // render the explosion each frame
  render() {
    //console.log("no render needed");
  }
}
