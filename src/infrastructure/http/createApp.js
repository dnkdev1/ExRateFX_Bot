const Fastify = require('fastify'); // import Fastify web framework

function createApp({ webhookPath, telegramWebhookController, messagesPageController }) {
  const fastify = Fastify();

  fastify.get('/', messagesPageController);
  // Telegram webhook: Telegram POSTs updates to this route
  fastify.post(webhookPath, telegramWebhookController);

  return fastify;
}

module.exports = { createApp };
