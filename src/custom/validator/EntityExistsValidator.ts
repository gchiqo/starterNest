import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DataSource, In } from 'typeorm';
// npm i --save class-validator class-transformer

@ValidatorConstraint({ async: true })
export class EntityExistsValidator implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) { }

  async validate(value: any, args: ValidationArguments) {
    const [entityClass, fieldName] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);
    let entity = null;
    if (Array.isArray(value))
      entity = await repository.findOne({ where: { [fieldName]: In(value) } });
    else
      entity = await repository.findOne({ where: { [fieldName]: value } });

    return !!entity;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.constraints[0].name} with ${args.constraints[1]} ${args.value} does not exist`;
  }
}

export function EntityExists(args: [EntityClassOrSchema, string], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: args,
      validator: EntityExistsValidator,
    });
  };
}
