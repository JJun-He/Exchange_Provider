import { Injectable, Logger } from "@nestjs/common";
import { ExchangeSyncStrategyFactory } from "src/shared/factory/exchange-sync-strategy.factory";
import { TransactionService } from "src/transactions/transaction.service";
import { TransactionDataProcessor } from "./processor/transaction-data-processor.service";

@Injectable()
export class TransactionSyncService{
    private readonly logger = new Logger(TransactionSyncService.name);
    private readonly DEFAULT_SYNC_DAYS = 30;
    
    constructor(
        private readonly transactionService: TransactionService,
        private readonly strategyFactory: ExchangeSyncStrategyFactory,
        private readonly transactionDataProcessor: TransactionDataProcessor
    ){}

    // 전체 동기화 실행
    async syncAllExchanges(portfolioId: string, credentials: any){
        const supportedExchanges = this.strategyFactory.getSupportedExchanges();

        const exchangeToSync = supportedExchanges.filter(exchangeId => 
            credentials[exchangeId]
        );

        for(const exchangeId of exchangeToSync){
            try{
                await this.syncExchange(portfolioId, exchangeId, credentials[exchangeId]);
            }catch(error){
                this.logger.error(`Failed to sync ${exchangeId}:`, error);
            }
        }
    }

    // 개별 거래소 동기화
    async syncExchange(portfolioId: string, exchangeId: string, credentials: any){
        // 1. 전략 가져오기 및 인증 설정
        const strategy = this.strategyFactory.getStrategy(exchangeId);
        strategy.setCredentials(credentials);

        // 2. 마지막 동기화 시간 확인
        const lastSyncTime = await this.transactionService.getLastSyncTime(exchangeId);
        const startTime = lastSyncTime ? lastSyncTime.getTime() : Date.now() - (this.DEFAULT_SYNC_DAYS * 24 * 60 * 60 * 1000);
        const endTime = Date.now();

        // 3. 입출금 내역 조회
        const rawTransactions = await strategy.fetchTransactions(startTime, endTime);

        // 4. 데이터 처리
        const processTransactions = await this.transactionDataProcessor.processTransactions(rawTransactions);

        // 5. 데이터베이스에 저장
        await this.saveTransactions(portfolioId, exchangeId, processTransactions);
    }

    // 저장 로직 (배치 저장으로 최적화)
    private async saveTransactions(portfolioId: string, exchangeId: string, transactions: any[]){
        if (transactions.length === 0) return;
        
        const transactionEntities = transactions.map(transaction => ({
            portfolioId,
            exchangeId,
            tokenId: transaction.tokenId,
            type: transaction.type,
            amount: transaction.amount,
            usdtValue: transaction.usdtValue,
            status: transaction.status,
            transactionId: transaction.transactionId,
            timestamp: transaction.timestamp
        }));

        await this.transactionService.recordTransactions(transactionEntities);
    }

}