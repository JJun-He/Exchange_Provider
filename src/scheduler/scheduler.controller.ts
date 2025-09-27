import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PriceSchedulerService } from "./price-scheduler.service";


@ApiTags('스케줄러')
@Controller('scheduler')
export class SchedulerController{
    constructor(private readonly schedulerService: PriceSchedulerService){}

    @Get('status')
    @ApiOperation({summary: '스케줄러 상태 조회'})
    async getStatus(){
        return await this.schedulerService.getSchedulerStatus();
    }
}