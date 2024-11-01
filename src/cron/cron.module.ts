import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';//npm install --save @nestjs/schedule
import { CronService } from './cron.service';
import { CurrencyEntity } from 'src/typeorm/currency.entity';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { UserTokenEntity } from 'src/typeorm/userToken.entity';
import { CronController } from './cron.controller';
import { ConfigModule } from '@nestjs/config'; 

@Module({
    imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            CurrencyEntity,
            VerificationCodeEntity,
            LoginAttemptEntity,
            AdminTokenEntity,
            UserTokenEntity,
        ]),
    ],
    controllers: [CronController],
    providers: [CronService],
    exports: [CronService],
})
export class CronModule { }