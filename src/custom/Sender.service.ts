import { Injectable } from '@nestjs/common';

@Injectable()
export class SenderService {
    async sendSMS(to: string, text: string) {
        console.log(`sending SMS to:${to}; text:${text}`)
    }

    async sendEmail(to: string, text: string) {
        console.log(`sending mail to:${to}; text:${text}`)
    }
}
