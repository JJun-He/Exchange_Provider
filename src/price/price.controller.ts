import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PriceService } from "./price.service";
import { Exchange } from "src/shared/domain/symbol";
import { symbol } from "joi";
import { timestamp } from "rxjs";

@ApiTags('Price')
@Controller('price')
export class PriceController{
    constructor(private readonly priceService: PriceService){}

    @Get(':exchange/:symbol')
    @ApiOperation({summary: 'Get price from specific exchange'})
    async getPrice(
        @Param('exchange') exchange: Exchange,
        @Param('symbol') symbol: string,
    ){
        const price = await this.priceService.getPrice(exchange, symbol);
        return {
            exchange,
            symbol: symbol.toUpperCase(),
            price,
            timestamp: new Date().toISOString()
        };
    }
}