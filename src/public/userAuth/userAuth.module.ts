import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/typeorm/user.entity';
import { UserTokenEntity } from 'src/typeorm/userToken.entity';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { ConfigModule } from '@nestjs/config';
import { SenderService } from 'src/custom/Sender.service';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { IdentificatiorService } from 'src/custom/Identificatior.service';
import { UserAuthService } from './userAuth.service';
import { UserAuthController } from './userAauth.controller';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: env.USER_TOKEN_SECRET,
    }),
    TypeOrmModule.forFeature([UserEntity, UserTokenEntity, VerificationCodeEntity, LoginAttemptEntity]),
  ],
  providers: [UserAuthService, SenderService, IdentificatiorService],
  controllers: [UserAuthController],
})
export class UserAuthModule {}
