import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PortfolioCredential } from "./portfolio-credential.entity";
import { PortfolioBalance } from "./portfolio-balance.entity";
import { PortfolioTransaction } from "./portfolio-transaction.entity";


@Entity('exchanges')
export class Exchange{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'name', type: 'varchar', length: 100, unique: true})
    name: string;

    @Column({name: 'base_currency', type: 'text', nullable: true})
    baseCurrency: string;

    @Column({name: 'api_endpoint', type: 'text', nullable: true})
    apiEndpoint: string;

    @Column({name: 'logo_url', type: 'text', nullable: true})
    logoUrl: string;

    @Column({name: 'is_active', type: 'boolean', default: true})
    isActive: boolean;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @OneToMany(() => PortfolioCredential, credential => credential.exchange)
    credentials: PortfolioCredential[];

    @OneToMany(() => PortfolioBalance, balance => balance.exchange)
    balances: PortfolioBalance[];

    @OneToMany(() => PortfolioTransaction, transaction => transaction.exchange)
    transactions: PortfolioTransaction[];
}