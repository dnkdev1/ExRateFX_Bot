const BOT_DISPLAY_NAME = 'ExRateFX Bot';
const DASHBOARD_COMMANDS = new Set(['/start', '/dashboard', '/app']);

function makeTelegramWebhookController(recordMessageUseCase, answerCurrencyQueryUseCase, messengerGateway, expectedToken) {
  return async function telegramWebhookController(req, reply) {
    if (req.params.token !== expectedToken) {
      return reply.code(404).send();
    }

    const update = req.body;
    console.log(update);

    if (update.message && update.message.text) {
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;
      const text = update.message.text;

      await recordMessageUseCase.execute({
        from: update.message.from.username || update.message.from.first_name,
        text,
        date: new Date(update.message.date * 1000).toISOString(),
        userId,
      });

      if (DASHBOARD_COMMANDS.has(text.trim().toLowerCase())) {
        const dashboardUrl = `https://${req.headers.host}/app`;
        await messengerGateway.sendMessage(chatId, 'Open your live rates and query history:', {
          inline_keyboard: [[{ text: '📊 Open Dashboard', web_app: { url: dashboardUrl } }]],
        });
      } else {
        const answerReply = await answerCurrencyQueryUseCase.execute({ chatId, rawText: text });

        await recordMessageUseCase.execute({
          from: BOT_DISPLAY_NAME,
          text: answerReply,
          date: new Date().toISOString(),
          userId,
        });
      }
    }

    return {};
  };
}

module.exports = { makeTelegramWebhookController };
