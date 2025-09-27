import { Controller, Get, HttpException, HttpStatus, Param, ParseEnumPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PriceService } from "./price.service";
import { symbol } from "joi";
import { timestamp } from "rxjs";
import { Exchange } from "src/shared/domain/pair";

@ApiTags('Price')
@Controller('price')
export class PriceController{
    constructor(private readonly priceService: PriceService){}

    @Get(':exchange/:symbol')
    @ApiOperation({summary: 'Get price from specific exchange'})
    async getPrice(
        @Param('exchange', new ParseEnumPipe(Exchange, {
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        })) exchange: Exchange,
        @Param('symbol') symbol: string,
    ){
        try{
            const price = await this.priceService.getPrice(exchange, symbol);
            return {
                exchange,
                symbol: symbol.toUpperCase(),
                price,
                timestamp: new Date().toISOString()
            };
        }catch(error){
            if(error.message.includes('상장 코인이 아닙니다')){
                throw new HttpException(
                    `Symbol ${symbol} is not listed on ${exchange}`,
                    HttpStatus.NOT_FOUND
                );
            }
            throw new HttpException(
                `Failed to get price: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}