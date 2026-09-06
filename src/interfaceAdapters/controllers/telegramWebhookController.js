function makeTelegramWebhookController(recordMessageUseCase, answerCurrencyQueryUseCase, expectedToken) {
  return async function telegramWebhookController(req, reply) {
    if (req.params.token !== expectedToken) {
      return reply.code(404).send();
    }

    const update = req.body;
    console.log(update);

    if (update.message && update.message.text) {
      await recordMessageUseCase.execute({
        from: update.message.from.username || update.message.from.first_name,
        text: update.message.text,
        date: new Date(update.message.date * 1000).toISOString(),
      });

      await answerCurrencyQueryUseCase.execute({
        chatId: update.message.chat.id,
        rawText: update.message.text,
      });
    }

    return {};
  };
}

module.exports = { makeTelegramWebhookController };
