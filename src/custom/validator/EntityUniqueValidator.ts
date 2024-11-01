import { Injectable } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DataSource, Not } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class EntityUniqueValidator implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const [entityClass, fieldName, idProperty] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);
    const object = args.object;
    const id = object[idProperty];
    const entity = await repository.findOne({ where: { [fieldName]: value, id: id ? Not(id) : null } });
    return !entity;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.constraints[0].name} with ${args.constraints[1]}: '${args.value}' already exists`;
  }
}

export function EntityUnique(args: [EntityClassOrSchema, string, string], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: args,
      validator: EntityUniqueValidator,
    });
  };
}