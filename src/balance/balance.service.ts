import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { PortfolioBalance } from 'src/entities/portfolio-balance.entity';
import { PortfolioCredential } from 'src/entities/portfolio-credential.entity';
import { Token } from 'src/entities/token.entity';
import { ExchangeType } from 'src/shared/domain/pair';
import { ProviderFactory } from 'src/shared/factory/provider.factory';
import { AccountBalance } from 'src/shared/interfaces/account-balance.interface';
import { Repository } from 'typeorm';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectRepository(PortfolioBalance)
    private readonly balanceRepo: Repository<PortfolioBalance>,
    @InjectRepository(PortfolioCredential)
    private readonly credentialRepo: Repository<PortfolioCredential>,
    @InjectRepository(Exchange)
    private readonly exchangeRepo: Repository<Exchange>,
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
    private readonly providerFactory: ProviderFactory,
  ) {}

  // 포트폴리오의 실시간 잔고 조회
  async getPortfolioBalances(portfolioId: string): Promise<PortfolioBalance[]> {
    // 1. 포트폴리오 자격증명 조회
    const credentials = await this.credentialRepo.find({
      where: { userId: portfolioId }, // 실제로는 portfolio의 userId를 조회해야 함
      relations: ['exchange'],
    });

    const updateBalances: PortfolioBalance[] = [];

    for (const credential of credentials) {
      try {
        // 2. 거래소별 잔고 조회
        const accountBalances = await this.getExchangeBalances(credential);

        // 3. PortfolioBalance 업데이트
        for (const accountBalance of accountBalances) {
          const updatedBalance = await this.updatePortfolioBalance(
            portfolioId,
            credential.exchangeId,
            accountBalance,
          );
          if (updatedBalance) {
            updateBalances.push(updatedBalance);
          }
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch balances for exchange ${credential.exchangeId}:`,
          error,
        );
      }
    }

    return updateBalances;
  }

  // 거래소별 잔고 조회
  async getExchangeBalances(
    credential: PortfolioCredential,
  ): Promise<AccountBalance[]> {
    const exchange = await this.exchangeRepo.findOne({
      where: { id: credential.exchangeId },
    });

    if (!exchange) {
      throw new Error(`Exchange not found: ${credential.exchangeId}`);
    }

    const exchangeEnum = exchange.name.toLowerCase() as ExchangeType;

    const provider = this.providerFactory.createExchangeProvider(exchangeEnum);

    // API 키 설정
    const apiKey = credential.encryptedApiKey; // 복호화 로직 필요
    const secretKey = credential.encryptedSecretKey; // 복호화 로직 필요
    const dataKey = credential.encryptedDataKey; // OKX용

    provider.setCredentials(apiKey, secretKey, dataKey);

    // 잔고 조회
    return await provider.getAccountBalances();
  }

  // PortfolioBalance 업데이트
  private async updatePortfolioBalance(
    portfolioId: string,
    exchangeId: string,
    accountBalance: AccountBalance,
  ): Promise<PortfolioBalance | null> {
    // 1. 토큰 조회 또는 생성
    let token = await this.tokenRepo.findOne({
      where: { symbol: accountBalance.asset },
    });

    if (!token) {
      token = this.tokenRepo.create({
        symbol: accountBalance.asset,
        name: accountBalance.asset,
      });
      await this.tokenRepo.save(token);
    }

    // 2. 기존 잔고 조회
    let balance = await this.balanceRepo.findOne({
      where: {
        portfolioId,
        tokenId: token.id,
        exchangeId,
      },
    });

    // 3. 잔고 업데이트 또는 생성
    if (balance) {
      // 기존 잔고 업데이트
      balance.amount = accountBalance.total;
      balance.updatedAt = new Date();
    } else {
      // 새 잔고 생성
      balance = this.balanceRepo.create({
        portfolioId,
        tokenId: token.id,
        exchangeId,
        amount: accountBalance.total,
        avgBuyPrice: undefined, // 실시간 잔고에서는 평균 매수가 미제공
      });
    }

    return await this.balanceRepo.save(balance);
  }

  // 특정 거래소의 잔고만 수정
  async getExchangeBalancesByPortfolioAndExchange(
    portfolioId: string,
    exchangeId: string,
  ): Promise<PortfolioBalance[]> {
    const credential = await this.credentialRepo.findOne({
      where: { userId: portfolioId, exchangeId },
      relations: ['exchange'],
    });

    if (!credential) {
      throw new Error('Credential not found');
    }

    const accountBalances = await this.getExchangeBalances(credential);
    const updatedBalances: PortfolioBalance[] = [];

    for (const accountBalance of accountBalances) {
      const updatedBalance = await this.updatePortfolioBalance(
        portfolioId,
        exchangeId,
        accountBalance,
      );

      if (updatedBalance) {
        updatedBalances.push(updatedBalance);
      }
    }

    return updatedBalances;
  }
}
