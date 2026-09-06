const { loadBotToken } = require('../src/infrastructure/config/loadBotToken');
const { InMemoryMessageRepository } = require('../src/infrastructure/repositories/InMemoryMessageRepository');
const { StaticCurrencyDirectory } = require('../src/infrastructure/gateways/StaticCurrencyDirectory');
const { ExchangeRateApiGateway } = require('../src/infrastructure/gateways/ExchangeRateApiGateway');
const { TelegramMessengerGateway } = require('../src/infrastructure/gateways/TelegramMessengerGateway');
const { createApp } = require('../src/infrastructure/http/createApp');

const { RecordMessageUseCase } = require('../src/application/useCases/RecordMessageUseCase');
const { ListMessagesUseCase } = require('../src/application/useCases/ListMessagesUseCase');
const { AnswerCurrencyQueryUseCase } = require('../src/application/useCases/AnswerCurrencyQueryUseCase');

const { makeMessagesPageController } = require('../src/interfaceAdapters/controllers/messagesPageController');
const { makeTelegramWebhookController } = require('../src/interfaceAdapters/controllers/telegramWebhookController');

const token = loadBotToken();

// infrastructure: concrete implementations of the application ports.
// No tunnel and no webhook self-registration here: Vercel already provides
// a public URL, and a serverless function must not register a webhook on
// every cold start. Run scripts/registerWebhook.js once per deployment URL.
const messageRepository = new InMemoryMessageRepository();
const currencyDirectory = new StaticCurrencyDirectory();
const currencyRateGateway = new ExchangeRateApiGateway();
const messengerGateway = new TelegramMessengerGateway(token);

const recordMessageUseCase = new RecordMessageUseCase(messageRepository);
const listMessagesUseCase = new ListMessagesUseCase(messageRepository);
const answerCurrencyQueryUseCase = new AnswerCurrencyQueryUseCase(
  currencyDirectory,
  currencyRateGateway,
  messengerGateway
);

const app = createApp({
  telegramWebhookController: makeTelegramWebhookController(recordMessageUseCase, answerCurrencyQueryUseCase, token),
  messagesPageController: makeMessagesPageController(listMessagesUseCase),
});

const ready = app.ready();

module.exports = async (req, res) => {
  await ready;

  // Vercel rewrites everything to this catch-all function; the true path
  // isn't reliably preserved on req.url, but the matched segments always
  // are, via req.query.path. Rebuild req.url from those before handing the
  // request to Fastify's own router.
  const { path } = req.query;
  req.url = '/' + (Array.isArray(path) ? path.join('/') : path || '');

  app.server.emit('request', req, res);
};
