import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PortfolioTransaction } from "../entities/portfolio-transaction.entity";
import { PriceModule } from "../price/price.module";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { TokenPriceService } from "../price/token-price.service";
import { TransactionSyncService } from "../sync/transaction-sync.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PortfolioTransaction]),
        PriceModule
    ],
    controllers: [TransactionController],
    providers: [TransactionService, TokenPriceService, TransactionSyncService],
    exports: [TransactionService]       
})
export class TransactionModule{}