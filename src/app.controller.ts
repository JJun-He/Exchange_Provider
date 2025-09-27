import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { timestamp } from "rxjs";
import { AppService } from "./app.service";


@ApiTags('App')
@Controller()
export class AppController{
    constructor(private readonly appService: AppService){}


    @Get()
    @ApiOperation({
        summary: 'API 기본 정보 및 Provider 시스템 소개'
    })
    getHello(): object{
        return this.appService.getHello();
    }

    @Get()
    @ApiOperation({summary: '헬스체크'})
    getHealth(){
        return{
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            providers: ['binance', 'okx', 'bithumb']
        };
    }
}