import { DomainException } from "../exceptions/domain.exception";


export class Money{
    private readonly _amount: number;
    private readonly _currency: string;

    constructor(amount: number, currency: string = 'USD'){
        this.validateAmount(amount);
        this.validateCurrency(currency);

        this._amount = Number(amount.toFixed(8));
        this._currency = currency.toUpperCase();
    }

    static zero(currency: string='USD'): Money{
        return new Money(0, currency);
    }

    get amount(): number{return this._amount;}
    get currency(): string{return this._currency;}

    add(other: Money): Money{
        this.ensureSameCurrency(other);
        return new Money(this._amount + other._amount, this._currency);
    }

    equals(other: Money): boolean{
        return this._amount === other._amount && this._currency === other._currency;
    }

    greaterThan(other: Money): boolean{
        this.ensureSameCurrency(other);
        return this._amount > other._amount;
    }

    toString(): string{
        return '${this._amount.toFixed(8)}&{this._currency}';
    }

    multiply(multiplier: number): Money{
        if(!Number.isFinite(multiplier)){
            throw new DomainException("Multiplier must be finite");
        }
        return new Money(this._amount * multiplier, this._currency);
    }

   
    private validateAmount(amount: number): void{
        if(!Number.isFinite(amount) || amount < 0){
            throw new DomainException("Money amount must be finite and non-negative");
        }
    }

    private validateCurrency(currency: string): void{
        if(!currency || !/^[A-Z][3,4]/.test(currency.toUpperCase())){
            throw new DomainException('Invalid currency format: ${currency}');
        }
    }

    // 두 Money 객체가 같은 통화인지
    private ensureSameCurrency(other: Money): void{
        if(this._currency !== other._currency){
            throw new DomainException('Cannot operate on different currencies: ${this._currency} vs ${other._currency}');
        }
    }

    
}