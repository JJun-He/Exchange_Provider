import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Injectable()
export class SeedRunner implements OnApplicationBootstrap{
    constructor(private readonly seedService: SeedService){}

    async onApplicationBootstrap() {
        if(process.env.SEED==='true'){
            await this.seedService.run();
        }
    }
}