import { DomainException } from "../exceptions/domain.exception";
import { Money } from "../money";
import { Exchange, Symbol } from "../symbol";


export class Price{
    private readonly _id: string;
    private readonly _symbol: Symbol;
    private readonly _value: Money;
    private readonly _exchange: Exchange;
    private readonly _timestamp: Date;

    constructor(
        id: string,
        symbol: Symbol,
        value: Money,
        exchange: Exchange,
        timestamp: Date = new Date()
    ){
        this.validateInputs(id, symbol, value, exchange);

        this._id = id;
        this._symbol = symbol;
        this._value = value;
        this._exchange = exchange;
        this._timestamp = timestamp;
    }

    static create(symbol: Symbol, value: Money, exchange: Exchange): Price{
        const id = '${exchange}_${symbol.value}_${Date.now()}';
        return new Price(id, symbol, value, exchange);
    }

    get id(): string{return this._id;}
    get symbol(): Symbol{return this._symbol;}
    get value(): Money{return this._value;}
    get exchange(): Exchange{return this._exchange;}
    get timestamp(): Date{return this._timestamp;}

    isStale(maxAgeMinutes: number): boolean{
        const ageInMinutes = (Date.now() - this._timestamp.getTime()) / (1000 * 60);
        return ageInMinutes > maxAgeMinutes;
    }

    caculateSpread(otherPrice: Price): Money{
        if(!this._symbol.equals(otherPrice._symbol)){
            throw new DomainException("Cannot calculate spread for different symbols");
        }

        const higher = this._value.greaterThan(otherPrice._value) ? this._value : otherPrice._value;
        const lower = this._value.greaterThan(otherPrice._value) ? otherPrice._value : this._value;

        return higher.substract(lower);
    }

    private validateInputs(id: string, symbol: Symbol, value: Money, exchange: Exchange): void{
        if(!id?.trim()) throw new DomainException("Price Id cannot be empty");
        if(!symbol) throw new DomainException("Symbol is required");
        if(!value || value.amount <= 0) throw new DomainException("Price value must be positive");
        if(!exchange) throw new DomainException("Exchange is required");
    }
}