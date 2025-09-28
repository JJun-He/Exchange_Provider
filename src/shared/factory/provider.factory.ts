import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { BithumbProvider } from '../../providers/bithumb.provider';
import { BinanceProvider } from '../../providers/binance.provider';
import { OkxProvider } from '../../providers/okx.provider';

import { ExchangeProvider } from '../interfaces/exchange-provider.interface';
import { ExchangeType } from '../domain/pair';

@Injectable()
export class ProviderFactory {
  constructor(private readonly httpService: HttpService) {}

  createExchangeProvider(exchange: ExchangeType): ExchangeProvider {
    switch (exchange) {
      case ExchangeType.BINANCE:
        return new BinanceProvider(this.httpService);
      case ExchangeType.OKX:
        return new OkxProvider(this.httpService);
      case ExchangeType.BITHUMB:
        return new BithumbProvider(this.httpService);
    }
  }
}
