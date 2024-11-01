import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { SenderService } from 'src/custom/Sender.service';
import { VerificationCodeController } from './verificationCode.controller';
import { VerificationCodeService } from './verificationCode.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCodeEntity])],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
})
export class VerificationCodeModule {}
