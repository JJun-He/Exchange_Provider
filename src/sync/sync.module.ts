import { Module } from "@nestjs/common";
import { TransactionSyncService } from "./transaction-sync.service";
import { TransactionModule } from "src/transactions/transaction.module";
import { ProvidersModule } from "src/providers/providers.module";


@Module({
    imports: [TransactionModule, ProvidersModule],
    providers: [TransactionSyncService],
    exports: [TransactionSyncService]
})
export class SyncModule{}