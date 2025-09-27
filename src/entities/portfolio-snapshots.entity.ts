import { decimalTransformer } from "src/transformers/decimal.transformer";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Portfolio } from "./portfolio.entity";

@Entity('portfolio_snapshots')
@Index(['portfolioId', 'createdAt'])
export class PortfolioSnapShot{
    
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'portfolio_id', type: 'bigint'})
    portfolioId: string;

    @Column({
        name: 'balance',
        type: 'decimal',
        precision: 20, 
        scale: 2,
        transformer: decimalTransformer
    })
    balance: string;

    @Column({
        name: 'pnl',
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: decimalTransformer
    })
    pnl: string;

    @Column({
        name: 'roi',
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: decimalTransformer
    })
    roi: string;

    @Column({
        name: 'currency',
        type: 'varchar',
        length: 10
    })
    currency: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;  

    @ManyToOne(() => Portfolio, portfolio => portfolio.snapshots, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'portfolio_id'})
    portfolio: Portfolio;
}