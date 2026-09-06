class AnswerCurrencyQueryUseCase {
  constructor(currencyDirectory, currencyRateGateway, messengerGateway) {
    this.currencyDirectory = currencyDirectory;
    this.currencyRateGateway = currencyRateGateway;
    this.messengerGateway = messengerGateway;
  }

  async execute({ chatId, rawText }) {
    const code = await this.currencyDirectory.resolveCode(rawText);
    const rate = code ? await this.currencyRateGateway.getRate(code) : null;

    const reply =
      rate === null || rate === undefined
        ? `Unknown currency: ${rawText}`
        : `1 USD = ${rate} ${code}`;

    await this.messengerGateway.sendMessage(chatId, reply);
    return reply;
  }
}

module.exports = { AnswerCurrencyQueryUseCase };
