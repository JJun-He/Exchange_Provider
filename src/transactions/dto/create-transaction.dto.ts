import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumberString, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ description: '포트폴리오 ID' })
  @IsString()
  portfolioId: string;

  @ApiProperty({ description: '거래소 ID' })
  @IsString()
  exchangeId: string;

  @ApiProperty({ description: '토큰 ID' })
  @IsString()
  tokenId: string;

  @ApiProperty({ description: '트랜잭션 타입', enum: ['deposit', 'withdrawal'] })
  @IsEnum(['deposit', 'withdrawal'])
  type: 'deposit' | 'withdrawal';

  @ApiProperty({ description: '수량' })
  @IsNumberString()
  amount: string;

  @ApiProperty({ description: 'USDT 가치' })
  @IsNumberString()
  usdtValue: string;

  @ApiProperty({ description: '상태', enum: ['pending', 'success', 'failed'] })
  @IsEnum(['pending', 'success', 'failed'])
  status: 'pending' | 'success' | 'failed';

  @ApiProperty({ description: '트랜잭션 ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'timestamp' })
  @IsDateString()
  timestamp: Date;
}
