
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, MaxLength, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { EntityUnique } from 'src/custom/validator/EntityUniqueValidator';
import { UserEntity } from 'src/typeorm/user.entity';



export class CreateUserDto {
  @IsOptional()
  @EntityUnique([UserEntity, 'personNumber', 'id'])
  personNumber: string;

  @IsNotEmpty()
  @EntityUnique([UserEntity, 'email', 'id'])
  email: string;

  @IsOptional()
  @EntityUnique([UserEntity, 'phone', 'id'])
  phone: string;

  @IsOptional()
  password: string;

  @IsOptional()
  fName: string;

  @IsOptional()
  lName: string;

  @IsOptional()
  img: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  balance: number;

  @IsOptional()
  birthday: Date;

  @IsOptional()
  deleted_at: Date;
}


export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  id: number;
}
  