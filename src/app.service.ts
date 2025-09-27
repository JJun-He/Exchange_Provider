import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService{
    getHello(){
        return{
            message: 'Crypto Provider API',
            exchanges: ['binance', 'okx', 'bithumb']
        }
    }
}