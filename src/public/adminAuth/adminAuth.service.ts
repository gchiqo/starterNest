import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/typeorm/admin.entity';
import { LessThan, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminDto, RegisterAdminDto, SendCodeToEmailDto, VerifyEmaileDto } from './adminAuth.dto';
import * as bcrypt from 'bcryptjs';
import { SenderService } from 'src/custom/Sender.service';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { IdentificatiorService } from 'src/custom/Identificatior.service';
import { LoginAttemptEntity } from 'src/typeorm/LoginAttempt.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdminAuthService {

  constructor(
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    @InjectRepository(VerificationCodeEntity)
    private verificationCodeRepository: Repository<VerificationCodeEntity>,
    @InjectRepository(LoginAttemptEntity)
    private loginAttemptRepository: Repository<LoginAttemptEntity>,
    private readonly jwtService: JwtService,
    private senderService: SenderService,
    private identificatiorService: IdentificatiorService,
  ) { }

  async register(registerAdminDto: RegisterAdminDto): Promise<string> {
    const { email } = registerAdminDto;
    // await this.isVerifiedEmail(email);

    const hashedPassword = await bcrypt.hash(registerAdminDto.password, 10);
    try {
      const newAdmin = this.adminRepository.create({
        ...registerAdminDto,
        password: hashedPassword,
      });
      const admin = await this.adminRepository.save(newAdmin);
      return 'Admin registered successfully';
    } catch (err) {
      console.log(err)
      throw new BadRequestException('Failed to register admin: ' + err.message);
    }
  }

  async login(loginAdminDto: LoginAdminDto): Promise<{ admin: Partial<AdminEntity>; access_token: string }> {
    const { email, password } = loginAdminDto;
    const ip = this.identificatiorService.getRequestIP();

    // Check for too many attempts from the same IP or for the same email
    await this.checkLoginAttempts(email, ip);

    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ['id', 'password'],
    });

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      // Record failed attempt
      await this.recordLoginAttempt(email, ip, 0);
      throw new UnauthorizedException('Incorrect credentials');
    }

    // Clear login attempts on successful login
    await this.recordLoginAttempt(email, ip, 1);
    await this.clearLoginAttempts(email, ip);

    const payload = { email, sub: admin.id };
    const access_token = this.jwtService.sign(payload);
    delete admin.password;
    
    return { admin, access_token };
  }

  // forgot functions
  async forgotPass(forgotPassDto: SendCodeToEmailDto) {
    const { email } = forgotPassDto;

    const existingAdmin = await this.adminRepository.findOne({ where: { email } })
    if (!existingAdmin)
      throw new NotFoundException(`admin with email:${email} not found`);

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
    const existingAdmin = await this.adminRepository.findOne({ where: { email } })
    if (!existingAdmin)
      throw new NotFoundException(`admin with email:${email} not found`);

    const verificationCode = await this.findValidEmailVerificationCode(email, code);
    await this.verificationCodeRepository.update(verificationCode.id, { status: 1 });

    const password = this.generateStrongPassword(16);
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.adminRepository.update(existingAdmin.id, { password: hashedPassword })

    await this.senderService.sendEmail(email, `For security measures delete this mail. Your new password is ${password}`);
    return 'New password was sent to your email';
  }

  //login helper functions

  private async checkLoginAttempts(email: string, ip: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const ipAttempts = await this.loginAttemptRepository.count({
      where: {
        ip,
        created_at: MoreThanOrEqual(oneHourAgo),
        status: 0
      },
    });

    const emailAttempts = await this.loginAttemptRepository.count({
      where: {
        email,
        created_at: MoreThanOrEqual(oneHourAgo),
        status: 0
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