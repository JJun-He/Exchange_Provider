import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { CredentialStatus, PortfolioCredential } from "src/entities/portfolio-credential.entity";
import { TokenPriceSource } from "src/entities/token-price-source.entity";
import { TokenPrice } from "src/entities/token-price.entity";
import { PriceService } from "src/price/price.service";
import { Repository } from "typeorm";
import { Exchange as DomainExchange, Pair } from "src/shared/domain/pair";
import { Exchange } from "src/entities/exchange.entity";
import { resolve } from "path";
import { timestamp } from "rxjs";
import { SnapShotService } from "src/snapshots/snapshot.service";
import { Portfolio } from "src/entities/portfolio.entity";

@Injectable()
export class PriceSchedulerService{
    private readonly logger = new Logger(PriceSchedulerService.name);

    constructor(
        @InjectRepository(PortfolioCredential)
        private readonly credentialRepo: Repository<PortfolioCredential>,
        @InjectRepository(TokenPrice)
        private readonly tokenPriceRepo: Repository<TokenPrice>,
        @InjectRepository(TokenPriceSource)
        private readonly tokenPriceSourceRepo: Repository<TokenPriceSource>,
        private readonly priceService: PriceService,
        private readonly snapshotService: SnapShotService,
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
    ){}

    // 10분마다 실행
    @Cron('0 */10 * * * *')
    async collectPriceData(){
        const startTime = Date.now();

        try{
            // 활성 거래소 연결 조회
            const activeCredentials = await this.credentialRepo.find({
                where: {status: 'active' as any},
                relations: ['user', 'exchange']
            });

            if(activeCredentials.length == 0){
                this.logger.warn("활성화된 거래소 연결이 없습니다.");
                return;
            }

            // 거래소별 그룹화(중복 API 호출 방지)
            const exchangeGroups = this.groupCredentialsByExchange(activeCredentials);

            let totalCollected = 0;
            let totalErrors = 0;

            // 각 거래소별로 데이터 수집
            for(const [exchangeId, credentials] of exchangeGroups){
                const result = await this.collectDataForExchange(exchangeId, credentials);
                totalCollected += result.success;
                totalErrors += result.errors;
            }

            const duration = Date.now() - startTime;
            this.logger.log(`스케줄러 완료: ${totalCollected}개 수집, ${totalErrors}개 실패, ${duration}ms 소요`);
        }catch(error){
            this.logger.log('스케줄러 오류:', error.stack);
        }

        // 스냅샷 생성
        await this.createSnapshot();
    }

    private async createSnapshot() {
        try {
          // 활성 포트폴리오 조회
          const activePortfolios = await this.portfolioRepo.find({
            where: { isManual: false }
          });
    
          for (const portfolio of activePortfolios) {
            try {
              await this.snapshotService.createSnapshot(portfolio.id);
            } catch (error) {
              this.logger.error(`Failed to create snapshot for portfolio ${portfolio.id}:`, error);
            }
          }
    
          this.logger.log(`Created snapshots for ${activePortfolios.length} portfolios`);
        } catch (error) {
          this.logger.error('Failed to create snapshots:', error);
        }
      }

    private groupCredentialsByExchange(credentials: PortfolioCredential[]): Map<string, PortfolioCredential[]>
    {
        const groups = new Map<string, PortfolioCredential[]>();

        for(const credential of credentials){
            const exchangeId = credential.exchangeId;
            if(!groups.has(exchangeId)){
                groups.set(exchangeId, []);
            }
            groups.get(exchangeId)?.push(credential);
        }

        return groups;
    }

    private async collectDataForExchange(
        exchangeId: string,
        credentials: PortfolioCredential[]
    ): Promise<{success: number; errors: number}>{
        const exchange = credentials[0].exchange;
        const exchangeName = exchange.name.toLowerCase() as DomainExchange;

        try{
            // 해당 거래소의 토큰 가격 소스 조회
            const priceSources = await this.tokenPriceSourceRepo.find({
                where: {source: exchangeName},
                relations: ['token'],
            });    

            const priceRecords: TokenPrice[] = [];
            let successCount = 0;
            let errorCount = 0;

            // 각 토큰의 가격 조회
            for(const source of priceSources){
                try{
                    const pair = Pair.parse(source.externalId);

                    const price = await this.priceService.getPrice(
                        exchangeName,
                        source.externalId
                    );

                    const priceRecord = this.tokenPriceRepo.create({
                        tokenId: source.tokenId,
                        price: price.toFixed(2), // DB numeric (20,2) 스키마 
                        baseCurrency: pair.quote,
                        updatedAt: new Date(),
                    });

                    priceRecords.push(priceRecord);
                    successCount++;

                    // API Rate Limit 방지
                    await this.sleep(100);
                }catch(error){
                    errorCount++;
                }
            }

            // 배치로 데이터베이스에 저장
            if(priceRecords.length > 0){
                await this.tokenPriceRepo.save(priceRecords);
                this.logger.log(`[${exchangeName}]${priceRecords.length}개 가격 데이터 저장 완료 `);
            }

            return {success: successCount, errors: errorCount};

        }catch(error){         
            return {success: 0, errors: 1};
        }
    }

    private sleep(ms: number): Promise<void>{
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 스케줄러 상태 조회
    async getSchedulerStatus(){
        const activeCredentials = await this.credentialRepo.find({
            where: {status: CredentialStatus.ACTIVE},
            relations: ['exchange'],
        });

        const recentPrices = await this.tokenPriceRepo.find({
            order: {createdAt: 'DESC'},
            take: 10,
            relations: ['token'],
        });

        return {
            status: 'running',
            activeConnections: activeCredentials.length,
            connectedExchanges: [...new Set(activeCredentials.map(c => c.exchange.name))],
            recentPrices: recentPrices.map(p => ({
                token: p.token?.symbol || 'Unknown',
                price: p.price,
                currency: p.baseCurrency,
                timestamp: p.createdAt,
            })),
            nextRunTime: this.getNextCronTime(),
        };
    }

    private getNextCronTime(): Date{
        const now = new Date();
        const nextRun = new Date(now);
        const minutes = now.getMinutes();
        const nextMinute = Math.ceil(minutes / 10) * 10;

        if(nextMinute >= 60){
            nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
        }else{
            nextRun.setMinutes(nextMinute, 0, 0);
        }

        return nextRun;
    }
}