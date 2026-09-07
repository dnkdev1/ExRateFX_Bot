const { loadBotToken } = require('../src/infrastructure/config/loadBotToken');
const { InMemoryMessageRepository } = require('../src/infrastructure/repositories/InMemoryMessageRepository');
const { StaticCurrencyDirectory } = require('../src/infrastructure/gateways/StaticCurrencyDirectory');
const { ExchangeRateApiGateway } = require('../src/infrastructure/gateways/ExchangeRateApiGateway');
const { TelegramMessengerGateway } = require('../src/infrastructure/gateways/TelegramMessengerGateway');
const { createApp } = require('../src/infrastructure/http/createApp');

const { RecordMessageUseCase } = require('../src/application/useCases/RecordMessageUseCase');
const { ListMessagesUseCase } = require('../src/application/useCases/ListMessagesUseCase');
const { AnswerCurrencyQueryUseCase } = require('../src/application/useCases/AnswerCurrencyQueryUseCase');
const { GetLiveRatesUseCase } = require('../src/application/useCases/GetLiveRatesUseCase');

const { makeMessagesPageController } = require('../src/interfaceAdapters/controllers/messagesPageController');
const { makeMessagesJsonController } = require('../src/interfaceAdapters/controllers/messagesJsonController');
const { makeTelegramWebhookController } = require('../src/interfaceAdapters/controllers/telegramWebhookController');
const {
  makeMiniAppPageController,
  makeRatesJsonController,
  makeMyMessagesJsonController,
} = require('../src/interfaceAdapters/controllers/miniAppController');

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
const getLiveRatesUseCase = new GetLiveRatesUseCase(currencyDirectory, currencyRateGateway);

const app = createApp({
  telegramWebhookController: makeTelegramWebhookController(
    recordMessageUseCase,
    answerCurrencyQueryUseCase,
    messengerGateway,
    token
  ),
  messagesPageController: makeMessagesPageController(listMessagesUseCase),
  messagesJsonController: makeMessagesJsonController(listMessagesUseCase),
  miniAppPageController: makeMiniAppPageController(),
  ratesJsonController: makeRatesJsonController(getLiveRatesUseCase),
  myMessagesJsonController: makeMyMessagesJsonController(listMessagesUseCase, token),
});

const ready = app.ready();

module.exports = async (req, res) => {
  await ready;
  app.server.emit('request', req, res);
};
