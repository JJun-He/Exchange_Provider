import { Injectable } from "@nestjs/common";
import { BithumbProvider } from "src/providers/bithumb.provider";
import { ExchangeSyncStrategy } from "src/shared/interfaces/exchange-sync-strategy.interface";

@Injectable()
export class BithumbSyncStrategy implements ExchangeSyncStrategy {
    constructor(private readonly bithumbProvider: BithumbProvider) {}

    getExchangeId(): string {
        return 'bithumb';
    }

    setCredentials(credentials: any): void {
        this.bithumbProvider.setCredentials(credentials.apiKey, credentials.secretKey);
    }

    async fetchTransactions(startTime: number, endTime: number): Promise<any[]> {
        const [deposits, withdrawals] = await Promise.all([
            this.bithumbProvider.getAllUserTransactions(0), 
            this.bithumbProvider.getAllUserTransactions(1)  
        ]);
        
        return [
            ...deposits.map(tx => this.transformBithumbTransaction(tx, 'deposit')),
            ...withdrawals.map(tx => this.transformBithumbTransaction(tx, 'withdrawal'))
        ];
    }

    private transformBithumbTransaction(tx: any, type: 'deposit' | 'withdrawal'): any {
        return {
            asset: tx.order_currency,
            amount: tx.units,
            type,
            status: this.mapBithumbStatus(tx.order_status),
            transactionId: tx.order_id,
            timestamp: new Date(parseInt(tx.order_date) * 1000), // Bithumb은 초 단위 타임스탬프
            tokenId: null // 나중에 매핑
        };
    }

    private mapBithumbStatus(status: string): 'pending' | 'success' | 'failed' {
        switch(status) {
            case '0': return 'pending';
            case '1': return 'success';
            default: return 'failed';
        }
    }

    validateCredentials(credentials: any): boolean {
        return !!(credentials.apiKey && credentials.secretKey);
    }
}