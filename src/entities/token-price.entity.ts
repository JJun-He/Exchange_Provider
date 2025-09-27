import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Token } from "./token.entity";
import { decimalTransformer } from "src/transformers/decimal.transformer";


@Entity('token_prices')
@Index(['tokenId', 'createdAt'])
@Index(['baseCurrency', 'createdAt'])
export class TokenPrice{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'token_id', type: 'bigint'})
    tokenId: string;

    @Column({
        name: 'price',
        type: 'decimal', 
        precision: 20, 
        scale: 2,
        transformer: decimalTransformer
    })
    price: string;

    @Column({name: 'base_currency', type: 'varchar', length: 10})
    baseCurrency: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => Token, token => token.prices, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'token_id'})
    token: Token;
}
