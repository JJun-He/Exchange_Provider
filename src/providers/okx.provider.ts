import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { BaseProvider } from "src/shared/base/base-provider";

interface OkxResponse{
    code: string,
    data: Array<{instId: string, last: string}>;
}

@Injectable()
export class OkxProvider extends BaseProvider{
    constructor(httpService: HttpService){
        super(httpService, "http://www.okx.com", 'okx');
    }

    async getPrice(symbol: string): Promise<number>{
        const pair = this.createPair(symbol);
        const exchangeSymbol = pair.toExchangeSymbol('okx');
        const data = await this.fetchData<OkxResponse>(
            '/api/v5/market/ticker', { instId: exchangeSymbol }
        ); 

        if(data.code != '0' || !data.data?.[0]){
            throw new Error('OKX API returned invalid data');
        }

        return parseFloat(data.data[0].last);
    }

}