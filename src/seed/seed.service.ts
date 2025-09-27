import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../entities/exchange.entity';
import { Token } from '../entities/token.entity';
import { TokenPriceSource } from '../entities/token-price-source.entity';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Exchange)
        private readonly exchangeRepo: Repository<Exchange>,
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>,
        @InjectRepository(TokenPriceSource)
        private readonly tokenPriceSourceRepo: Repository<TokenPriceSource>,
    ) {}

    async run() {
        this.logger.log('데이터 시딩 시작');

        try {
            // 1. 거래소 데이터 
            await this.seedExchanges();
            
            // 2. 토큰 데이터 
            await this.seedTokens();
            
            // 3. 토큰-거래소 매핑
            await this.seedTokenPriceSources();

        } catch (error) {
            this.logger.error('시딩 오류:', error.message);
            throw error;
        }
    }

    private async seedExchanges() {
        const exchangeData = [
            { name: 'binance', baseCurrency: 'USDT', apiEndpoint: 'https://api.binance.com' },
            { name: 'okx', baseCurrency: 'USDT', apiEndpoint: 'https://www.okx.com' },
            { name: 'bithumb', baseCurrency: 'KRW', apiEndpoint: 'https://api.bithumb.com' }
        ];

        let count = 0;
        for (const data of exchangeData) {
            const existing = await this.exchangeRepo.findOne({ where: { name: data.name } });
            if (!existing) {
                await this.exchangeRepo.save({
                    ...data,
                    isActive: true
                });
                count++;
            }
        }
        
        if (count > 0) {
            this.logger.log(`거래소 ${count}개 추가`);
        } else {
            this.logger.log('거래소 데이터가 이미 존재합니다.');
        }
    }

    private async seedTokens() {
        const tokenData = [
            { symbol: 'BTC', name: 'Bitcoin' },
            { symbol: 'ETH', name: 'Ethereum' },
            { symbol: 'USDT', name: 'Tether' },
            { symbol: 'BNB', name: 'BNB' },
            { symbol: 'XRP', name: 'Ripple' },
            { symbol: 'ADA', name: 'Cardano' },
            { symbol: 'SOL', name: 'Solana' },
            { symbol: 'DOGE', name: 'Dogecoin' }
        ];

        let count = 0;
        for (const data of tokenData) {
            const existing = await this.tokenRepo.findOne({ where: { symbol: data.symbol } });
            if (!existing) {
                await this.tokenRepo.save({
                    ...data,
                    isActive: true,
                    updatedAt: new Date()
                });
                count++;
            }
        }

        if (count > 0) {
            this.logger.log(`토큰 ${count}개 추가`);
        } else {
            this.logger.log('토큰 데이터가 이미 존재합니다.');
        }
    }

    private async seedTokenPriceSources() {
        // 모든 토큰과 거래소 조회
        const tokens = await this.tokenRepo.find();
        const exchanges = await this.exchangeRepo.find();
        
        if (tokens.length === 0 || exchanges.length === 0) {
            this.logger.warn('토큰 또는 거래소 데이터가 없습니다.');
            return;
        }

        const tokenSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE'];
        let count = 0;

        for (const tokenSymbol of tokenSymbols) {
            const token = tokens.find(t => t.symbol === tokenSymbol);
            if (!token) continue;

            // Binance 매핑
            const binanceMapping = {
                tokenId: token.id,
                source: 'binance',
                externalId: `${tokenSymbol}USDT`
            };
            
            const existingBinance = await this.tokenPriceSourceRepo.findOne({
                where: { tokenId: token.id, source: 'binance' }
            });
            
            if (!existingBinance) {
                await this.tokenPriceSourceRepo.save(binanceMapping);
                count++;
            }

            // OKX 매핑
            const okxMapping = {
                tokenId: token.id,
                source: 'okx',
                externalId: `${tokenSymbol}-USDT`
            };
            
            const existingOkx = await this.tokenPriceSourceRepo.findOne({
                where: { tokenId: token.id, source: 'okx' }
            });
            
            if (!existingOkx) {
                await this.tokenPriceSourceRepo.save(okxMapping);
                count++;
            }

            // Bithumb 매핑
            const bithumbMapping = {
                tokenId: token.id,
                source: 'bithumb',
                externalId: `${tokenSymbol}_KRW`
            };
            
            const existingBithumb = await this.tokenPriceSourceRepo.findOne({
                where: { tokenId: token.id, source: 'bithumb' }
            });
            
            if (!existingBithumb) {
                await this.tokenPriceSourceRepo.save(bithumbMapping);
                count++;
            }
        }

        if (count > 0) {
            this.logger.log(`토큰-거래소 매핑 ${count}개 추가`);
        } else {
            this.logger.log('토큰-거래소 매핑이 이미 존재합니다.');
        }
    }
}
