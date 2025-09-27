

export enum Exchange {
    BINANCE = 'binance',
    OKX = 'okx',
    BITHUMB = 'bithumb'
}

export class Pair{
    constructor(public base: string, public quote: string){
        this.base = base.toUpperCase();
        this.quote = quote.toUpperCase();
    }

    static parse(input: string): Pair{
        const s = input.toUpperCase().trim();

        if(s.includes('-')){
            const [b, q] = s.split('-');
            return new Pair(b, q);
        }
        if(s.includes('_')){
            const [b, q] = s.split('_');
            return new Pair(b, q);
        }

        const QUOTES = ['USDT', 'BTC', 'ETH', 'KRW', "BUSD"];
        for(const q of QUOTES){
            if(s.endsWith(q)){
                const b = s.slice(0, s.length - q.length);
                if(b.length >= 2) 
                    return new Pair(b, q);
            }
        }

        return new Pair(s, 'USDT');
    }

    toExchangeSymbol(exchange: Exchange): string{
        switch(exchange){
            case Exchange.BINANCE:
                return `${this.base}${this.quote}`; // BTCUSDT
            case Exchange.OKX:
                return `${this.base}-${this.quote}`; // BTC-USDT
            case Exchange.BITHUMB: {
                const q = this.quote === 'USDT' ? 'KRW' : this.quote; // USDT → KRW
                return `${this.base}_${q}`; // BTC_KRW
            }
            default:
                return `${this.base}${this.quote}`;

        }
    }
}