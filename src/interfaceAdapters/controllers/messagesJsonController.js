function makeMessagesJsonController(listMessagesUseCase) {
  return async function messagesJsonController(req, reply) {
    const messages = await listMessagesUseCase.execute();
    return messages.slice().reverse();
  };
}

module.exports = { makeMessagesJsonController };
