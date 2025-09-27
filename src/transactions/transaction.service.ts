import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PortfolioTransaction } from "../entities/portfolio-transaction.entity";
import { Between, Repository } from "typeorm";
import { CreateTransactionDto } from "src/transactions/dto/create-transaction.dto";
import Decimal from "decimal.js";
import { TokenPriceService } from "../price/token-price.service";

@Injectable()
export class TransactionService{
    private readonly logger = new Logger(TransactionService.name);

    constructor(
        @InjectRepository(PortfolioTransaction)
        private readonly transactionRepo: Repository<PortfolioTransaction>,
        private readonly tokenPriceService: TokenPriceService
    ){}

    // 새 트랜잭션 기록
    async recordTransaction(transactionData: CreateTransactionDto): Promise<PortfolioTransaction>{
        const transaction = this.transactionRepo.create(transactionData);
        return this.transactionRepo.save(transaction);
    }

    // 배치 트랜잭션 기록
    async recordTransactions(transactionsData: CreateTransactionDto[]): Promise<PortfolioTransaction[]>{
        const transactions = this.transactionRepo.create(transactionsData);
        return this.transactionRepo.save(transactions);
    }

    // 특정 기간 트랜잭션 조회
    async getTransaction(
        portfolioId: string,
        startDate: Date,
        endDate: Date
    ): Promise<PortfolioTransaction[]>{
        return this.transactionRepo.find({
            where: {
                portfolioId,
                timestamp: Between(startDate, endDate)
            },
            order: {timestamp: 'DESC'},
            relations: ['exchange', 'token']
        });
    }

    // 거래소별 최신 동기화 시간 조회
    async getLastSyncTime(exchangeId: string): Promise<Date | null>{
        const lastTransaction = await this.transactionRepo.findOne({
            where: {exchangeId},
            order: {timestamp: 'DESC'}
        });

        return lastTransaction?.timestamp || null;
    }

    // 트랜잭션 통계 조회
    async getTransactionStats(portfolioId: string, startDate: Date, endDate: Date){
        const transactions = await this.getTransaction(portfolioId, startDate, endDate);

        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalUsdtValue = new Decimal(0);

        for (const t of transactions) {
            if (t.type === 'deposit') totalDeposits++;
            else if (t.type === 'withdrawal') totalWithdrawals++;
            
            const usdtValue = t.usdtValue || '0';
            totalUsdtValue = totalUsdtValue.plus(new Decimal(usdtValue));
        }

        const stats = {
            totalTransactions: transactions.length,
            totalDeposits,
            totalWithdrawals,
            totalUsdtValue: totalUsdtValue.toString(),
            byExchange: this.groupByExchange(transactions),
            byToken: this.groupByToken(transactions)
        };

        return stats;
    }

    private groupByExchange(transactions: PortfolioTransaction[]){
        return transactions.reduce((acc, t) => {
            const exchange = t.exchange?.name || 'Unknown';
            if(!acc[exchange])
                acc[exchange] = 0;
            acc[exchange]++;
            return acc;
        }, {});
    }

    private groupByToken(transactions: PortfolioTransaction[]){
        return transactions.reduce((acc, t) => {
            const token = t.token?.symbol || 'Unknown';
            if(!acc[token])
                acc[token] = 0;
            acc[token]++;
            return acc;
        }, {});
    }

    
}