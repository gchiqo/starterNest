import { Body, Controller, Get, Req, Post, Headers, ValidationPipe } from '@nestjs/common';
import { LoginUserDto, LoginUserDto1, RegisterUserDto, SendCodeToEmailDto, SendCodeToPhoneDto, VerifyEmaileDto, VerifyPhoneDto } from './userAuth.dto';
import { UserAuthService } from './userAuth.service';

@Controller('userAuth')
export class UserAuthController {
  constructor(private userAuthService: UserAuthService) { }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userAuthService.login(loginUserDto);
  }

  @Post('login1')
  async login1(@Body() loginUserDto: LoginUserDto1) {
    return this.userAuthService.login1(loginUserDto);
  }

  @Post('register')
  async create(
    @Body() registerUserDto: RegisterUserDto,
  ) {
    return await this.userAuthService.register(registerUserDto);
  }

  @Post('forgotPass')
  async forgotPass(@Body() forgotPassDto: SendCodeToEmailDto) {
    return this.userAuthService.forgotPass(forgotPassDto);
  }

  @Post('forgotPass1')
  async forgotPass1(@Body() forgotPassDto: SendCodeToPhoneDto) {
    return this.userAuthService.forgotPass1(forgotPassDto);
  }

  @Post('resetPass')
  async resetPass(@Body() resetPass: VerifyEmaileDto) {
    return this.userAuthService.resetPass(resetPass);
  }

  @Post('resetPass1')
  async resetPass1(@Body() resetPass: VerifyPhoneDto) {
    return this.userAuthService.resetPass1(resetPass);
  }

  @Post('sendCodeToPhone')
  async sendCodeToPhone(
    @Body() registerUserDto: SendCodeToPhoneDto,
  ) {
    return await this.userAuthService.sendCodeToPhone(registerUserDto);
  }

  @Post('verifyPhone')
  async verifyPhone(
    @Body() registerUserDto: VerifyPhoneDto,
  ) {
    return await this.userAuthService.verifyPhone(registerUserDto);
  }

  @Post('sendCodeToEmali')
  async sendCodeToEmali(
    @Body() sendCodeToEmailDto: SendCodeToEmailDto,
  ) {
    return await this.userAuthService.sendCodeToEmali(sendCodeToEmailDto);
  }

  @Post('verifyEmail')
  async verifyEmail(
    @Body() verifyEmaileDto: VerifyEmaileDto,
  ) {
    return await this.userAuthService.verifyEmail(verifyEmaileDto);
  }

}
