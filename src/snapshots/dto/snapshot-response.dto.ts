import { ApiProperty } from '@nestjs/swagger';

export class SnapshotPointDto {
  @ApiProperty({
    description: '스냅샷 생성 시간 (ISO 8601 형식)',
  })
  ts: string;

  @ApiProperty({
    description: '포트폴리오 잔고 (USDT)',
  })
  balance: string;

  @ApiProperty({
    description: 'PnL',
  })
  pnl: string;

  @ApiProperty({
    description: 'ROI',
  })
  roi: string;
}

export class SnapshotDataDto {
  @ApiProperty({
    description: '통화',
  })
  currency: string;

  @ApiProperty({
    description: '스냅샷 포인트 배열',
    type: [SnapshotPointDto]
  })
  points: SnapshotPointDto[];
}

export class SnapshotResponseDto {
  @ApiProperty({
    description: '성공 여부',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '스냅샷 데이터',
    type: SnapshotDataDto
  })
  data: SnapshotDataDto;

  @ApiProperty({
    description: '응답 메시지',
  })
  message: string;
}
