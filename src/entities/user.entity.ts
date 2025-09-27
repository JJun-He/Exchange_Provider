import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PortfolioCredential } from "./portfolio-credential.entity";
import { Portfolio } from "./portfolio.entity";


@Entity("users")
export class User{

    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'email', type: 'varchar', length: 100, unique: true})
    email: string;

    @Column({name: 'provider', type: 'varchar', length: 50, nullable: true})
    provider: string;

    @Column({name: 'provider_id', type: 'varchar', length: 255, nullable: true})
    providerId: string;

    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;

    @Column({name: 'profile_image_url', type: 'text', nullable: true})
    profileImageUrl: string;

    @Column({name: 'preferred_currency', type: 'varchar', length: 10, default: 'USD'})
    preferredCurrency: string;

    @Column({name: 'is_active', type: 'boolean', default: true})
    isActive: boolean;

    @CreateDateColumn({name: 'created_at',type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(() => Portfolio, portfolio => portfolio.user)
    portfolios: Portfolio[];

    @OneToMany(() => PortfolioCredential, credential => credential.user)
    credentials: PortfolioCredential[];
}