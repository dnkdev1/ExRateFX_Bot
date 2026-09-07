const { CurrencyDirectory } = require('../../application/ports/CurrencyDirectory');

const SUPPORTED_CODES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
  'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'BRL', 'TRY', 'ZAR', 'VND',
]);

const NAME_TO_CODE = {
  'us dollar': 'USD', 'united states dollar': 'USD', 'american dollar': 'USD', 'dollar': 'USD',
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

// Russian is heavily declined (доллар/доллара/долларов/долларами/...), so instead of
// listing every case ending we match on a stem. Currencies that share a bare stem in
// Russian (e.g. "доллар" for USD/AUD/CAD/HKD/NZD/SGD, "крон" for SEK/NOK) need a more
// specific qualifier word checked first; the bare stem then falls back to the most
// common currency for that word.
const RU_QUALIFIED_STEMS = [
  ['австрал', 'AUD'],
  ['канад', 'CAD'],
  ['гонконг', 'HKD'],
  ['новозеланд', 'NZD'],
  ['сингапур', 'SGD'],
  ['американск', 'USD'],
  ['швед', 'SEK'],
  ['норвеж', 'NOK'],
  ['южноафрикан', 'ZAR'],
  ['южно-африкан', 'ZAR'],
  ['южнокорейск', 'KRW'],
];

const RU_BARE_STEMS = [
  ['доллар', 'USD'],
  ['евро', 'EUR'],
  ['фунт', 'GBP'],
  ['стерлинг', 'GBP'],
  ['иен', 'JPY'],
  ['йен', 'JPY'],
  ['франк', 'CHF'],
  ['юан', 'CNY'],
  ['крон', 'SEK'],
  ['вон', 'KRW'],
  ['песо', 'MXN'],
  ['руп', 'INR'],
  ['реал', 'BRL'],
  ['лир', 'TRY'],
  ['рэнд', 'ZAR'],
  ['ранд', 'ZAR'],
  ['донг', 'VND'],
  ['киви', 'NZD'],
];

function resolveRussian(lower) {
  const normalized = lower.replace(/ё/g, 'е');
  if (!/[а-я]/.test(normalized)) return null;

  for (const [stem, code] of RU_QUALIFIED_STEMS) {
    if (normalized.includes(stem)) return code;
  }
  for (const [stem, code] of RU_BARE_STEMS) {
    if (normalized.includes(stem)) return code;
  }
  return null;
}

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

    return resolveRussian(trimmed);
  }
}

module.exports = { StaticCurrencyDirectory };
