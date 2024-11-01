import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('city')
export class CityEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'int', nullable: true })
    sort: number

    @Column({ type: 'timestamp', nullable: true })
    deleted_at: Date;

}
