import { Inject, Injectable } from "@nestjs/common";
import { Exchange } from "src/shared/domain/symbol";
import { PriceProvider } from "src/shared/interfaces/price-provider.interface";

@Injectable()
export class PriceService{
    constructor(
        @Inject('BINANCE_PROVIDER') private binanceProvider: PriceProvider,
        @Inject('OKX_PROVIDER') private okxProvider: PriceProvider,
        @Inject('BITHUMB_PROVIDER') private bithumbProvider: PriceProvider,  
    ){}


    async getPrice(exchange: Exchange, symbol: string): Promise<number>{
        const provider = this.getProvider(exchange);
        return await provider.getPrice(symbol);
    }

    private getProvider(exchange: Exchange): PriceProvider{
        switch(exchange){
            case 'binance': return this.binanceProvider;
            case 'okx': return this.okxProvider;
            case 'bithumb': return this.bithumbProvider;
            default: throw new Error(`Unsupported exchange: ${exchange}`);
        }
    }
}