const { loadBotToken } = require('./src/infrastructure/config/loadBotToken');
const { InMemoryMessageRepository } = require('./src/infrastructure/repositories/InMemoryMessageRepository');
const { StaticCurrencyDirectory } = require('./src/infrastructure/gateways/StaticCurrencyDirectory');
const { ExchangeRateApiGateway } = require('./src/infrastructure/gateways/ExchangeRateApiGateway');
const { CoinGeckoRateGateway } = require('./src/infrastructure/gateways/CoinGeckoRateGateway');
const { CompositeCurrencyRateGateway } = require('./src/infrastructure/gateways/CompositeCurrencyRateGateway');
const { TelegramMessengerGateway } = require('./src/infrastructure/gateways/TelegramMessengerGateway');
const { createApp } = require('./src/infrastructure/http/createApp');
const { CloudflareTunnelManager } = require('./src/infrastructure/tunnel/CloudflareTunnelManager');
const { TelegramWebhookRegistrar } = require('./src/infrastructure/gateways/TelegramWebhookRegistrar');

const { RecordMessageUseCase } = require('./src/application/useCases/RecordMessageUseCase');
const { ListMessagesUseCase } = require('./src/application/useCases/ListMessagesUseCase');
const { AnswerCurrencyQueryUseCase } = require('./src/application/useCases/AnswerCurrencyQueryUseCase');
const { GetLiveRatesUseCase } = require('./src/application/useCases/GetLiveRatesUseCase');

const { makeMessagesPageController } = require('./src/interfaceAdapters/controllers/messagesPageController');
const { makeMessagesJsonController } = require('./src/interfaceAdapters/controllers/messagesJsonController');
const { makeTelegramWebhookController } = require('./src/interfaceAdapters/controllers/telegramWebhookController');
const {
  makeMiniAppPageController,
  makeRatesJsonController,
  makeMyMessagesJsonController,
} = require('./src/interfaceAdapters/controllers/miniAppController');

const token = loadBotToken();
const PORT = process.env.PORT || 3000;
const WEBHOOK_PATH = `/webhook/${token}`; // used only to build the public URL registered with Telegram

// infrastructure: concrete implementations of the application ports
const messageRepository = new InMemoryMessageRepository();
const currencyDirectory = new StaticCurrencyDirectory();
const currencyRateGateway = new CompositeCurrencyRateGateway(new ExchangeRateApiGateway(), new CoinGeckoRateGateway());
const messengerGateway = new TelegramMessengerGateway(token);

// application: use cases, wired to their ports
const recordMessageUseCase = new RecordMessageUseCase(messageRepository);
const listMessagesUseCase = new ListMessagesUseCase(messageRepository);
const answerCurrencyQueryUseCase = new AnswerCurrencyQueryUseCase(
  currencyDirectory,
  currencyRateGateway,
  messengerGateway
);
const getLiveRatesUseCase = new GetLiveRatesUseCase(currencyDirectory, currencyRateGateway);

// interface adapters: controllers, wired to their use cases
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

app.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Webhook server listening on port ${PORT}`);

  if (process.env.VERCEL) {
    return;
  }

  // local dev only: brings up a public URL and keeps the Telegram webhook
  // registered against it. On Vercel there's already a public URL, and
  // scripts/registerWebhook.js handles registration instead.
  const webhookRegistrar = new TelegramWebhookRegistrar(token);
  const tunnel = new CloudflareTunnelManager({
    port: PORT,
    onUrl: (tunnelUrl) => webhookRegistrar.register(`${tunnelUrl}${WEBHOOK_PATH}`),
  });
  tunnel.start();
});
