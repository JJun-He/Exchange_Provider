import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { BaseProvider } from 'src/shared/base/base-provider';
import { ExchangeType } from 'src/shared/domain/pair';
import * as crypto from 'crypto';
import { AccountBalance } from 'src/shared/interfaces/account-balance.interface';

interface OkxResponse {
  code: string;
  data: Array<{ instId: string; last: string }>;
}

@Injectable()
export class OkxProvider extends BaseProvider {
  protected apiKey: string = '';
  protected secretKey: string = '';
  protected passphrase: string = '';

  constructor(
    httpService: HttpService,
    apiKey?: string,
    secretKey?: string,
    passphrase?: string,
  ) {
    super(httpService, 'https://www.okx.com', ExchangeType.OKX);
    this.apiKey = apiKey || '';
    this.secretKey = secretKey || '';
    this.passphrase = passphrase || '';
  }

  // 현재가 조회
  async getPrice(symbol: string): Promise<number> {
    const data = await this.makeRequest<OkxResponse>(
      '/api/v5/market/ticker',
      'GET',
      { instId: symbol },
    );

    if (data.code != '0' || !data.data?.[0]) {
      throw new Error('OKX API returned invalid data');
    }

    return parseFloat(data.data[0].last);
  }

  // API 키 설정 메서드
  setCredentials(apiKey: string, secretKey: string, passphrase: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;
  }

  // OKX API 인증 헤더 생성
  protected async getAuthHeaders(
    method: string,
    endpoint: string,
    params: any,
  ): Promise<Record<string, string>> {
    const timestamp = new Date().toISOString();
    const body = method === 'GET' ? '' : JSON.stringify(params);
    const message = timestamp + method + endpoint + body;

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');

    return {
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json',
    };
  }

  // OKX 에러 처리
  protected handleError(error: any): Error {
    if (error.response?.data) {
      const okxError = error.response.data;
      return new Error(
        `OKX API Error: ${okxError.msg} (Code: ${okxError.code})`,
      );
    }
    return new Error(`OKX API Request Failed: ${error.message}`);
  }

  // 입금 내역 조회
  async getDepositHistory(
    ccy?: string,
    state: number = 2,
    after?: number,
    before?: number,
  ) {
    const params: any = { state };
    if (ccy) params.ccy = ccy;
    if (after) params.after = after;
    if (before) params.before = before;

    return this.makeRequest('/api/v5/asset/deposit-history', 'GET', params);
  }

  // 출금 내역 조회
  async getWithdrawalHistory(
    ccy?: string,
    state: number = 2,
    after?: number,
    before?: number,
  ) {
    const params: any = { state };
    if (ccy) params.ccy = ccy;
    if (after) params.after = after;
    if (before) params.before = before;

    return this.makeRequest('/api/v5/asset/withdrawal-history', 'GET', params);
  }

  // OKX Provider
  async getAccountBalances(): Promise<AccountBalance[]> {
    const data = await this.makeRequest('/api/v5/account/balance', 'GET', {});

    if (data.code != '0' || !data.data?.[0]) {
      throw new Error('OKX API returned invalid data');
    }

    const accountData = data.data[0];
    const balances: AccountBalance[] = [];

    accountData.details.forEach((detail: any) => {
      if (parseFloat(detail.eq) > 0) {
        balances.push({
          asset: detail.ccy,
          free: detail.availBal,
          locked: (
            parseFloat(detail.eq) - parseFloat(detail.availBal)
          ).toString(),
          total: detail.eq,
        });
      }
    });

    return balances;
  }
}
