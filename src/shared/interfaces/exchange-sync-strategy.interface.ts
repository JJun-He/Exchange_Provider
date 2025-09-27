export interface ExchangeSyncStrategy{
    getExchangeId(): string;
    setCredentials(credentials: any): void;
    fetchTransactions(startTime: number, endTime: number): Promise<any[]>;
    validateCredentials(credentials: any): boolean;
}