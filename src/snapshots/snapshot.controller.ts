import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { SnapShotService } from "./snapshot.service";
import { CreateSnapshotDto } from "./dto/create-snapshot.dto";
import { GetSnapshotsDto } from "./dto/get-snapshots.dto";
import { SnapshotResponseDto } from "./dto/snapshot-response.dto";


@ApiTags('Snapshots')
@Controller('portfolios/:id/snapshots')
export class SnapShotController{
    constructor(private readonly snapshotService: SnapShotService){}

    // 스냅샷 생성
    @Post()
    @ApiOperation({ summary: '포트폴리오 스냅샷 생성' })
    @ApiResponse({ status: 201, description: '스냅샷 생성 성공', type: SnapshotResponseDto })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async createSnapShot(
        @Param('id') portfolioId: string,
        @Body() body: CreateSnapshotDto = {}
    ){
        const snapshot = await this.snapshotService.createSnapshot(
            portfolioId,
            body.currency || 'USDT'
        );
        
        return {
            success: true,
            data: {
                currency: snapshot.currency,
                points: [{
                    ts: snapshot.createdAt.toISOString(),
                    balance: snapshot.balance,
                    pnl: snapshot.pnl,
                    roi: snapshot.roi
                }]
            },
            message: 'success'
        };
    }

    // 스냅샷 조회
    @Get()
    @ApiOperation({ summary: '포트폴리오 스냅샷 조회' })
    @ApiResponse({ status: 200, description: '스냅샷 조회 성공', type: SnapshotResponseDto })
    async getSnapshots(
        @Param('id') portfolioId: string,
        @Query() query: GetSnapshotsDto
    ){
        return this.snapshotService.getSnapshots(
            portfolioId,
            query.currency,
            query.start,
            query.end,
            query.limit
        );
    }

    
}