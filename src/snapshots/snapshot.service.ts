import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PortfolioBalance } from "src/entities/portfolio-balance.entity";
import { PortfolioSnapShot } from "src/entities/portfolio-snapshots.entity";
import { Portfolio } from "src/entities/portfolio.entity";
import { TokenPriceService } from "src/price/token-price.service";

import { Between, Repository } from "typeorm";



@Injectable()
export class SnapShotService{

    private readonly logger = new Logger(SnapShotService.name);

    constructor(
        @InjectRepository(PortfolioSnapShot)
        private readonly snapshotRepo: Repository<PortfolioSnapShot>,
        @InjectRepository(PortfolioBalance)
        private readonly balanceRepo: Repository<PortfolioBalance>,
        @InjectRepository(Portfolio)
        private readonly portfolioRepo: Repository<Portfolio>,
        private readonly tokenPriceService: TokenPriceService,
    ){}

    async createSnapshot(portfolioId: string, currency: string = 'USDT'): Promise<PortfolioSnapShot>{
        try{
            // 1. 포트폴리오 정보 조회
            const portfolio = await this.portfolioRepo.findOne({
                where: {id: portfolioId},
                relations: ['user']
            });

            if(!portfolio){
                throw new Error('Portfolio not found');
            }

            // 2. 포트폴리오의 모든 잔고 조회(거래소별)
            const balances = await this.balanceRepo.find({
                where: {portfolioId},
                relations: ['token', 'exchange']
            });

            if(balances.length === 0){
                throw new Error("No balances found for portfolio");
            }

            // 3. 고유한 토큰 심볼 수집
            const uniqueTokens = [...new Set(balances.map(b => b.token.symbol))];

            // 4. 코인마켓캡에서 모든 토큰 가격 한 번에 조회
            const tokenPrices = await this.tokenPriceService.getTokenPriceInUsdt(uniqueTokens);

            // 5. 각 토큰의 현재 USDT 가격 조회 및 총 가치 계산
            let totalValueUsdt = 0;
            for(const balance of balances){
                const price = tokenPrices.get(balance.token.symbol);
                if(price){
                    totalValueUsdt += parseFloat(balance.amount) * price;
                }
            }        

            // 6. 스냅샷 저장
            const snapshot = this.snapshotRepo.create({
                portfolioId,
                balance: totalValueUsdt.toFixed(2),
                pnl: '0.00', // TODO: PnL 계산은 이슈 #20에서 구현
                roi: '0.00', // TODO: ROI 계산은 이슈 #20에서 구현
                currency: 'USDT',
                updatedAt: new Date()
            });

            const savedSnapshot = await this.snapshotRepo.save(snapshot);

            this.logger.log(`Snapshot created for portfolio ${portfolioId}: ${totalValueUsdt} USDT`);
            return savedSnapshot;  
        }catch(error){
            this.logger.error(`Failed to create snapshot for portfolio ${portfolioId}:`, error);
            throw error;
        }
    }


    // 스냅샷 조회 
    async getSnapshots(
        portfolioId: string, 
        currency: string = 'USDT',
        start?: string,
        end?: string,
        limit?: number
    ){
        const whereConditions: any = {
            portfolioId,
            currency
        };

        if(start && end){
            whereConditions.createdAt = Between(new Date(start), new Date(end));
        }

        const snapshots = await this.snapshotRepo.find({
            where: whereConditions,
            order: {createdAt:'DESC'},
            take: limit
        });

        return {
            success: true,
            data: {
                currency,
                points: snapshots.map(snapshot => ({
                    ts: snapshot.createdAt.toISOString(),
                    balance: snapshot.balance,
                    pnl: snapshot.pnl,
                    roi: snapshot.roi
                }))
            },
            message: 'success'
        };
    }
    
}