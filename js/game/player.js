export class Player {
  constructor(row, col, game) {
    this.game = game;
    this.row = row;
    this.col = col;
    this.numBombs = 1;
    this.bombSize = 3;
    this.radius = game.grid * 0.35;

    // Create a player DOM element
    this.playerElement = document.createElement("div");
    this.playerElement.classList.add("player");
    this.updatePlayerPosition();

    // Append the player element to the game container
    this.game.gameContainer.appendChild(this.playerElement);
  }

  // Update the player's position on the DOM
  updatePlayerPosition() {
    this.playerElement.style.top = this.row * this.game.grid + "px";
    this.playerElement.style.left = this.col * this.game.grid + "px";
  }

  render() {
    const x = (this.col + 0.5) * this.game.grid;
    const y = (this.row + 0.5) * this.game.grid;

    this.updatePlayerPosition();
  }
}
