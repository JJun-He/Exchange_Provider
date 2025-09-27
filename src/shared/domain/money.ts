export class Money{
  constructor(
    private readonly amount: number,
    private readonly currency: string = 'USD'
  ) {
    if (amount < 0 || !Number.isFinite(amount)) {
      throw new Error('Invalid money amount');
    }
  }

  getAmount(): number { return this.amount; }
  getCurrency(): string { return this.currency; }

  static fromUSD(amount: number): Money {
    return new Money(amount, 'USD');
  }
}