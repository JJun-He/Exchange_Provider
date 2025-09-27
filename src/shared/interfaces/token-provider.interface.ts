

export interface TokenPriceProvider {
    getTokenPriceInUsdt(symbols: string[]): Promise<Map<string, number>>;
}