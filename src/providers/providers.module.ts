import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ProviderFactory } from "../shared/factory/provider.factory";


@Module({
    imports: [
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
        }),
    ],
    providers: [ProviderFactory],
    exports: [ProviderFactory]    
})
export class ProvidersModule{}