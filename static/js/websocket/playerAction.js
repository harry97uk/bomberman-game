import { game } from "../app.js";

// Handle actions from other players (e.g., move, place bomb)
export function handlePlayerAction(actionData) {
  // Apply the action to the client's game state
  game.registerPlayerAction(actionData.player_number, actionData.player_action);
}
