import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Exchange } from './exchange.entity';
import { Token } from './token.entity';
import { decimalTransformer } from '../transformers/decimal.transformer';

@Entity('portfolio_transactions')
@Index(['portfolioId', 'exchangeId', 'timestamp'])
@Index(['portfolioId', 'tokenId', 'timestamp'])
export class PortfolioTransaction {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'portfolio_id', type: 'bigint' })
  portfolioId: string;

  @Column({ name: 'exchange_id', type: 'bigint' })
  exchangeId: string;

  @Column({ name: 'token_id', type: 'bigint' })
  tokenId: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['deposit', 'withdrawal']
  })
  type: 'deposit' | 'withdrawal';

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: decimalTransformer
  })
  amount: string;

  @Column({
    name: 'usdt_value',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: decimalTransformer
  })
  usdtValue: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'success', 'failed']
  })
  status: 'pending' | 'success' | 'failed';

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  transactionId?: string;

  @Column({
    name: 'timestamp',
    type: 'timestamp'
  })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Portfolio, portfolio => portfolio.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @ManyToOne(() => Exchange, exchange => exchange.transactions)
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @ManyToOne(() => Token, token => token.transactions)
  @JoinColumn({ name: 'token_id' })
  token: Token;
}
