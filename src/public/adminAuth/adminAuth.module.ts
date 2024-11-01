import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from 'src/typeorm/admin.entity';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { ConfigModule } from '@nestjs/config';
import { SenderService } from 'src/custom/Sender.service';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { IdentificatiorService } from 'src/custom/Identificatior.service';
import { AdminAuthService } from './adminAuth.service';
import { AdminAuthController } from './adminAauth.controller';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: env.ADMIN_TOKEN_SECRET,
    }),
    TypeOrmModule.forFeature([AdminEntity, AdminTokenEntity, VerificationCodeEntity, LoginAttemptEntity]),
  ],
  providers: [AdminAuthService, SenderService, IdentificatiorService],
  controllers: [AdminAuthController],
})
export class AdminAuthModule {}
