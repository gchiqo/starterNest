import { PartialType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { EntityUnique } from 'src/custom/validator/EntityUniqueValidator';
import { AdminEntity } from 'src/typeorm/admin.entity';

export class CreateAdminDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @EntityUnique([AdminEntity, 'email', 'id'])
  email: string;

  @MinLength(8)
  password: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  img?: string;

}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
}
