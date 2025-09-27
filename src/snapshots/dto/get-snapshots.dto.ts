import { IsOptional, IsString, IsNumberString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetSnapshotsDto {
  @ApiProperty({
    description: '통화 (기본값: USDT)',
    required: false
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: '시작 날짜 (ISO 8601 형식)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiProperty({
    description: '종료 날짜 (ISO 8601 형식)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  end?: string;

  @ApiProperty({
    description: '조회할 스냅샷 개수 제한',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  limit?: number;
}
