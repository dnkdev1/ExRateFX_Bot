const crypto = require('crypto');

// verifies the initData string a Telegram Mini App sends with each request,
// per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// returns the authenticated Telegram user, or null if the signature is missing/invalid
function verifyTelegramInitData(initData, botToken) {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const expected = Buffer.from(computedHash, 'hex');
  const actual = Buffer.from(hash, 'hex');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  const userJson = params.get('user');
  return userJson ? JSON.parse(userJson) : null;
}

module.exports = { verifyTelegramInitData };
