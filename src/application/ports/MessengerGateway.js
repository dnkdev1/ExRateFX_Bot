class MessengerGateway {
  async sendMessage(_chatId, _text, _replyMarkup) {
    throw new Error('not implemented');
  }
}

module.exports = { MessengerGateway };
