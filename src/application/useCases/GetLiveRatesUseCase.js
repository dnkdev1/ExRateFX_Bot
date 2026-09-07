const BASE_CODE = 'USD';

class GetLiveRatesUseCase {
  constructor(currencyDirectory, currencyRateGateway) {
    this.currencyDirectory = currencyDirectory;
    this.currencyRateGateway = currencyRateGateway;
  }

  async execute() {
    const codes = await this.currencyDirectory.listSupportedCodes();
    const rates = await this.currencyRateGateway.getRates(codes);
    return {
      base: BASE_CODE,
      asOf: new Date().toISOString(),
      rates,
    };
  }
}

module.exports = { GetLiveRatesUseCase };
