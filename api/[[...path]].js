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

  if (req.url.startsWith('/api/__debug')) {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ url: req.url, method: req.method, query: req.query || null }));
    return;
  }

  // vercel.json rewrites every request to /api/<original path>, and Vercel
  // sets req.url to that rewritten destination rather than the original
  // request path. Strip the /api prefix back off before handing the
  // request to Fastify's own router.
  req.url = req.url.replace(/^\/api/, '') || '/';

  app.server.emit('request', req, res);
};
