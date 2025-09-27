import { IsEnum, IsOptional, IsString } from "class-validator";
import { CredentialStatus } from "src/entities/portfolio-credential.entity";

export class CreateCredentialDto{
    @IsString()
    exchangeName: string; // 'binance', 'okx', 'bithumb'

    @IsOptional()
    @IsString()
    apiKey?: string;

    @IsOptional()
    @IsString()
    secretKey?: string;

    @IsOptional()
    @IsString()
    passphrase?: string; // OKX용

    @IsOptional()
    @IsEnum(CredentialStatus)
    status?: CredentialStatus;
}