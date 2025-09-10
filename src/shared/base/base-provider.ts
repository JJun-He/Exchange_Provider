import { Injectable } from "@nestjs/common";
import {HttpService} from '@nestjs/axios';
import { ExtendedPriceProvider } from "../interfaces/price-provider.interface";
import { firstValueFrom } from "rxjs";
import { Exchange, Pair } from "../domain/pair";



@Injectable()
export abstract class BaseProvider implements ExtendedPriceProvider{
    constructor(
        protected readonly httpService: HttpService,
        protected readonly baseUrl: string,
        protected readonly exchange: Exchange
    ){
        // 초기화 시 baseUrl 확인
        console.log(`[${this.exchange}] Provider initialized with baseUrl: ${this.baseUrl}`);
    }

    abstract getPrice(symbol: string): Promise<number>;

    getExchangeName(): string {
        return this.exchange;
    }

    async healthCheck(): Promise<boolean> {
        try{
            // 각 거래소의 ping 엔드포인트 호출
            const pingEndpoint = this.getPingEndpoint();
            await this.fetchData(pingEndpoint, {}, 5000);
            return true;
        }catch{
            return false;
        }
    }

    // 완전히 새로운 fetchData 메서드 (URL 클래스 사용)
    protected async fetchData<T>(
        endpoint: string, 
        params: any = {}, 
        timeout = 15000
    ): Promise<T> {
        try {
            // URL 클래스로 안전한 URL 조합
            const fullUrl = new URL(endpoint, this.baseUrl).toString();
            
            // HTTP 요청 실행
            const response = await firstValueFrom(
                this.httpService.get(fullUrl, { 
                params,
                timeout,
                headers: {
                    'User-Agent': 'Crypto-Portfolio-API/1.0.0',
                    'Accept': 'application/json'
                }
                })
            );
            
            console.log(`[${this.exchange}] Success (${response.status}):`, response.data);
            return response.data;
        
        } catch (error: any) {
            const errorInfo = {
                exchange: this.exchange,
                baseUrl: this.baseUrl,
                endpoint: endpoint,
                fullUrl: `${this.baseUrl}${endpoint}`, 
                params,
                httpStatus: error.response?.status,
                httpStatusText: error.response?.statusText,
                responseData: error.response?.data,
                errorMessage: error.message,
                errorCode: error.code
            };
            
            console.error(`[${this.exchange}] Detailed Error:`, JSON.stringify(errorInfo, null, 2));
            
            // 에러 메시지
            let userMessage = `${this.exchange} API request failed`;
            throw new Error(userMessage);
        }
    }

    protected createPair(symbol: string){
        return Pair.parse(symbol);
    }

    // 거래소별 ping 엔드포인트
    private getPingEndpoint(): string {
        switch (this.exchange) {
        case 'binance': return '/api/v3/ping';
        case 'okx': return '/api/v5/public/time';
        case 'bithumb': return '/public/ticker/BTC_KRW';
        default: return '/ping';
        }
    }
}