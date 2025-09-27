import { Injectable } from "@nestjs/common";
import { TokenPriceService } from "src/price/token-price.service";
import Decimal from "decimal.js";

@Injectable()
export class TransactionDataProcessor{

    constructor(
        private readonly tokenPriceService: TokenPriceService
    ){}

    async processTransactions(transactions: any[]): Promise<any>{
        // 1. 데이터 검증
        const validTransactions = this.validateTransactions(transactions);

        // 2. USDT 가치 계산 (배치 계산)
        const processedTransactions = await this.calculateUsdtValues(validTransactions);

        // 3. 데이터 정규화
        return this.normalizeTransactions(processedTransactions);
    }

    private validateTransactions(transactions: any[]): any[]{
        return transactions.filter(tx => {
            return tx.asset && tx.amount && tx.transactionId && tx.timestamp;
        });
    }

    private async calculateUsdtValues(transactions: any[]): Promise<any[]>{
        // 배치 처리로 성능 개선
        const uniqueAssets = [...new Set(transactions.map(tx => tx.asset))];

        const priceMap = await this.tokenPriceService.getTokenPriceInUsdt(uniqueAssets);

        return transactions.map(tx => ({
            ...tx,
            usdtValue: this.calculateUsdtValue(tx.asset, tx.amount, priceMap)
        }));
    }

    private calculateUsdtValue(asset: string, amount: string, priceMap: Map<string, number>): string{
        const price = priceMap.get(asset);
        
        if (!price) {
            return '0';
        }

        try{
            const amountDecimal = new Decimal(amount);
            const priceDecimal = new Decimal(price);
            return amountDecimal.times(priceDecimal).toString();
        }catch(error){
            return '0';
        }
    }

    private normalizeTransactions(transactions: any[]): any[]{
        return transactions.map(tx => ({
            ...tx,
            timestamp: this.normalizeTimestamp(tx.timestamp)
        }));
    }

    private normalizeTimestamp(timestamp: any): Date {
        if (!timestamp) return new Date();
        
        // Date 객체인 경우
        if (timestamp instanceof Date) {
            return new Date(timestamp.getTime());
        }
        
        // 숫자인 경우 (밀리초 또는 초)
        if (typeof timestamp === 'number') {
            // 10자리면 초 단위, 13자리면 밀리초 단위
            const timestampMs = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
            return new Date(timestampMs);
        }
        
        // 문자열인 경우
        if (typeof timestamp === 'string') {
            const parsed = parseInt(timestamp);
            if (!isNaN(parsed)) {
                const timestampMs = parsed.toString().length === 10 ? parsed * 1000 : parsed;
                return new Date(timestampMs);
            }
            return new Date(timestamp);
        }
        
        return new Date();
    }
}