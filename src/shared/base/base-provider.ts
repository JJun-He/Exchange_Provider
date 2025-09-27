import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ExtendedPriceProvider } from '../interfaces/price-provider.interface';
import { firstValueFrom } from 'rxjs';
import { Exchange, Pair } from '../domain/pair';
import { AccountBalance } from '../interfaces/account-balance.interface';

@Injectable()
export abstract class BaseProvider implements ExtendedPriceProvider {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly baseUrl: string,
    protected readonly exchange: Exchange,
    protected readonly apiKey: string = '',
    protected readonly secretKey: string = '',
  ) {}

  abstract getPrice(symbol: string): Promise<number>;

  getExchangeName(): string {
    return this.exchange;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // 각 거래소의 ping 엔드포인트 호출
      const pingEndpoint = this.getPingEndpoint();
      await this.makeRequest(pingEndpoint, 'GET', {});
      return true;
    } catch {
      return false;
    }
  }

  // 공통 HTTP 요청 메서드
  protected async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    params: any = {},
  ): Promise<T> {
    try {
      // URL 클래스로 안전한 URL 조합
      const fullUrl = new URL(endpoint, this.baseUrl).toString();

      const config: any = {
        method,
        url: fullUrl,
        headers: {
          'User-Agent': 'Crypto-Portfolio-API/1.0.0',
          Accept: 'application/json',
        },
      };

      // GET 요청인 경우 params를 query로 설정
      if (method === 'GET') {
        config.params = params;
      } else {
        // POST/PUT/DELETE 요청인 경우 body에 설정
        config.data = params;
      }

      // 거래소별 인증 헤더 추가
      const authHeaders = await this.getAuthHeaders(method, endpoint, params);
      config.headers = { ...config.headers, ...authHeaders };

      const response = await firstValueFrom(this.httpService.request(config));

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // 거래소별 인증 헤더 생성 (추상 메서드)
  protected abstract getAuthHeaders(
    method: string,
    endpoint: string,
    params: any,
  ): Promise<Record<string, string>>;

  // 거래소별 에러 처리 (추상 메서드)
  protected abstract handleError(error: any): Error;

  abstract getAccountBalances(): Promise<AccountBalance[]>;

  protected createPair(symbol: string) {
    return Pair.parse(symbol);
  }

  // 거래소별 ping 엔드포인트
  private getPingEndpoint(): string {
    switch (this.exchange) {
      case Exchange.BINANCE:
        return '/api/v3/ping';
      case Exchange.OKX:
        return '/api/v5/public/time';
      case Exchange.BITHUMB:
        return '/public/ticker/BTC_KRW';
      default:
        return '/ping';
    }
  }
}
