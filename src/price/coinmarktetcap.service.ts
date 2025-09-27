import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { TokenPriceProvider } from "src/shared/interfaces/token-provider.interface";


@Injectable()
export class CoinMarketCapService implements TokenPriceProvider{
    private readonly logger = new Logger(CoinMarketCapService.name);
    private readonly apiKey?: string;
    private readonly baseUrl = "https://pro-api.coinmarketcap.com/v1";

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ){
        this.apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY');
        if(!this.apiKey){
            throw new Error('COINMARKETCAP_API_KEY is not configured');
        }
    }

    async getTokenPriceInUsdt(symbols: string[]): Promise<Map<string, number>>{
        try{
            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
                    params: {
                        symbol: symbols.join(','),
                        convert: 'USDT'
                    },
                    headers: {
                        'X-CMC_PRO_API_KEY': this.apiKey,
                        'Accept': 'application/json'
                    }
                })
            );

            const priceMap = new Map<string, number>();
            const data = response.data.data;

            for(const symbol of symbols){
                if(data[symbol] && data[symbol].quote && data[symbol].quote.USDT){
                    priceMap.set(symbol, data[symbol].quote.USDT.price);
                }
            }

            return priceMap;
        }catch(error){
            this.logger.error('Failed to get token prices', error);
            throw error;
        }
    }


}