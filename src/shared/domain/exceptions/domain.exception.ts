export class DomainException extends Error{
    constructor(message: string, public readonly code ?: string){
        super(message);
        this.name = 'DomainException';
    }
}

export class InfrastructureException extends Error{
    constructor(message: string, public readonly cause ?: Error){
        super(message);
        this.name = 'InfrastructureException';
    }
}