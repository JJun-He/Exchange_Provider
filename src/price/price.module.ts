import { Module } from "@nestjs/common";

@Module({
    imports: [HttpModule.register({timeout: 10000})],
    controllers: [],
    providers: [
        
    ],
    exports: [],
})
export class PriceModule{}