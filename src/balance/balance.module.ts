import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { PortfolioBalance } from 'src/entities/portfolio-balance.entity';
import { PortfolioCredential } from 'src/entities/portfolio-credential.entity';
import { Token } from 'src/entities/token.entity';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { ProviderFactory } from 'src/shared/factory/provider.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortfolioBalance,
      PortfolioCredential,
      Exchange,
      Token,
    ]),
    HttpModule,
  ],
  controllers: [BalanceController],
  providers: [BalanceService, ProviderFactory],
  exports: [BalanceService],
})
export class BalanceModule {}
