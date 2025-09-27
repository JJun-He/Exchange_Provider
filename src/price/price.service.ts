import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PriceProvider } from "src/shared/interfaces/price-provider.interface";
import { PRICE_PROVIDER_MAP } from "./token";
import { Exchange } from "src/shared/domain/pair";

@Injectable()
export class PriceService{
    constructor(
       @Inject(PRICE_PROVIDER_MAP)
       private readonly priceProviders: Map<Exchange, PriceProvider>,
    ){}


    async getPrice(exchange: Exchange, symbol: string): Promise<number>{
        const provider = this.priceProviders.get(exchange);

        if(!provider){
            const supportedExchanges = Array.from(this.priceProviders.keys());
            throw new BadRequestException(
                `Unsupported exchange: ${exchange}. Supported: ${supportedExchanges.join(',')}`
            );
        }

        return await provider.getPrice(symbol);
    }
}