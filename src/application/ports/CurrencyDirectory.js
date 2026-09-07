class CurrencyDirectory {
  // resolves a currency name or code (e.g. "euro" or "EUR") to its ISO code
  async resolveCode(_input) {
    throw new Error('not implemented');
  }

  // lists every ISO code this directory can resolve
  async listSupportedCodes() {
    throw new Error('not implemented');
  }
}

module.exports = { CurrencyDirectory };
