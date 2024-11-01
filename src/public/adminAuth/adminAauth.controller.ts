import { Body, Controller, Get, Req, Post, Headers, ValidationPipe } from '@nestjs/common';
import { LoginAdminDto, RegisterAdminDto, SendCodeToEmailDto, VerifyEmaileDto } from './adminAuth.dto';
import { AdminAuthService } from './adminAuth.service';

@Controller('adminAuth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) { }

  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    return this.adminAuthService.login(loginAdminDto);
  }

  //this should not be here
  @Post('register')
  async create(
    @Body() registerAdminDto: RegisterAdminDto,
  ) {
    return await this.adminAuthService.register(registerAdminDto);
  }

  @Post('forgotPass')
  async forgotPass(@Body() forgotPassDto: SendCodeToEmailDto) {
    return this.adminAuthService.forgotPass(forgotPassDto);
  }

  @Post('resetPass')
  async resetPass(@Body() resetPass: VerifyEmaileDto) {
    return this.adminAuthService.resetPass(resetPass);
  }
}
