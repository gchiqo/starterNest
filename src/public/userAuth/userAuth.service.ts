import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/typeorm/user.entity';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, LoginUserDto1, RegisterUserDto, SendCodeToEmailDto, SendCodeToPhoneDto, VerifyEmaileDto, VerifyPhoneDto } from './userAuth.dto';
import * as bcrypt from 'bcryptjs';
import { SenderService } from 'src/custom/Sender.service';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { IdentificatiorService } from 'src/custom/Identificatior.service';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';
import * as crypto from 'crypto';

@Injectable()
export class UserAuthService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(VerificationCodeEntity)
    private verificationCodeRepository: Repository<VerificationCodeEntity>,
    @InjectRepository(LoginAttemptEntity)
    private loginAttemptRepository: Repository<LoginAttemptEntity>,
    private readonly jwtService: JwtService,
    private senderService: SenderService,
    private identificatiorService: IdentificatiorService,
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<string> {
    const { email, phone } = registerUserDto;
    const isVerifiedEmail = await this.isVerifiedEmail(email);
    const isVerifiedPhone = await this.isVerifiedPhone(phone);
    if (!isVerifiedEmail && !isVerifiedPhone) {
      console.log(isVerifiedEmail, isVerifiedPhone)//if neither of them is verified
      throw new BadRequestException('registration info is not verified');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    try {
      const newUser = this.userRepository.create({
        ...registerUserDto,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);
      return 'User registered successfully';
    } catch (err) {
      throw new BadRequestException('Failed to register user: ' + err.message);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ user: Partial<UserEntity>; access_token: string }> {
    const { email, password } = loginUserDto;
    const ip = this.identificatiorService.getRequestIP();

    // Check for too many attempts from the same IP or for the same email
    await this.checkLoginAttempts(email, ip);

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'password'],
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      // Record failed attempt
      await this.recordLoginAttempt(email, ip, 0);
      throw new UnauthorizedException('Incorrect credentials');
    }

    // Clear login attempts on successful login
    await this.recordLoginAttempt(email, ip, 1);
    await this.clearLoginAttempts(email, ip);

    const payload = { email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    delete user.password;

    return { user, access_token };
  }

  async login1(loginUserDto: LoginUserDto1): Promise<{ user: Partial<UserEntity>; access_token: string }> {
    const { phone, password } = loginUserDto;
    const ip = this.identificatiorService.getRequestIP();

    // Check for too many attempts from the same IP or for the same email
    await this.checkLoginAttempts(phone, ip);

    const user = await this.userRepository.findOne({
      where: { phone },
      select: ['id', 'password'],
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      // Record failed attempt
      await this.recordLoginAttempt(phone, ip, 0);
      throw new UnauthorizedException('Incorrect credentials');
    }

    // Clear login attempts on successful login
    await this.recordLoginAttempt(phone, ip, 1);
    await this.clearLoginAttempts(phone, ip);

    const payload = { phone, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    delete user.password;

    return { user, access_token };
  }

  // forgot functions
  async forgotPass(forgotPassDto: SendCodeToEmailDto) {
    const { email } = forgotPassDto;

    const existingUser = await this.userRepository.findOne({ where: { email } })
    if (!existingUser)
      throw new NotFoundException(`user with email:${email} not found`);

    const ip = this.identificatiorService.getRequestIP();

    // Check rate limit for IP
    await this.checkRateLimit(ip, 'ip');

    // Check rate limit for phone number
    await this.checkRateLimit(email, 'email');

    const code = this.generateVerificationCode();

    await this.senderService.sendEmail(email, `Your reset code is ${code}`);

    const newVerificationCode = this.verificationCodeRepository.create({
      email,
      code,
      ip,
    });

    await this.verificationCodeRepository.save(newVerificationCode);

    return 'reset code sent successfully';
  }

  async resetPass(resetPassDto: VerifyEmaileDto) {
    const { email, code } = resetPassDto;
    const existingUser = await this.userRepository.findOne({ where: { email } })
    if (!existingUser)
      throw new NotFoundException(`user with email:${email} not found`);

    const verificationCode = await this.findValidEmailVerificationCode(email, code);
    await this.verificationCodeRepository.update(verificationCode.id, { status: 1 });

    const password = this.generateStrongPassword(16);
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(existingUser.id, { password: hashedPassword })

    await this.senderService.sendEmail(email, `For security measures delete this mail. Your new password is ${password}`);
    return 'New password was sent to your email';
  }

  async forgotPass1(forgotPassDto: SendCodeToPhoneDto) {
    const { phone } = forgotPassDto;

    const existingUser = await this.userRepository.findOne({ where: { phone } })
    if (!existingUser)
      throw new NotFoundException(`user with phone:${phone} not found`);

    const ip = this.identificatiorService.getRequestIP();

    // Check rate limit for IP
    await this.checkRateLimit(ip, 'ip');

    // Check rate limit for phone number
    await this.checkRateLimit(phone, 'phone');

    const code = this.generateVerificationCode();

    await this.senderService.sendSMS(phone, `Your reset code is ${code}`);

    const newVerificationCode = this.verificationCodeRepository.create({
      phone,
      code,
      ip,
    });

    await this.verificationCodeRepository.save(newVerificationCode);

    return 'reset code sent successfully';
  }

  async resetPass1(resetPassDto: VerifyPhoneDto) {
    const { phone, code } = resetPassDto;
    const existingUser = await this.userRepository.findOne({ where: { phone } })
    if (!existingUser)
      throw new NotFoundException(`user with phone:${phone} not found`);

    const verificationCode = await this.findValidPhoneVerificationCode(phone, code);
    await this.verificationCodeRepository.update(verificationCode.id, { status: 1 });

    const password = this.generateStrongPassword(16);
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(existingUser.id, { password: hashedPassword })

    await this.senderService.sendSMS(phone, `For security measures delete this SMS. Your new password is ${password}`);
    return 'New password was sent to your phone';
  }

  //login helper functions

  private async checkLoginAttempts(email: string, ip: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const ipAttempts = await this.loginAttemptRepository.count({
      where: {
        ip,
        created_at: MoreThanOrEqual(oneHourAgo),
      },
    });

    const emailAttempts = await this.loginAttemptRepository.count({
      where: {
        email,
        created_at: MoreThanOrEqual(oneHourAgo),
      },
    });

    if (ipAttempts >= 10) {
      throw new BadRequestException('Too many login attempts. Please try again later.');
    }

    if (emailAttempts >= 10) {
      throw new BadRequestException('Too many login attempts. Please try again later.');
    }
  }

  private async recordLoginAttempt(email: string, ip: string, status: number): Promise<void> {
    const loginAttempt = this.loginAttemptRepository.create({ email, ip, status });
    await this.loginAttemptRepository.save(loginAttempt);
  }

  private async clearLoginAttempts(email: string, ip: string): Promise<void> {
    await this.loginAttemptRepository.update({ email: email, ip: ip, status: 0 }, { status: -1 });
  }

  //verification functions
  async sendCodeToPhone(sendCodeToPhoneDto: SendCodeToPhoneDto): Promise<string> {
    const { phone } = sendCodeToPhoneDto;
    const ip = this.identificatiorService.getRequestIP();

    // Check rate limit for IP
    await this.checkRateLimit(ip, 'ip');

    // Check rate limit for phone number
    await this.checkRateLimit(phone, 'phone');

    const code = this.generateVerificationCode();

    await this.senderService.sendSMS(phone, `Your verification code is ${code}`);

    const newVerificationCode = this.verificationCodeRepository.create({
      phone,
      code,
      ip,
    });

    await this.verificationCodeRepository.save(newVerificationCode);

    return 'Verification code sent successfully';
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<string> {
    const { phone, code } = verifyPhoneDto;
    const verificationCode = await this.findValidPhoneVerificationCode(phone, code);
    await this.verificationCodeRepository.update(verificationCode.id, { status: 1 });
    return 'Phone number verified successfully';
  }

  async sendCodeToEmali(sendCodeToEmailDto: SendCodeToEmailDto): Promise<string> {
    const { email } = sendCodeToEmailDto;
    const ip = this.identificatiorService.getRequestIP();

    // Check rate limit for IP
    await this.checkRateLimit(ip, 'ip');

    // Check rate limit for phone number
    await this.checkRateLimit(email, 'email');

    const code = this.generateVerificationCode();

    await this.senderService.sendEmail(email, `Your verification code is ${code}`);

    const newVerificationCode = this.verificationCodeRepository.create({
      email,
      code,
      ip,
    });

    await this.verificationCodeRepository.save(newVerificationCode);

    return 'Verification code sent successfully';
  }

  async verifyEmail(verifyEmailDto: VerifyEmaileDto): Promise<string> {
    const { email, code } = verifyEmailDto;
    const verificationCode = await this.findValidEmailVerificationCode(email, code);
    await this.verificationCodeRepository.update(verificationCode.id, { status: 1 });
    return 'Email verified successfully';
  }

  //helper functions

  private async isVerifiedEmail(email: string): Promise<boolean> {
    const verifiedCode = await this.verificationCodeRepository.exists({ where: { email, status: 1 } });
    return verifiedCode;
  }
  private async isVerifiedPhone(phone: string): Promise<boolean> {
    const verifiedCode = await this.verificationCodeRepository.exists({ where: { phone, status: 1 } });
    return verifiedCode;
  }

  private async checkRateLimit(value: string, type: 'ip' | 'phone' | 'email'): Promise<void> {
    const systemDateTime = new Date(); // Gets the system's current date and time
    const oneHourAgo = new Date(systemDateTime.getTime() - 60 * 60 * 1000);

    const count = await this.verificationCodeRepository.count({
      where: {
        [type]: value,
        created_at: MoreThan(oneHourAgo),
      },
    });

    // when there are multiple records with created_at 2024-09-19 17:59:22
    const maxAttempts = type === 'ip' ? 12 : 5;

    if (count >= maxAttempts) {
      throw new BadRequestException(`Too many attempts from this ${type}. Please try again later.`);
    }
  }

  private generateVerificationCode(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  private async findValidPhoneVerificationCode(phone: string, code: number): Promise<VerificationCodeEntity> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check if the phone is blocked due to too many failed attempts
    const recentFailedAttempts = await this.verificationCodeRepository.count({
      where: {
        phone,
        failedCount: MoreThanOrEqual(10),
        created_at: MoreThanOrEqual(oneHourAgo)
      }
    });

    if (recentFailedAttempts > 0) {
      throw new BadRequestException('This phone number is temporarily blocked due to too many failed attempts. Please try again after 1 hour.');
    }

    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { phone, code, status: 0 },
      order: { created_at: 'DESC' }
    });

    if (!verificationCode) {
      const existingCode = await this.verificationCodeRepository.findOne({
        where: { phone, status: 0 },
        order: { created_at: 'DESC' }
      });

      if (existingCode) {
        const newFailedCount = existingCode.failedCount + 1;
        await this.verificationCodeRepository.update(existingCode.id, { failedCount: newFailedCount });

        if (newFailedCount >= 10) {
          throw new BadRequestException('Too many failed attempts. This phone number is now temporarily blocked. Please try again after 1 hour.');
        }
        throw new NotFoundException('Incorrect verification code');
      } else {
        throw new NotFoundException('Verification code for this phone number was never sent or has expired');
      }
    }

    // Reset failedCount if correct code is found
    await this.verificationCodeRepository.update(verificationCode.id, { failedCount: 0 });

    return verificationCode;
  }

  private async findValidEmailVerificationCode(email: string, code: number): Promise<VerificationCodeEntity> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check if the email is blocked due to too many failed attempts
    const recentFailedAttempts = await this.verificationCodeRepository.count({
      where: {
        email,
        failedCount: MoreThanOrEqual(10),
        created_at: MoreThanOrEqual(oneHourAgo)
      }
    });

    if (recentFailedAttempts > 0) {
      throw new BadRequestException('This email is temporarily blocked due to too many failed attempts. Please try again after 1 hour.');
    }

    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { email, code, status: 0 },
      order: { created_at: 'DESC' }
    });

    if (!verificationCode) {
      const existingCode = await this.verificationCodeRepository.findOne({
        where: { email, status: 0 },
        order: { created_at: 'DESC' }
      });

      if (existingCode) {
        const newFailedCount = existingCode.failedCount + 1;
        await this.verificationCodeRepository.update(existingCode.id, { failedCount: newFailedCount });

        if (newFailedCount >= 10) {
          throw new BadRequestException('Too many failed attempts. This email is now temporarily blocked. Please try again after 1 hour.');
        }
        throw new NotFoundException('Incorrect verification code');
      } else {
        throw new NotFoundException('Verification code for this email was never sent or has expired');
      }
    }

    // Reset failedCount if correct code is found
    await this.verificationCodeRepository.update(verificationCode.id, { failedCount: 0 });

    return verificationCode;
  }

  private generateStrongPassword(length: number): string {

    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = lowerCase + upperCase + numbers + specialChars;

    const getRandomChar = (chars: string) => chars[crypto.randomInt(chars.length)];

    let password = '';
    password += getRandomChar(lowerCase);
    password += getRandomChar(upperCase);
    password += getRandomChar(numbers);
    password += getRandomChar(specialChars);

    for (let i = 4; i < length; i++) {
      password += getRandomChar(allChars);
    }

    const array = password.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }

}