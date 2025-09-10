import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { BaseProvider } from "src/shared/base/base-provider";

interface BithumbResponse{
    status: string;
    data: {closing_price: string};
}

@Injectable()
export class BithumbProvider extends BaseProvider{
    private readonly usdKrwRate = 1300; // 임시 고정 환율

    constructor(httpService: HttpService){
        super(httpService, 'https://api.bithumb.com', 'bithumb');
    }

    async getPrice(symbol: string): Promise<number>{

        const pair = this.createPair(symbol);
        const exchangeSymbol = pair.toExchangeSymbol('bithumb'); // BTCUSDT → BTC_KRW 자동
        const data = await this.fetchData<BithumbResponse>(
            `/public/ticker/${exchangeSymbol}`
        );

        if(data.status != '0000'){
            throw new Error('Bithumb API error');
        }

        const krwPrice = parseFloat(data.data.closing_price);
        return krwPrice / this.usdKrwRate; // KRW -> USD
    }
}