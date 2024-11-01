import { Module } from '@nestjs/common';
import { EntityExistsValidator } from './EntityExistsValidator';
import { EntityUniqueValidator } from './EntityUniqueValidator';
import { EntityUniqueValidatorCustom } from './EntityUniqueValidatorCustom';

@Module({
  imports: [],
  providers: [EntityExistsValidator,EntityUniqueValidator, EntityUniqueValidatorCustom],
})
export class ClassValidatorExtendModule {}
