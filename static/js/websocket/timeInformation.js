export function handleTimeInformation(msg) {
  const timer = msg.data.time_value;
  const timeType = msg.data.time_type;
  const gameTimer = document.querySelector("#game-timer");

  gameTimer.innerHTML = `${
    timeType === "joining" ? "Joining ends in" : "Starting game in"
  } ${timer}`;
}
