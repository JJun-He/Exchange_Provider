import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Exchange } from "./exchange.entity";


export enum CredentialStatus{
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ERROR = 'error',
    EXPIRES = 'expires'
}

@Entity('portfolio_credentials')
@Index(['userId', 'exchangeId'], {unique: true})
export class PortfolioCredential{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'user_id', type: 'bigint'})
    userId: string;

    @Column({name: 'exchange_id', type: 'bigint'})
    exchangeId: string;

    @Column({name: 'encrypted_api_key', type: 'text', nullable: true})
    encryptedApiKey: string;

    @Column({name: 'encrypted_secret_key', type: 'text', nullable: true})
    encryptedSecretKey: string;

    @Column({name: 'encrypted_data_key', type: 'text', nullable: true})
    encryptedDataKey: string;

    @Column({
        name: 'status',
        type: 'enum',
        enum: CredentialStatus,
        default: CredentialStatus.ACTIVE
    })
    status: CredentialStatus;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => User, user => user.credentials, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Exchange, exchange => exchange.credentials)
    @JoinColumn({name: 'exchange_id'})
    exchange: Exchange;
}