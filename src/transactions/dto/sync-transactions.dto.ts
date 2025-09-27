import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SyncTransactionsDto {
  @ApiProperty({ description: '거래소별 인증 정보' })
  @IsObject()
  credentials: {
    binance?: {apiKey: string, secretKey: string};
    okx?: {apiKey: string, secretKey: string, passphrase: string};
    bithumb?: {apiKey: string, secretKey: string};
  };
}
