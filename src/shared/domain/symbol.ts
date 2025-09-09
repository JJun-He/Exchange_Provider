export type Exchange = 'binance' | 'okx' | 'bithumb';

export class Symbol {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Invalid symbol: ${value}`);
    }
  }

  getValue(): string { 
    return this.value.toUpperCase(); 
  }

  toExchangeFormat(exchange: Exchange): string {
    const symbol = this.value.toUpperCase();
    switch (exchange) {
      case 'binance': return symbol; // BTCUSDT
      case 'okx': return symbol.replace(/USDT$/, '-USDT'); // BTC-USDT  
      case 'bithumb': return symbol.replace(/USDT$/, '_KRW'); // BTC_KRW
      default: return symbol;
    }
  }

  // 유효성 검사
  private isValid(value: string): boolean {
  return /^[A-Z]{2,10}(_)?(USDT|BTC|ETH|KRW)$/i.test(value);
}
}