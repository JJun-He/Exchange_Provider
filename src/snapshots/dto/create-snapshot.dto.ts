import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSnapshotDto {
  @ApiProperty({
    description: '통화(기본값: USDT)',
    required: false
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
