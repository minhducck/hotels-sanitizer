import {
  isNumberString,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-number-string', async: false })
export class StringNumberStringValidator
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(text: any, args: ValidationArguments) {
    return (
      typeof text === 'number' ||
      (typeof text === 'string' && isNumberString(text))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return '$property must be number or number string';
  }
}
