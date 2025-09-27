import { Injectable } from "@nestjs/common";
import { ExchangeSyncStrategy } from "../interfaces/exchange-sync-strategy.interface";
import { BinanceSyncStrategy } from "src/sync/strategies/binance-sync.strategy";
import { OkxSyncStrategy } from "src/sync/strategies/okx-sync.strategy";
import { BithumbSyncStrategy } from "src/sync/strategies/bithumb-sync.strategy";


@Injectable()
export class ExchangeSyncStrategyFactory{
    private strategies: Map<string, ExchangeSyncStrategy> = new Map();

    constructor(
        private readonly binanceStrategy: BinanceSyncStrategy,
        private readonly okxStrategy: OkxSyncStrategy,
        private readonly bithumbStrategy: BithumbSyncStrategy
    ){
        // 전략 등록
        this.strategies.set('binance', binanceStrategy);
        this.strategies.set('okx', okxStrategy);
        this.strategies.set('bithumb', bithumbStrategy);
    }

    getStrategy(exchangeId: string): ExchangeSyncStrategy{
        const strategy = this.strategies.get(exchangeId);
        if (!strategy) {
            throw new Error(`Unsupported exchange: ${exchangeId}`);
        }
        return strategy;
    }

    getSupportedExchanges(): string[]{
        return Array.from(this.strategies.keys());
    }
}