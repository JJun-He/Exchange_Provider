import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exchange } from "src/entities/exchange.entity";
import { PortfolioBalance } from "src/entities/portfolio-balance.entity";
import { PortfolioCredential } from "src/entities/portfolio-credential.entity";
import { Portfolio } from "src/entities/portfolio.entity";
import { TokenPriceSource } from "src/entities/token-price-source.entity";
import { TokenPrice } from "src/entities/token-price.entity";
import { Token } from "src/entities/token.entity";
import { User } from "src/entities/user.entity";
import { PortfolioSnapShot } from "src/entities/portfolio-snapshots.entity";
import { PortfolioTransaction } from "src/entities/portfolio-transaction.entity";



@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                entities: [
                    User, Exchange, Token, PortfolioCredential,
                    TokenPrice, TokenPriceSource, Portfolio, PortfolioBalance, PortfolioSnapShot, PortfolioTransaction
                ],
                synchronize: false,
                ssl:{
                    rejectUnauthorized: false, // RDS 연결용
                },
                extra:{
                    trustServerCertificate: true, // SSL 인증서 신뢰
                },
                timezone:'UTC',
            }),
        }),
        TypeOrmModule.forFeature([
            User, Exchange, Token, PortfolioCredential,
            TokenPrice, TokenPriceSource, Portfolio, PortfolioBalance, PortfolioSnapShot, PortfolioTransaction
        ]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule{}