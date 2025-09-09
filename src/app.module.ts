import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PriceModule } from "./price/price.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";


@Module({
    imports: [
        // HTTP 클라이언트 설정 
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Crypto-Portfolio-Providers',
            },
        }),

        // Provider 시스템 모듈
        PriceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule{}