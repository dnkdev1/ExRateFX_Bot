const MAX_ATTEMPTS = 8;

class TelegramWebhookRegistrar {
  constructor(botToken) {
    this.botToken = botToken;
  }

  async register(webhookUrl, attempt = 1) {
    const res = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json();

    if (!data.ok && attempt < MAX_ATTEMPTS) {
      const delay = Math.min(5000 * attempt, 30000);
      console.log(`[webhook] setWebhook attempt ${attempt} failed (${data.description}), retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.register(webhookUrl, attempt + 1);
    }

    console.log('[webhook] setWebhook ->', data);
    return data;
  }
}

module.exports = { TelegramWebhookRegistrar };
