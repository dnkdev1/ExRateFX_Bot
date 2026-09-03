const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnvToken() {
  const envPath = path.resolve(__dirname, '..', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^BOT_TOKEN=(.*)$/m);
  if (!match) {
    throw new Error('BOT_TOKEN not found in ' + envPath);
  }
  return match[1].trim();
}

const token = loadEnvToken();

function getUpdates(offset) {
  const url = `https://api.telegram.org/bot${token}/getUpdates?timeout=30&offset=${offset}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (err) {
        console.error('Failed to parse response:', data);
        return getUpdates(offset);
      }

      if (!parsed.ok) {
        console.error('Telegram API error:', parsed);
        return setTimeout(() => getUpdates(offset), 1000);
      }

      let nextOffset = offset;
      for (const update of parsed.result) {
        console.log(update);
        nextOffset = update.update_id + 1;
      }

      getUpdates(nextOffset);
    });
  }).on('error', (err) => {
    console.error('Request error:', err.message);
    setTimeout(() => getUpdates(offset), 1000);
  });
}

console.log('Bot started, polling for updates...');
getUpdates(0);
