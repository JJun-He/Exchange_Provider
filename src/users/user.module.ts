import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exchange } from "src/entities/exchange.entity";
import { PortfolioCredential } from "src/entities/portfolio-credential.entity";
import { User } from "src/entities/user.entity";
import { UsersController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Exchange, PortfolioCredential])
    ],
    controllers: [UsersController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule{}