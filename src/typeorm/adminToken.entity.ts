import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminEntity } from './admin.entity';

@Entity('AdminToken')
export class AdminTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  admin_id: number;

  @Column()
  token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => AdminEntity, (admin) => admin.adminTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminEntity;
}
