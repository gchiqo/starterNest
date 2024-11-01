import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('currency')
export class CurrencyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;//USD,EUR,RUB,...

    @Column({ default: 1, type: 'float' })
    value: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', })
    updated_at: Date;

}
