import { Errors } from '@/constants';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Custom implementation of ParseFloatPipe to allow more flexible error handling
function isNil(obj: any): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null;
}

@Injectable()
export class ParseFloatPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const name = metadata.data || metadata.type;
    if (!this.isFloat(value)) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_REQUEST,
        message: 'Validation failed',
        data: { errors: { [name]: 'Numeric string is expected' } },
      });
    }

    return parseFloat(value);
  }

  private isFloat(value: any): boolean {
    return (
      !isNil(value) &&
      ['string', 'number'].includes(typeof value) &&
      /^-?\d+(\.\d)*$/.test(value) &&
      isFinite(value as any)
    );
  }
}
