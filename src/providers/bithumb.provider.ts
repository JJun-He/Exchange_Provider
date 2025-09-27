import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { BaseProvider } from "src/shared/base/base-provider";
import { Exchange } from "src/shared/domain/pair";
import * as crypto from 'crypto';

interface BithumbResponse{
    status: string;
    data: {closingPrice: string};
}

@Injectable()
export class BithumbProvider extends BaseProvider{
    private readonly usdKrwRate = 1300; // 임시 고정 환율
    protected apiKey: string = '';
    protected secretKey: string = '';

    constructor(httpService: HttpService, apiKey: string, secretKey: string) {
        super(httpService, 'https://api.bithumb.com', Exchange.BITHUMB);
        this.apiKey = apiKey || '';
        this.secretKey = secretKey || '';
    }

    async getPrice(symbol: string): Promise<number>{
        const data = await this.makeRequest<BithumbResponse>(
            `/public/ticker/${symbol}_KRW`,
            'GET'
        );

        if(data.status != '0000'){
            throw new Error('Bithumb API error');
        }

        const krwPrice = parseFloat(data.data.closingPrice);
        return krwPrice / this.usdKrwRate; // KRW -> USD
    }

    // API 키 설정 메서드
    setCredentials(apiKey: string, secretKey: string) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
    }

    // Bithumb API 인증 헤더 생성
    protected async getAuthHeaders(
        method: string,
        endpoint: string,
        params: any
    ): Promise<Record<string, string>> {
        const nonce = Date.now().toString();
        const queryString = this.createQueryString(params);
        const signature = this.createSignature(endpoint, queryString, nonce);

        return {
            'Api-Key': this.apiKey,
            'Api-Sign': signature,
            'Api-Nonce': nonce,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    // Query String 생성
    private createQueryString(params: any): string {
        return Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    // HMAC SHA512 서명 생성
    private createSignature(endpoint: string, queryString: string, nonce: string): string {
        const message = endpoint + ';' + queryString + ';' + nonce;
        return crypto
            .createHmac('sha512', this.secretKey)
            .update(message)
            .digest('hex');
    }

    // Bithumb 에러 처리
    protected handleError(error: any): Error {
        if (error.response?.data) {
            const bithumbError = error.response.data;
            return new Error(`Bithumb API Error: ${bithumbError.message} (Status: ${bithumbError.status})`);
        }
        return new Error(`Bithumb API Request Failed: ${error.message}`);
    }

    // 입출금 내역 조회 메서드 추가
    async getUserTransactions(offset: number = 0, limit: number = 100, searchGb: number = 0) {
        const params = {
            offset,
            limit,
            searchGb
        };
        
        return this.makeRequest('/info/user_transactions', 'POST', params);
    }

    // 모든 입출금 내역 조회 (페이지네이션 자동 처리)
    async getAllUserTransactions(searchGb: number = 0): Promise<any[]> {
        const allTransactions: any[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const result = await this.getUserTransactions(offset, limit, searchGb);
            if (!result || result.length === 0) break;
            
            allTransactions.push(...result);
            if (result.length < limit) break; // 마지막 페이지
            
            offset += limit;
        }

        return allTransactions;
    }
}