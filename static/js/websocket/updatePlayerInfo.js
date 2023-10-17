export function updatePlayersInformation(msg) {
  const playersNameDisplay = document.getElementById("game-players");
  const playersNameArray = msg.data.players;
  const totalPlayersCount = msg.data.number_of_players;

  playersNameDisplay.innerText = `Total Players: ${totalPlayersCount}` + "\n";
  playersNameDisplay.innerText += playersNameArray.join("\n");
  setPlayers(playersNameArray);
}
