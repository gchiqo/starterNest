import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('VerificationCode')
export class VerificationCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  code: number;

  @Column()
  ip: string;

  @Column({ default: 0 })
  status: number;

  @Column({ default: 0 })
  failedCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}