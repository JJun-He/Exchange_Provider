import { Injectable } from "@nestjs/common";
import { OkxProvider } from "src/providers/okx.provider";
import { ExchangeSyncStrategy } from "src/shared/interfaces/exchange-sync-strategy.interface";

@Injectable()
export class OkxSyncStrategy implements ExchangeSyncStrategy {
    constructor(private readonly okxProvider: OkxProvider) {}

    getExchangeId(): string {
        return 'okx';
    }

    setCredentials(credentials: any): void {
        this.okxProvider.setCredentials(credentials.apiKey, credentials.secretKey, credentials.passphrase);
    }

    async fetchTransactions(startTime: number, endTime: number): Promise<any[]> {
        const [deposits, withdrawals] = await Promise.all([
            this.okxProvider.getDepositHistory(undefined, 2, startTime, endTime),
            this.okxProvider.getWithdrawalHistory(undefined, 2, startTime, endTime)
        ]);
        
        return [
            ...deposits.map(tx => this.transformOkxTransaction(tx, 'deposit')),
            ...withdrawals.map(tx => this.transformOkxTransaction(tx, 'withdrawal'))
        ];
    }

    private transformOkxTransaction(tx: any, type: 'deposit' | 'withdrawal'): any {
        return {
            asset: tx.ccy,
            amount: tx.amt,
            type,
            status: this.mapOkxStatus(tx.state),
            transactionId: tx.txId,
            timestamp: new Date(parseInt(tx.ts)),
            tokenId: null // 나중에 매핑
        };
    }

    private mapOkxStatus(state: string): 'pending' | 'success' | 'failed' {
        switch(state) {
            case '0': return 'pending';
            case '2': return 'success';
            default: return 'failed';
        }
    }

    validateCredentials(credentials: any): boolean {
        return !!(credentials.apiKey && credentials.secretKey && credentials.passphrase);
    }
}