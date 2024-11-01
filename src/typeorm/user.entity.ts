import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserTokenEntity } from "./userToken.entity";

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  personNumber: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  gmail_token: string;
  @Column({ nullable: true })
  apple_token: string;
  @Column({ nullable: true })
  facebook_token: string;

  @Column({ nullable: true })
  fName: string;

  @Column({ nullable: true })
  lName: string;

  @Column({ nullable: true })
  img: string;

  @Column({ default: -1 })
  status: string;

  @Column({ default: 0, type: 'float' })
  balance: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => UserTokenEntity, userToken => userToken.user)
  userTokens: UserTokenEntity[];

}