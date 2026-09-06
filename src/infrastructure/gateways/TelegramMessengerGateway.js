const { MessengerGateway } = require('../../application/ports/MessengerGateway');

class TelegramMessengerGateway extends MessengerGateway {
  constructor(botToken) {
    super();
    this.botToken = botToken;
  }

  async sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  }
}

module.exports = { TelegramMessengerGateway };
