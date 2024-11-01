import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { EntityUnique } from 'src/custom/validator/EntityUniqueValidator';
import { UserEntity } from 'src/typeorm/user.entity';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;;
}

export class LoginUserDto1 {
  @IsNotEmpty()
  @Length(9)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phone: string;

  @IsNotEmpty()
  password: string;;
}

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  @EntityUnique([UserEntity, 'email', 'id'])
  email: string;

  @IsNotEmpty()
  @EntityUnique([UserEntity, 'phone', 'id'])
  phone: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  lName: string;

  @IsOptional()
  fName: string;

  @IsOptional()
  @EntityUnique([UserEntity, 'personNumber', 'id'])
  personNumber: string;
}

export class SendCodeToEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

}

export class SendCodeToPhoneDto {
  @IsNotEmpty()
  @Length(9)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phone: string;

}

export class VerifyPhoneDto {
  @IsNotEmpty()
  @Length(9)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phone: string;

  @IsNotEmpty()
  code: number;
}

export class VerifyEmaileDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: number;
}