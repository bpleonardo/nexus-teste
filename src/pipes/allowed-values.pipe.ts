import { Errors } from '@/constants';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AllowedValuesPipe implements PipeTransform {
  constructor(private readonly allowedValues: any[]) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const name = metadata.data || metadata.type;

    if (!this.allowedValues.includes(value)) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_REQUEST,
        message: 'Validation failed',
        data: { errors: { [name]: `Allowed values are: ${this.allowedValues.join(', ')}` } },
      });
    }
    return value;
  }
}
