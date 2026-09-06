const { CurrencyDirectory } = require('../../application/ports/CurrencyDirectory');

const SUPPORTED_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
  'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'BRL', 'TRY', 'ZAR', 'VND',
]);

const NAME_TO_CODE = {
  'us dollar': 'USD', 'united states dollar': 'USD', 'american dollar': 'USD',
  'euro': 'EUR',
  'british pound': 'GBP', 'pound sterling': 'GBP', 'pound': 'GBP', 'sterling': 'GBP', 'quid': 'GBP',
  'japanese yen': 'JPY', 'yen': 'JPY',
  'australian dollar': 'AUD', 'aussie dollar': 'AUD', 'aussie': 'AUD',
  'canadian dollar': 'CAD', 'loonie': 'CAD',
  'swiss franc': 'CHF', 'franc': 'CHF',
  'chinese yuan': 'CNY', 'yuan': 'CNY', 'renminbi': 'CNY', 'rmb': 'CNY',
  'hong kong dollar': 'HKD',
  'new zealand dollar': 'NZD', 'kiwi': 'NZD',
  'swedish krona': 'SEK', 'krona': 'SEK',
  'south korean won': 'KRW', 'korean won': 'KRW', 'won': 'KRW',
  'singapore dollar': 'SGD',
  'norwegian krone': 'NOK', 'krone': 'NOK',
  'mexican peso': 'MXN', 'peso': 'MXN',
  'indian rupee': 'INR', 'rupee': 'INR',
  'brazilian real': 'BRL', 'real': 'BRL',
  'turkish lira': 'TRY', 'lira': 'TRY',
  'south african rand': 'ZAR', 'rand': 'ZAR',
  'vietnamese dong': 'VND', 'dong': 'VND',
};

class StaticCurrencyDirectory extends CurrencyDirectory {
  async resolveCode(input) {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;

    const upper = trimmed.toUpperCase();
    if (SUPPORTED_CODES.has(upper)) return upper;

    if (NAME_TO_CODE[trimmed]) return NAME_TO_CODE[trimmed];

    // handle simple plurals, e.g. "euros" -> "euro", "dongs" -> "dong"
    if (trimmed.endsWith('s') && NAME_TO_CODE[trimmed.slice(0, -1)]) {
      return NAME_TO_CODE[trimmed.slice(0, -1)];
    }

    return null;
  }
}

module.exports = { StaticCurrencyDirectory };
