
import { Inject, Injectable } from "@nestjs/common";
import { TokenPriceProvider } from "src/shared/interfaces/token-provider.interface";

@Injectable()
export class TokenPriceService{
    constructor(
        @Inject('TOKEN_PRICE_PROVIDER')
        private readonly tokenPriceProviders: TokenPriceProvider
    ){}

    async getTokenPriceInUsdt(symbols: string[]): Promise<Map<string, number>>{
        return this.tokenPriceProviders.getTokenPriceInUsdt(symbols);  
    }
}