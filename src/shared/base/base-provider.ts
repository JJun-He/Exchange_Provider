import { Injectable } from "@nestjs/common";
import {HttpService} from '@nestjs/axios';
import { ExtendedPriceProvider } from "../interfaces/price-provider.interface";
import { Exchange, Symbol } from "../domain/symbol";
import { firstValueFrom } from "rxjs";



@Injectable()
export abstract class BaseProvider implements ExtendedPriceProvider{
    constructor(
        protected readonly httpService: HttpService,
        protected readonly baseUrl: string,
        protected readonly exchange: Exchange
    ){}

    abstract getPrice(symbol: string): Promise<number>;

    getExchangeName(): string {
        return this.exchange;
    }

    async healthCheck(): Promise<boolean> {
        try{
            // 각 거래소의 ping 엔드포인트 호출
            await this.fetchData('/ping', {}, 5000);
            return true;
        }catch{
            return false;
        }
    }

    // 공통 HTTP 호출 메서드
    protected async fetchData<T>(
        endpoint: string,
        params: any = {},
        timeout = 10000
    ): Promise<T>{
        try{
            const response = await firstValueFrom(
                this.httpService.get('${this.baseUrl}${endpoint}', {
                    params,
                    timeout
                })
            );
            return response.data;
        }catch(error: any){
            throw new Error('${this.exchange} API error: ${error.message}');
        }
    }

    protected createSymbol(symbolStr: string): Symbol{
        return new Symbol(symbolStr);
    }
}