import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PriceService } from "./price.service";
import { BinanceProvider } from "src/providers/binance.provider";
import { OkxProvider } from "src/providers/okx.provider";
import { BithumbProvider } from "src/providers/bithumb.provider";
import { PriceController } from "./price.controller";

@Module({
    imports: [HttpModule.register({timeout: 10000})],
    controllers: [PriceController],
    providers: [
        PriceService,
        {provide: 'BINANCE_PROVIDER', useClass: BinanceProvider},
        {provide: 'OKX_PROVIDER', useClass: OkxProvider},
        {provide: 'BITHUMB_PROVIDER', useClass: BithumbProvider},
    ],
    exports: [PriceService],
})
export class PriceModule{}