const fs = require('fs');
const path = require('path');

function loadBotToken() {
  const envPath = path.resolve(__dirname, '..', '..', '..', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^BOT_TOKEN=(.*)$/m);
  if (!match) {
    throw new Error('BOT_TOKEN not found in ' + envPath);
  }
  return match[1].trim();
}

module.exports = { loadBotToken };
