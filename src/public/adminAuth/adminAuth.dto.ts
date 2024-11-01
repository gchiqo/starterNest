import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;;
}

export class RegisterAdminDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  password?: string;
}

export class SendCodeToEmailDto{
  @IsNotEmpty()
  @IsEmail()
  email: string;

}

export class VerifyEmaileDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: number;
}