import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserService } from "./users.service";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { CreateCredentialDto } from "./dto/create-credential.dto";


@ApiTags('Users')
@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UserService){}


    @Post()
    @ApiOperation({summary: '사용자 생성'})
    async createUser(@Body() createUserDto: CreateUserDto){
        const user = await this.usersService.createUser(createUserDto);
        return {
            message: '사용자가 성공적으로 생성되었습니다.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                provider: user.provider,
                preferredCurrency: user.preferredCurrency,
                isActive: user.isActive,
                createdAt: user.createdAt,
            }
        }
    }

    @Post(':id/credentials')
    @ApiOperation({summary: '거래소 연결 추가'})
    async createCredential(
        @Param('id') userId: string,
        @Body() createCredentialDto: CreateCredentialDto
    ){
        const credential = await this.usersService.createCredential(userId, createCredentialDto);
        return{
            message: '거래소 연결이 성공적으로 추가되었습니다.',
            credential: {
                id: credential.id,
                exchangeName: createCredentialDto.exchangeName,
                status: credential.status,
                createdAt: credential.createdAt,
            }
        };
    }

    @Get(':id/credentials')
    @ApiOperation({summary: '사용자 거래소 연결 조회'})
    async getUserCredentials(@Param('id') userId: string){
        const user = await this.usersService.getUserCredentials(userId);
        return {
            credentials: user.credentials.map(c => ({
                id: c.id,
                exchangeName: c.exchange.name,
                status: c.status,
                createdAt: c.createdAt,
            }))
        };
    }

}