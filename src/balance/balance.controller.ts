import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  // 포트폴리오의 모든 잔고 조회
  @Get('portfolio/:portfolioId')
  async getPortfolioBalances(@Param('portfolioId') portfolioId: string) {
    return await this.balanceService.getPortfolioBalances(portfolioId);
  }

  // 특정 거래소의 잔고 조회
  @Get('portfolio/:portfolioId/exchange/:exchangeId')
  async getExchangeBalances(
    @Param('portfolioId') portfolioId: string,
    @Param('exchangeId') exchangeId: string,
  ) {
    return await this.balanceService.getExchangeBalancesByPortfolioAndExchange(
      portfolioId,
      exchangeId,
    );
  }
}
