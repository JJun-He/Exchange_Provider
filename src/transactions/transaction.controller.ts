import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { TransactionService } from "./transaction.service";
import { TransactionSyncService } from "../sync/transaction-sync.service";
import { GetTransactionDto } from "src/transactions/dto/get-transactions.dto";
import { SyncTransactionsDto } from "src/transactions/dto/sync-transactions.dto";

@ApiTags('Transactions')
@Controller('portfolios/:portfolioId/transactions')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionSyncService: TransactionSyncService
    ) {}

    private getDateRange(query: GetTransactionDto): { startDate: Date; endDate: Date } {
        const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = query.endDate ? new Date(query.endDate) : new Date();
        return { startDate, endDate };
    }

    @Get()
    @ApiOperation({ summary: '입출금 조회' })
    async getTransactions(
        @Param('portfolioId') portfolioId: string,
        @Query() query: GetTransactionDto
    ) {
        const { startDate, endDate } = this.getDateRange(query);
        return this.transactionService.getTransaction(portfolioId, startDate, endDate);
    }

    @Get('stats')
    @ApiOperation({ summary: '입출금 통계 조회' })
    async getTransactionStats(
        @Param('portfolioId') portfolioId: string,
        @Query() query: GetTransactionDto
    ) {
        const { startDate, endDate } = this.getDateRange(query);
        return this.transactionService.getTransactionStats(portfolioId, startDate, endDate);
    }

    @Post('sync')
    @ApiOperation({ summary: '입출금 동기화' })
    async syncTransactions(
        @Param('portfolioId') portfolioId: string,
        @Body() body: SyncTransactionsDto
    ) {
        await this.transactionSyncService.syncAllExchanges(portfolioId, body.credentials);
        return { message: '입출금 동기화가 완료되었습니다.' };
    }
}
