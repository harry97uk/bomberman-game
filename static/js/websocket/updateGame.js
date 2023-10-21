import { game } from "../app.js";
import { PowerUp } from "../game/powerup.js";

// Update the game state based on the server's update
export function updateGame(data) {
  // Update the client's game state with the new data from the server
  //starting game or finishing game??
  if (data.desc === "new_powerup") addPowerup(data);
  else if (data.desc === "remove_powerup") removePowerup(data);
}

function addPowerup(data) {
  let found = false;
  for (let i = 0; i < game.entities.length; i++) {
    if (
      game.entities[i].powerup &&
      game.entities[i].row === data.row &&
      game.entities[i].col === data.col
    ) {
      found = true;
      break;
    }
  }
  if (!found) {
    const powerup = new PowerUp(data.row, data.col, game, { type: data.ptype });
    game.entities.push(powerup);
  }
}

function removePowerup(data) {
  const powerup = game.entities.filter((ent) => {
    return (
      ent.powerup &&
      ent.row === data.row &&
      ent.col === data.col &&
      ent.powerup.type === data.ptype
    );
  });
  if (powerup.length > 0) powerup[0].timer = 0;
}
