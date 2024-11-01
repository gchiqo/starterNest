import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { UserTokenEntity } from 'src/typeorm/userToken.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminTokenEntity,
      UserTokenEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AuthMiddlewareModule {}
