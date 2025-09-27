import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export enum Currency{
    USD = 'USD',
    KRW = 'KRW',
}

export class CreateUserDto{
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    provider: string = 'manual';

    @IsOptional()
    @IsString()
    providerId?: string;

    @IsOptional()
    @IsString()
    profileImageUrl?: string;

    @IsOptional()
    @IsEnum([Currency])
    preferredCurrency?: Currency;

    @IsOptional()
    @IsBoolean()
    isActive?:boolean;
}