const { loadBotToken } = require('./src/infrastructure/config/loadBotToken');
const { InMemoryMessageRepository } = require('./src/infrastructure/repositories/InMemoryMessageRepository');
const { FrankfurterCurrencyDirectory } = require('./src/infrastructure/gateways/FrankfurterCurrencyDirectory');
const { FrankfurterCurrencyRateGateway } = require('./src/infrastructure/gateways/FrankfurterCurrencyRateGateway');
const { TelegramMessengerGateway } = require('./src/infrastructure/gateways/TelegramMessengerGateway');
const { createApp } = require('./src/infrastructure/http/createApp');
const { CloudflareTunnelManager } = require('./src/infrastructure/tunnel/CloudflareTunnelManager');
const { TelegramWebhookRegistrar } = require('./src/infrastructure/gateways/TelegramWebhookRegistrar');

const { RecordMessageUseCase } = require('./src/application/useCases/RecordMessageUseCase');
const { ListMessagesUseCase } = require('./src/application/useCases/ListMessagesUseCase');
const { AnswerCurrencyQueryUseCase } = require('./src/application/useCases/AnswerCurrencyQueryUseCase');

const { makeMessagesPageController } = require('./src/interfaceAdapters/controllers/messagesPageController');
const { makeTelegramWebhookController } = require('./src/interfaceAdapters/controllers/telegramWebhookController');

const token = loadBotToken();
const PORT = process.env.PORT || 3000;
const WEBHOOK_PATH = `/webhook/${token}`;

// infrastructure: concrete implementations of the application ports
const messageRepository = new InMemoryMessageRepository();
const currencyDirectory = new FrankfurterCurrencyDirectory();
const currencyRateGateway = new FrankfurterCurrencyRateGateway();
const messengerGateway = new TelegramMessengerGateway(token);

// application: use cases, wired to their ports
const recordMessageUseCase = new RecordMessageUseCase(messageRepository);
const listMessagesUseCase = new ListMessagesUseCase(messageRepository);
const answerCurrencyQueryUseCase = new AnswerCurrencyQueryUseCase(
  currencyDirectory,
  currencyRateGateway,
  messengerGateway
);

// interface adapters: controllers, wired to their use cases
const app = createApp({
  webhookPath: WEBHOOK_PATH,
  telegramWebhookController: makeTelegramWebhookController(recordMessageUseCase, answerCurrencyQueryUseCase),
  messagesPageController: makeMessagesPageController(listMessagesUseCase),
});

app.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Webhook server listening on port ${PORT}`);

  // brings up a public URL and keeps the Telegram webhook registered against it
  const webhookRegistrar = new TelegramWebhookRegistrar(token);
  const tunnel = new CloudflareTunnelManager({
    port: PORT,
    onUrl: (tunnelUrl) => webhookRegistrar.register(`${tunnelUrl}${WEBHOOK_PATH}`),
  });
  tunnel.start();
});
