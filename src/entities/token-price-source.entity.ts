import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Token } from "./token.entity";


@Entity('token_price_sources')
@Index(['tokenId', 'source'], {unique: true})
export class TokenPriceSource{
    @PrimaryGeneratedColumn({name: 'id', type: 'bigint'})
    id: string;

    @Column({name: 'token_id',type: 'bigint'})
    tokenId: string;

    @Column({name: 'source', type: 'varchar', length: 100})
    source: string;

    @Column({name: 'external_id', type: 'varchar', length: 40})
    externalId: string;

    @ManyToOne(() => Token, token => token.priceSources, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'token_id'})
    token: Token;
}

