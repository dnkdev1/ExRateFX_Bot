const Fastify = require('fastify'); // import Fastify web framework

function createApp({
  telegramWebhookController,
  messagesPageController,
  messagesJsonController,
  miniAppPageController,
  ratesJsonController,
  myMessagesJsonController,
}) {
  const fastify = Fastify();

  fastify.get('/', messagesPageController);
  fastify.get('/messages.json', messagesJsonController);
  fastify.get('/app', miniAppPageController);
  fastify.get('/rates.json', ratesJsonController);
  fastify.get('/my-messages.json', myMessagesJsonController);
  // Telegram webhook: Telegram POSTs updates to this route. The token is
  // matched as a route param (not baked into the path string) because it
  // contains a colon, which Fastify's router would otherwise parse as the
  // start of a parametric segment.
  fastify.post('/webhook/:token', telegramWebhookController);

  return fastify;
}

module.exports = { createApp };
