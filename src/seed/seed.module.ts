import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenPriceSource } from "src/entities/token-price-source.entity";
import { Token } from "src/entities/token.entity";
import { SeedService } from "./seed.service";
import { SeedRunner } from "./seed.runner";
import { Exchange } from "src/entities/exchange.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Exchange, Token, TokenPriceSource]),
    ],
    providers: [SeedService, SeedRunner],
    exports: [SeedService]
})
export class SeedModule{}