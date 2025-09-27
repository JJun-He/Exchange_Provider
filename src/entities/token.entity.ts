import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PortfolioBalance } from "./portfolio-balance.entity";
import { TokenPriceSource } from "./token-price-source.entity";
import { TokenPrice } from "./token-price.entity";
import { PortfolioTransaction } from "./portfolio-transaction.entity";


@Entity('tokens')
export class Token{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'symbol', type: 'varchar', length: 20, unique: true})
    symbol: string;

    @Column({name: 'name', type: 'varchar', length: 200})
    name: string;

    @Column({name: 'logo_url', type: 'text', nullable: true})
    logoUrl: string;

    @Column({name: 'is_active',type: 'boolean', default: true})
    isActive: boolean;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(() => TokenPrice, price => price.token)
    prices: TokenPrice[];

    @OneToMany(() => TokenPriceSource, source => source.token)
    priceSources: TokenPriceSource[];

    @OneToMany(() => PortfolioBalance, balance => balance.token)
    balances: PortfolioBalance[];

    @OneToMany(() => PortfolioTransaction, transaction => transaction.token)
    transactions: PortfolioTransaction[];
}