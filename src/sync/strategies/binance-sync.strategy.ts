import { Injectable } from "@nestjs/common";
import { ExchangeSyncStrategy } from "../../shared/interfaces/exchange-sync-strategy.interface";
import { BinanceProvider } from "src/providers/binance.provider";


@Injectable()
export class BinanceSyncStrategy implements ExchangeSyncStrategy{
    constructor(private readonly binanceProvider: BinanceProvider){}

    getExchangeId(): string {
        return 'binance';
    }

    setCredentials(credentials: any): void {
        this.binanceProvider.setCredentials(credentials.apiKey, credentials.secretKey);
    }

    async fetchTransactions(startTime: number, endTime: number): Promise<any[]> {
        const [deposits, withdrawals] =  await Promise.all([
            this.binanceProvider.getAllDepositHistory(startTime, endTime),
            this.binanceProvider.getAllWithdrawalHistory(startTime, endTime)
        ]);

        return [
            ...deposits.map(tx => this.transformBinanceTransaction(tx, 'deposit')),
            ...withdrawals.map(tx => this.transformBinanceTransaction(tx, 'withdrawal'))
        ];
    }

    private transformBinanceTransaction(tx: any, type: 'deposit' | 'withdrawal'): any {
        return {
            asset: tx.coin || tx.asset,
            amount: tx.amount,
            type,
            status: this.mapBinanceStatus(tx.status),
            transactionId: tx.txId || tx.id,
            timestamp: new Date(tx.insertTime || tx.timestamp),
            tokenId: null // 나중에 매핑
        };
    }

    private mapBinanceStatus(status: number): 'pending' | 'success' | 'failed' {
        switch(status) {
            case 0: return 'pending';
            case 1: return 'success';
            default: return 'failed';
        }
    }

    validateCredentials(credentials: any): boolean {
        return !!(credentials.apiKey && credentials.secretKey);
    }
}