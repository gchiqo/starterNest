import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('loginAttempt')
export class LoginAttemptEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    email: string;

    @Column({ default: 0 })// 0-failed login; 1 - succesful login; -1 - filed login after succesful login
    status: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', })
    created_at: Date
}