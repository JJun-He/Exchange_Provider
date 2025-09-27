import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PriceModule } from "./price/price.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SeedModule } from "./seed/seed.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./users/user.module";
import { SnapshotModule } from "./snapshots/snapshot.module";
import { TransactionModule } from "./transactions/transaction.module";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ScheduleModule.forRoot(),
        // HTTP 클라이언트 설정 
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Crypto-Portfolio-Providers',
            },
        }),

        // Provider 시스템 모듈
        PriceModule,
        DatabaseModule,
        SchedulerModule,
        SeedModule,
        UserModule,
        SnapshotModule,
        TransactionModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule{}