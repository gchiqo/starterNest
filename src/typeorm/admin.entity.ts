import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdminTokenEntity } from './adminToken.entity'; // Assuming you have an AdminToken entity defined

@Entity('Admin')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  role: string;


  @Column({ nullable: true })
  img: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', })
  updated_at: Date;

  @OneToMany(() => AdminTokenEntity, adminToken => adminToken.admin)
  adminTokens: AdminTokenEntity[];
}
