export function handleChatMessages(msg) {
  const gameChat = document.getElementById("game-chat");
  const gameChatLength = gameChat.children.length - 1;

  const chats = msg.data.chat_messages.map((message) => {
    const messageEl = document.createElement("div");
    messageEl.innerText = `${message.Sender}: ${message.Message}`;
    messageEl.classList.add("chat-message");
    return messageEl;
  });

  for (let i = gameChatLength; i < chats.length; i++) {
    if (gameChat.children.length > 1) {
      gameChat.insertBefore(chats[i], gameChat.childNodes[2]);
    } else {
      gameChat.appendChild(chats[i]);
    }
  }
}
