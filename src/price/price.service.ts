import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PriceProvider } from "src/shared/interfaces/price-provider.interface";
import { PRICE_PROVIDER_MAP } from "./token";
import { Exchange } from "src/shared/domain/pair";

@Injectable()
export class PriceService{
    constructor(
       @Inject(PRICE_PROVIDER_MAP)
       private readonly providers: Map<Exchange, PriceProvider>,
    ){}


    async getPrice(exchange: Exchange, symbol: string): Promise<number>{
        const provider = this.providers.get(exchange);

        if(!provider){
            const supportedExchanges = Array.from(this.providers.keys());
            throw new BadRequestException(
                `Unsupported exchange: ${exchange}. Supported: ${supportedExchanges.join(',')}`
            );
        }

        return await provider.getPrice(symbol);
    }
}