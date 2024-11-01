import {
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { VerificationCodeService } from './verificationCode.service';


@Controller('a/verificationCode')
export class VerificationCodeController {
  constructor(private readonly verificationCodeService: VerificationCodeService) { }

  @Get()
  async getAll(@Query() query: any) {
    return await this.verificationCodeService.getAll(query);
  }
}