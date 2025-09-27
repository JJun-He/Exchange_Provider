import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class GetTransactionDto {
  @ApiProperty({ description: '시작 날짜', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '종료 날짜', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '거래소 ID', required: false })
  @IsOptional()
  @IsString()
  exchangeId?: string;

  @ApiProperty({ description: '트랜잭션 타입', required: false, enum: ['deposit', 'withdrawal'] })
  @IsOptional()
  @IsEnum(['deposit', 'withdrawal'])
  type?: 'deposit' | 'withdrawal';

  @ApiProperty({ description: '상태', required: false, enum: ['pending', 'success', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'success', 'failed'])
  status?: 'pending' | 'success' | 'failed';
}
