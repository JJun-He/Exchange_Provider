import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { BaseProvider } from "src/shared/base/base-provider";


interface BinanceResponse{
    symbol: string;
    price: string;
}

@Injectable()
export class BinanceProvider extends BaseProvider{
    constructor(httpService: HttpService){
        super(httpService, 'http://api.binance.com', 'binance');
    }

    async getPrice(symbol: string): Promise<number>{
        const symbolObj = this.createSymbol(symbol);
        const exchangeSymbol = symbolObj.toExchangeFormat('binance');

        const data = await this.fetchData<BinanceResponse>(
            'api/v3/ticker/price',
            {symbol: exchangeSymbol}
        );

        return parseFloat(data.price);
    }
}