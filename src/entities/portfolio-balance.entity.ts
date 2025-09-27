import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Portfolio } from "./portfolio.entity";
import { Token } from "./token.entity";
import { Exchange } from "./exchange.entity";
import { decimalTransformer } from "src/transformers/decimal.transformer";


@Entity('portfolio_balances')
@Index(['portfolioId', 'tokenId', 'exchangeId'], {unique: true})
export class PortfolioBalance{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;
    
    @Column({name: 'portfolio_id', type: 'bigint'})
    portfolioId: string;

    @Column({name: 'token_id', type: 'bigint'})
    tokenId: string;

    @Column({name: 'exchange_id', type: 'bigint'})
    exchangeId: string;

    @Column({
        name: 'amount',
        type: 'decimal', 
        precision: 20, 
        scale: 8,
        transformer: decimalTransformer
    })
    amount: string;

    @Column({
        name: 'avg_buy_price',
        type: 'decimal', 
        precision: 20, 
        scale: 8, 
        nullable: true,
        transformer: decimalTransformer
    })
    avgBuyPrice: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => Portfolio, portfolio => portfolio.balances, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'portfolio_id'})
    portfolio: Portfolio;

    @ManyToOne(() => Token, token => token.balances)
    @JoinColumn({name: 'token_id'})
    token: Token;

    @ManyToOne(() => Exchange, exchange => exchange.balances)
    @JoinColumn({name: 'exchange_id'})
    exchange: Exchange;
}