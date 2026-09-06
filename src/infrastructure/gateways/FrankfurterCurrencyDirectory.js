const { CurrencyDirectory } = require('../../application/ports/CurrencyDirectory');

const CURRENCIES_URL = 'https://api.frankfurter.dev/v1/currencies';

class FrankfurterCurrencyDirectory extends CurrencyDirectory {
  constructor() {
    super();
    this.nameToCode = null;
  }

  async resolveCode(input) {
    if (!this.nameToCode) {
      const res = await fetch(CURRENCIES_URL);
      const currencies = await res.json();
      this.nameToCode = new Map();
      for (const [code, name] of Object.entries(currencies)) {
        this.nameToCode.set(code.toLowerCase(), code);
        this.nameToCode.set(name.toLowerCase(), code);
      }
    }
    return this.nameToCode.get(input.trim().toLowerCase()) || null;
  }
}

module.exports = { FrankfurterCurrencyDirectory };
