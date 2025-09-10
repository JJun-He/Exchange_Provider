import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { BinanceProvider } from "src/providers/binance.provider";
import { OkxProvider } from "src/providers/okx.provider";
import { BithumbProvider } from "src/providers/bithumb.provider";
import { PriceController } from "./price.controller";
import { PRICE_PROVIDER_MAP } from "./token";
import { PriceProvider } from "src/shared/interfaces/price-provider.interface";

type Exchange = 'binance' | 'okx' | 'bithumb';

@Module({
    imports: [HttpModule.register({timeout: 10000})],
    controllers: [PriceController],
    providers: [
        // 개별 Provider들
        BinanceProvider,
        OkxProvider,
        BithumbProvider,
        
        {
            provide: PRICE_PROVIDER_MAP,
            useFactory: (
                binance: BinanceProvider,
                okx: OkxProvider,
                bithumb: BithumbProvider,
            ): Map<Exchange, PriceProvider> => {
                return new Map<Exchange, PriceProvider>([
                    ['binance', binance],
                    ['okx', okx],
                    ['bithumb', bithumb],
                ]);
            },
            inject: [BinanceProvider, OkxProvider, BithumbProvider],   
        },

        PriceService,
    ],
    exports: [PriceService],
})
export class PriceModule{}