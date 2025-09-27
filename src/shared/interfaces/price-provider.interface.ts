export interface PriceProvider{
    getPrice(symbol: string): Promise<number>;
}

export interface ExtendedPriceProvider extends PriceProvider{
    getTokens?(): Promise<string[]>;
    getExchangeName(): string;
    healthCheck(): Promise<boolean>;
}