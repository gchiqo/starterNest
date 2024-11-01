
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, MaxLength, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { EntityUnique } from 'src/custom/validator/EntityUniqueValidator';
import { CityEntity } from 'src/typeorm/city.entity';



export class CreateCityDto {
  @IsNotEmpty()
  @EntityUnique([CityEntity, 'name', 'id'])
  name: string;

  @IsOptional()
  sort: number;
}

export class UpdateCityDto extends PartialType(CreateCityDto) {
  @IsNotEmpty()
  id: number;
}
