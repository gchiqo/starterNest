import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { CurrencyEntity } from "src/typeorm/currency.entity";
import { LessThan, Repository } from "typeorm";
import axios from 'axios';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { UserTokenEntity } from 'src/typeorm/userToken.entity';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(
        @InjectRepository(CurrencyEntity)
        private currencyRepository: Repository<CurrencyEntity>,
        @InjectRepository(VerificationCodeEntity)
        private verificationCodeRepository: Repository<VerificationCodeEntity>,
        @InjectRepository(LoginAttemptEntity)
        private loginAttemptRepository: Repository<LoginAttemptEntity>,
        @InjectRepository(AdminTokenEntity)
        private adminTokenRepository: Repository<AdminTokenEntity>,
        @InjectRepository(UserTokenEntity)
        private userTokenRepository: Repository<UserTokenEntity>,
        private schedulerRegistry: SchedulerRegistry,
        private configService: ConfigService
    ) { }

    async getCrons() {
        return await this.schedulerRegistry.getCronJobs();
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async updateCurrency() {
        try {
            const response = await axios.get(this.configService.get('CURRENCY_API_URL'));
            const data = response.data[0].currencies;

            for (const currency of data) {
                await this.currencyRepository.update(
                    { name: currency.code },
                    { value: currency.rate }
                );
            }

            this.logger.log('Currency rates updated successfully');
        } catch (error) {
            this.logger.error('Error updating currency rates:', error);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteOldRecords() {
        await this.deleteOldVerificationCodes();
        await this.deleteOldLoginAttempts();
        await this.deleteOldAdminBlackListTokens();
        await this.deleteOldUserBlackListTokens();
    }

    private async deleteHelper(repository: Repository<any>, entityName: string, days: number = 1) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * days);

        try {
            const result = await repository.delete({
                created_at: LessThan(twentyFourHoursAgo),
            });

            this.logger.log(`Deleted ${result.affected} old ${entityName}`);
        } catch (error) {
            this.logger.error(`Error deleting old ${entityName}:`, error);
        }
    }

    async deleteOldVerificationCodes(): Promise<void> {
        await this.deleteHelper(this.verificationCodeRepository, 'verification codes');
    }

    async deleteOldLoginAttempts(): Promise<void> {
        await this.deleteHelper(this.loginAttemptRepository, 'login attempts', 7);
    }

    async deleteOldAdminBlackListTokens(): Promise<void> {
        await this.deleteHelper(this.adminTokenRepository, 'admin blacklist tokens', 3);
    }

    async deleteOldUserBlackListTokens(): Promise<void> {
        await this.deleteHelper(this.userTokenRepository, 'user blacklist tokens', 3);
    }

    async addCustomCronJob(name: string, expression: string, callback: () => void) {
        const job = new CronJob(expression, callback);//ToDo test this
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        this.logger.log(`Added custom cron job: ${name}`);
    }

    async removeCustomCronJob(name: string) {
        this.schedulerRegistry.deleteCronJob(name);
        this.logger.log(`Removed custom cron job: ${name}`);
    }
}