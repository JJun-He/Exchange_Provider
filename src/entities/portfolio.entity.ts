import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { PortfolioBalance } from "./portfolio-balance.entity";
import { PortfolioSnapShot } from "./portfolio-snapshots.entity";
import { PortfolioTransaction } from "./portfolio-transaction.entity";


@Entity('portfolios')
export class Portfolio{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'user_id', type: 'bigint'})
    userId: string;

    @Column({name: 'name', type: 'varchar', length: 100})
    name: string;

    @Column({name: 'description', type: 'varchar', length: 255, nullable: true})
    description: string;

    @Column({name: 'is_manual', type: 'boolean', default: false})
    isManual: boolean;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => User, user => user.portfolios, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => PortfolioBalance, balance => balance.portfolio)
    balances: PortfolioBalance[];

    @OneToMany(() => PortfolioSnapShot, snapshot => snapshot.portfolio)
    snapshots: PortfolioSnapShot[];

    @OneToMany(() => PortfolioTransaction, transaction => transaction.portfolio)
    transactions: PortfolioTransaction[];
}