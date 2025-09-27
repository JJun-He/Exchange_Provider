import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { BaseProvider } from 'src/shared/base/base-provider';
import { Exchange } from 'src/shared/domain/pair';
import * as crypto from 'crypto';
import { AccountBalance } from 'src/shared/interfaces/account-balance.interface';

interface BinanceResponse {
  symbol: string;
  price: string;
}

@Injectable()
export class BinanceProvider extends BaseProvider {
  protected apiKey: string = '';
  protected secretKey: string = '';

  constructor(httpService: HttpService, apiKey?: string, secretKey?: string) {
    super(httpService, 'https://api.binance.com', Exchange.BINANCE);
    this.apiKey = apiKey || '';
    this.secretKey = secretKey || '';
  }

  // 현재가 조회
  async getPrice(symbol: string): Promise<number> {
    const data = await this.makeRequest<BinanceResponse>(
      '/api/v3/ticker/price',
      'GET',
      { symbol: symbol },
    );

    return parseFloat(data.price);
  }

  // API 키 설정 메서드
  setCredentials(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  // Binance API 인증 헤더 생성
  protected async getAuthHeaders(
    method: string,
    endpoint: string,
    params: any,
  ): Promise<Record<string, string>> {
    const timestamp = Date.now();
    const queryString = this.createQueryString({ ...params, timestamp });
    const signature = this.createSignature(queryString);

    return {
      'X-MBX-APIKEY': this.apiKey,
      signature: signature,
    };
  }

  // Query String 생성
  private createQueryString(params: any): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  // HMAC SHA256 서명 생성
  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  // Binance 에러 처리
  protected handleError(error: any): Error {
    if (error.response?.data) {
      const binanceError = error.response.data;
      return new Error(
        `Binance API Error: ${binanceError.msg} (Code: ${binanceError.code})`,
      );
    }
    return new Error(`Binance API Request Failed: ${error.message}`);
  }

  // 입금 조회 (페이지네이션 지원)
  async getDepositHistory(
    startTime: number,
    endTime: number,
    status: number = 1,
    offset: number = 0,
    limit: number = 1000,
  ) {
    const params = {
      startTime,
      endTime,
      status,
      offset,
      limit,
    };

    return this.makeRequest('/sapi/v1/capital/deposit/hisrec', 'GET', params);
  }

  // 출금 조회 (페이지네이션 지원)
  async getWithdrawalHistory(
    startTime: number,
    endTime: number,
    status: number = 1,
    offset: number = 0,
    limit: number = 1000,
  ) {
    const params = {
      startTime,
      endTime,
      status,
      offset,
      limit,
    };

    return this.makeRequest('/sapi/v1/capital/withdraw/history', 'GET', params);
  }

  // 모든 입금 내역 조회 (페이지네이션 자동 처리)
  async getAllDepositHistory(
    startTime: number,
    endTime: number,
    status: number = 1,
  ): Promise<any[]> {
    const allTransactions: any[] = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const result = await this.getDepositHistory(
        startTime,
        endTime,
        status,
        offset,
        limit,
      );
      if (!result || result.length === 0) break;

      allTransactions.push(...result);
      if (result.length < limit) break; // 마지막 페이지

      offset += limit;
    }

    return allTransactions;
  }

  // 모든 출금 내역 조회 (페이지네이션 자동 처리)
  async getAllWithdrawalHistory(
    startTime: number,
    endTime: number,
    status: number = 1,
  ): Promise<any[]> {
    const allTransactions: any[] = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const result = await this.getWithdrawalHistory(
        startTime,
        endTime,
        status,
        offset,
        limit,
      );
      if (!result || result.length === 0) break;

      allTransactions.push(...result);
      if (result.length < limit) break; // 마지막 페이지

      offset += limit;
    }

    return allTransactions;
  }

  // 잔고 조회
  async getAccountBalances(): Promise<AccountBalance[]> {
    const data = await this.makeRequest('/api/v3/account', 'GET', {});

    return data.balances.filter((balance: any) => ({
      asset: balance.asset,
      free: balance.free,
      locked: balance.locked,
      total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString(),
    }));
  }
}
