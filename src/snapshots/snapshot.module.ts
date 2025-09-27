import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PortfolioBalance } from "src/entities/portfolio-balance.entity";
import { PortfolioSnapShot } from "src/entities/portfolio-snapshots.entity";
import { Portfolio } from "src/entities/portfolio.entity";
import { TokenPrice } from "src/entities/token-price.entity";
import { PriceModule } from "src/price/price.module";
import { SnapShotService } from "./snapshot.service";
import { SnapShotController } from "./snapshot.controller";


@Module({
    imports: [
        TypeOrmModule.forFeature([
            PortfolioSnapShot,
            PortfolioBalance,
            Portfolio
        ]),
        PriceModule,
    ],
    controllers: [SnapShotController],
    providers: [SnapShotService],
    exports: [SnapShotService]
})
export class SnapshotModule{}