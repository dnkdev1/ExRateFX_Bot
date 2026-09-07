const { CurrencyRateGateway } = require('../../application/ports/CurrencyRateGateway');
const { CRYPTO_CODES } = require('./StaticCurrencyDirectory');

class CompositeCurrencyRateGateway extends CurrencyRateGateway {
  constructor(fiatGateway, cryptoGateway) {
    super();
    this.fiatGateway = fiatGateway;
    this.cryptoGateway = cryptoGateway;
  }

  async getRates(codes) {
    const fiatCodes = codes.filter((code) => !CRYPTO_CODES.has(code));
    const cryptoCodes = codes.filter((code) => CRYPTO_CODES.has(code));

    const [fiatRates, cryptoRates] = await Promise.all([
      fiatCodes.length ? this.fiatGateway.getRates(fiatCodes) : {},
      cryptoCodes.length ? this.cryptoGateway.getRates(cryptoCodes) : {},
    ]);

    return { ...fiatRates, ...cryptoRates };
  }

  async getRate(code) {
    const rates = await this.getRates([code]);
    return rates[code];
  }
}

module.exports = { CompositeCurrencyRateGateway };
