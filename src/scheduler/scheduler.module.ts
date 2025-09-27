import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exchange } from "src/entities/exchange.entity";
import { PortfolioCredential } from "src/entities/portfolio-credential.entity";
import { TokenPriceSource } from "src/entities/token-price-source.entity";
import { TokenPrice } from "src/entities/token-price.entity";
import { Token } from "src/entities/token.entity";
import { PriceModule } from "src/price/price.module";
import { SchedulerController } from "./scheduler.controller";
import { PriceSchedulerService } from "./price-scheduler.service";
import { SnapshotModule } from "src/snapshots/snapshot.module";
import { Portfolio } from "src/entities/portfolio.entity";

@Module({       
    imports: [
        TypeOrmModule.forFeature([PortfolioCredential, TokenPrice, TokenPriceSource, Exchange, Token, Portfolio]),
        PriceModule,
        SnapshotModule,
    ],
    controllers: [SchedulerController],
    providers: [PriceSchedulerService],
    exports: [PriceSchedulerService]    
})
export class SchedulerModule{}