import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { BithumbProvider } from "../../providers/bithumb.provider";
import { BinanceProvider } from "../../providers/binance.provider";
import { OkxProvider } from "../../providers/okx.provider";


@Injectable()
export class ProviderFactory{
    constructor(private readonly httpService: HttpService){}

    createBinanceProvider(apiKey: string, secretKey: string): BinanceProvider {
        return new BinanceProvider(this.httpService, apiKey, secretKey);
    }

    createOkxProvider(apiKey: string, secretKey: string, passphrase: string): OkxProvider {
        return new OkxProvider(this.httpService, apiKey, secretKey, passphrase);
    }

    createBithumbProvider(apiKey: string, secretKey: string): BithumbProvider {
        return new BithumbProvider(this.httpService, apiKey, secretKey);
    }
}