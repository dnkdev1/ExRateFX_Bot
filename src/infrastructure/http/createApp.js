const Fastify = require('fastify'); // import Fastify web framework

function createApp({ telegramWebhookController, messagesPageController }) {
  const fastify = Fastify();

  fastify.get('/', messagesPageController);
  // Telegram webhook: Telegram POSTs updates to this route. The token is
  // matched as a route param (not baked into the path string) because it
  // contains a colon, which Fastify's router would otherwise parse as the
  // start of a parametric segment.
  fastify.post('/webhook/:token', telegramWebhookController);

  return fastify;
}

module.exports = { createApp };
