import { HttpService } from "@nestjs/axios";
import { Exchange } from "../domain/symbol";
import { PriceProvider } from "../interfaces/price-provider.interface";
import { BinaceProvider } from "src/providers/binance.provider";
import { OkxProvider } from "src/providers/okx.provider";
import { BithumbProvider } from "src/providers/bithumb.provider";


// 해당 거래소용 Provider로 매핑
export function createProvider(exchange: Exchange): PriceProvider{
    const httpService = new HttpService();


    switch (exchange){
        case 'binance':
            return new BinaceProvider(httpService);
        case 'okx':
            return new OkxProvider(httpService);
        case 'bithumb':
            return new BithumbProvider(httpService);
        default:
            throw new Error('Unsupported exchange: ${exchange}');
    }
}