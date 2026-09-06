function splitSourceAndTarget(rawText) {
  const match = rawText.trim().match(/^(.*?)\s+(?:in|to)\s+(.+)$/i);
  if (!match) {
    return { sourcePart: rawText.trim(), targetPart: null };
  }

  const [, sourcePart, targetPart] = match;
  return { sourcePart, targetPart };
}

function parseAmountAndCurrency(sourcePart) {
  const match = sourcePart.match(/^(\d+(?:[.,]\d+)?)\s*(.+)$/);
  if (!match) {
    return { amountLabel: '1', amount: 1, currencyText: sourcePart };
  }

  const [, amountLabel, currencyText] = match;
  return { amountLabel, amount: parseFloat(amountLabel.replace(',', '.')), currencyText };
}

class AnswerCurrencyQueryUseCase {
  constructor(currencyDirectory, currencyRateGateway, messengerGateway) {
    this.currencyDirectory = currencyDirectory;
    this.currencyRateGateway = currencyRateGateway;
    this.messengerGateway = messengerGateway;
  }

  async execute({ chatId, rawText }) {
    const { sourcePart, targetPart } = splitSourceAndTarget(rawText);
    const { amountLabel, amount, currencyText } = parseAmountAndCurrency(sourcePart);

    const sourceCode = await this.currencyDirectory.resolveCode(currencyText);
    const targetCode = targetPart
      ? await this.currencyDirectory.resolveCode(targetPart)
      : 'USD';

    const rates = sourceCode && targetCode
      ? await this.currencyRateGateway.getRates([sourceCode, targetCode])
      : {};
    const sourceRate = rates[sourceCode];
    const targetRate = rates[targetCode];

    const reply =
      !sourceCode || !targetCode || sourceRate == null || targetRate == null
        ? `Unknown currency: ${rawText}`
        : `${amountLabel} ${sourceCode} = ${((amount / sourceRate) * targetRate).toFixed(2)} ${targetCode}`;

    await this.messengerGateway.sendMessage(chatId, reply);
    return reply;
  }
}

module.exports = { AnswerCurrencyQueryUseCase };
