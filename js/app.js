import CreateElement from "./framework/createElement.js";
import Mount from "./framework/mount.js";
import Render from "./framework/render.js";
import { Game } from "./game/game.js";

const $app = Render(
  CreateElement("div", {
    attrs: { id: "bomberman-dom-app" },
    children: [CreateElement("div", { attrs: { id: "game" } })],
  })
);

let $rootEl = Mount($app, document.querySelector("#bomberman-dom-app"));

const template = [
  ["▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉"],
  ["▉", "x", "x", , , , , , , , , , "x", "x", "▉"],
  ["▉", "x", "▉", , "▉", , "▉", , "▉", , "▉", , "▉", "x", "▉"],
  ["▉", "x", , , , , , , , , , , , "x", "▉"],
  ["▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉"],
  ["▉", , , , , , , , , , , , , , "▉"],
  ["▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉"],
  ["▉", , , , , , , , , , , , , , "▉"],
  ["▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉", , "▉"],
  ["▉", "x", , , , , , , , , , , , "x", "▉"],
  ["▉", "x", "▉", , "▉", , "▉", , "▉", , "▉", , "▉", "x", "▉"],
  ["▉", "x", "x", , , , , , , , , , "x", "x", "▉"],
  ["▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉", "▉"],
];

const game = new Game();
const boundLoop = game.loop.bind(game); // Bind the loop method to the game instance

game.generateLevel(template);
requestAnimationFrame(boundLoop);
