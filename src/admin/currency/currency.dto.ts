
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { EntityUnique } from 'src/custom/validator/EntityUniqueValidator';
import { CurrencyEntity } from 'src/typeorm/currency.entity';



export class CreateCurrencyDto {
  @IsNotEmpty()
  @EntityUnique([CurrencyEntity, 'name', 'id'])
  name: string//USD;

  @IsNotEmpty()
  value: number;//2.6789
}

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {
  @IsNotEmpty()
  id: number;
}