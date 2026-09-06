class MessengerGateway {
  async sendMessage(_chatId, _text) {
    throw new Error('not implemented');
  }
}

module.exports = { MessengerGateway };
