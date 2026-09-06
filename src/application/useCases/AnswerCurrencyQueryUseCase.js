function parseAmountAndCurrency(rawText) {
  const trimmed = rawText.trim();
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.+)$/);
  if (!match) {
    return { amountLabel: '1', amount: 1, currencyText: trimmed };
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
    const { amountLabel, amount, currencyText } = parseAmountAndCurrency(rawText);
    const code = await this.currencyDirectory.resolveCode(currencyText);
    const rate = code ? await this.currencyRateGateway.getRate(code) : null;

    const reply =
      rate === null || rate === undefined
        ? `Unknown currency: ${rawText}`
        : `${amountLabel} ${code} = ${(amount / rate).toFixed(2)} USD`;

    await this.messengerGateway.sendMessage(chatId, reply);
    return reply;
  }
}

module.exports = { AnswerCurrencyQueryUseCase };
