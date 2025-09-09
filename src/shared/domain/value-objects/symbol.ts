import { DomainException } from "../exceptions/domain.exception";

export enum Exchange{
    BINANCE = 'binance',
    OKX = 'okx',
    BITHUMB = 'bithumb'
}

export class Symbol{
    private readonly _value: string;
    private readonly _baseAsset: string;
    private readonly _quoteAsset: string;

    constructor(value: string){
    }

    get value(): string{return this._value;}
    get baseAsset(): string{return this._baseAsset;}
    get quoteAsset(): string{return this._quoteAsset;}

    toExchangeFormat(exchange: Exchange): string{
        switch(exchange){
            case Exchange.BINANCE:
                return this._value; // BTCUSDT
            case Exchange.OKX:
                return '${this._baseAsset}-${this._quoteAsset}'; // BTC-USDT
            case Exchange.BITHUMB:
                const quote = this._quoteAsset === 'USDT' ? 'KRW': this._quoteAsset;
                return '${this._baseAsset}_${quote}'; // BTC_KRW
            default:
                throw new DomainException('Unsupported exchange: ${exchange}');
        }
    }

    equals(other: Symbol): boolean{
        return this._value === other._value;
    }

    // 심볼(Symbol) 문자열이 올바른지
    private validateSymbol(value: string): void{
        if(!value || !/^[A-Z]{2,10}(USDT|BTC|ETH|KRW|BUSD)$/.test(value.toUpperCase())){
            throw new DomainException('Invalid symbol format: ${value}');
        }
    }

    // 심볼 문자열을 [기초자산(Base), 상대자산(Quote)] 형태로 나눔
    private parseSymbol(value: string): [string, string]{
        const quoteAssets = ['USDT', 'BUSD', 'BTC', 'ETH', 'KRW'];

        for(const quote of quoteAssets){
            if(value.endsWith(quote)){
                const base = value.substring(0, value.length - quote.length);
                if(base.length >= 2) return [base, quote];
            }
        }

        throw new DomainException('Cannot parse symbol: ${value}');
    }
}