class CurrencyRateGateway {
  async getRate(_code) {
    throw new Error('not implemented');
  }

  // returns a map of code -> rate (all relative to the same base currency)
  async getRates(_codes) {
    throw new Error('not implemented');
  }
}

module.exports = { CurrencyRateGateway };
