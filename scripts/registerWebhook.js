const { loadBotToken } = require('../src/infrastructure/config/loadBotToken');
const { TelegramWebhookRegistrar } = require('../src/infrastructure/gateways/TelegramWebhookRegistrar');

const deploymentUrl = process.argv[2];
if (!deploymentUrl) {
  console.error('Usage: node scripts/registerWebhook.js https://your-app.vercel.app');
  process.exit(1);
}

const token = loadBotToken();
const webhookUrl = `${deploymentUrl.replace(/\/$/, '')}/webhook/${token}`;

new TelegramWebhookRegistrar(token).register(webhookUrl).then((data) => {
  process.exit(data.ok ? 0 : 1);
});
