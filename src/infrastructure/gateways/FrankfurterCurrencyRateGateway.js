const { CurrencyRateGateway } = require('../../application/ports/CurrencyRateGateway');

const LATEST_URL = 'https://api.frankfurter.dev/v1/latest';

class FrankfurterCurrencyRateGateway extends CurrencyRateGateway {
  async getRate(code) {
    const res = await fetch(`${LATEST_URL}?base=USD&symbols=${code}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates[code];
  }
}

module.exports = { FrankfurterCurrencyRateGateway };
