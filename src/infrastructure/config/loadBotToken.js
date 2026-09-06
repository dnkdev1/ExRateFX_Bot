const fs = require('fs');
const path = require('path');

function loadBotToken() {
  if (process.env.BOT_TOKEN) {
    return process.env.BOT_TOKEN.trim();
  }

  const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^BOT_TOKEN=(.*)$/m);
  if (!match) {
    throw new Error('BOT_TOKEN not found in ' + envPath);
  }
  return match[1].trim();
}

module.exports = { loadBotToken };
