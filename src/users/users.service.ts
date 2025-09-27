import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Exchange } from "src/entities/exchange.entity";
import { CredentialStatus, PortfolioCredential } from "src/entities/portfolio-credential.entity";
import { User } from "src/entities/user.entity";
import { DeepPartial, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { CreateCredentialDto } from "./dto/create-credential.dto";


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Exchange)
        private readonly exchangeRepo: Repository<Exchange>,
        @InjectRepository(PortfolioCredential)
        private readonly credentialRepo: Repository<PortfolioCredential>,
    ){}

    async createUser(createUserDto: CreateUserDto): Promise<User>{
        // 이메일 중복 체크
        const existingUser = await this.userRepo.findOneBy({
            email: createUserDto.email
        });

        if(existingUser){
            throw new ConflictException("이미 존재하는 이메일입니다.");
        }

        return await this.userRepo.save({
            email: createUserDto.email,
            name: createUserDto.name,
            provider: createUserDto.provider || 'manual', 
            providerId: createUserDto.providerId || `manual${Date.now()}`, 
            profileImageUrl: createUserDto.profileImageUrl ?? null,
            preferredCurrency: createUserDto.preferredCurrency ?? 'USD',
            isActive: createUserDto.isActive ?? true,
            updatedAt: new Date(),
        } as DeepPartial<User>);
    }

    async createCredential(userId: string, createCredentialDto: CreateCredentialDto): Promise<PortfolioCredential>{
        // 사용자 존재 확인
        const user = await this.userRepo.findOneBy({id: userId});
        if(!user){
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        // 거래소 조회
        const exchange = await this.exchangeRepo.findOneBy({
            name: createCredentialDto.exchangeName
        });
        if(!exchange){
            throw new NotFoundException("거래소를 찾을 수 없습니다.");
        }

        // 기존 credential 확인
        const existingCredential = await this.credentialRepo.findOneBy({
            userId: userId, exchangeId: exchange.id
        });

        if(existingCredential){
            throw new ConflictException("이미 해당 거래소에 연결되어 있습니다.");
        }

        // credential 생성
        return await this.credentialRepo.save({
            userId: userId,
            exchangeId: exchange.id,
            encryptedApiKey: createCredentialDto.apiKey ? this.simpleEncrypt(createCredentialDto.apiKey) : null,
            encryptedSecretKey: createCredentialDto.secretKey ? this.simpleEncrypt(createCredentialDto.secretKey) : null,
            encryptedDataKey: createCredentialDto.passphrase ? this.simpleEncrypt(createCredentialDto.passphrase) : 'dummyDataKey',
            status: createCredentialDto.status ?? CredentialStatus.ACTIVE,
            updatedAt: new Date(),
        } as DeepPartial<PortfolioCredential>);

    }

    async getUserCredentials(userId: string): Promise<User>{
        const user = await this.userRepo.findOne({
            where: {id: userId},
            relations: ['credentials', 'credentials.exchange'],
        });

        if(!user){
            throw new NotFoundException("사용자를 찾을 수 없습니다.");
        }

        return user;
    }

    // 간단한 암호화
    private simpleEncrypt(text: string): string{
        return Buffer.from(text).toString('base64');
    }
}