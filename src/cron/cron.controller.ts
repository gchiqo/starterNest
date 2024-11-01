
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('a/cron')
export class CronController {
    constructor(private readonly cronService: CronService) { }

    @Get()
    async getCrons() {
        return await this.cronService.getCrons();
    }

    @Get('currency')
    async updateCurrency() {
        await this.cronService.updateCurrency();
        return { message: 'Currency update initiated' };
    }

    @Get('cleanup')
    async cleanupOldRecords() {
        await this.cronService.deleteOldRecords();
        return { message: 'Cleanup of old records initiated' };
    }

    @Post('custom')
    async addCustomCronJob(@Body() body: { name: string; expression: string; callback: string }) {
        const { name, expression, callback } = body;
        await this.cronService.addCustomCronJob(name, expression, new Function(callback) as () => void);
        return { message: `Custom cron job '${name}' added` };
    }

    @Delete('custom/:name')
    async removeCustomCronJob(@Param('name') name: string) {
        await this.cronService.removeCustomCronJob(name);
        return { message: `Custom cron job '${name}' removed` };
    }

}
