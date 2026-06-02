import { Errors } from '@/constants';
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Custom implementation of ParseIntPipe to allow more flexible error handling
function isNil(obj: any): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null;
}

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const name = metadata.data || metadata.type;
    if (!this.isNumeric(value)) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_REQUEST,
        message: 'Validation failed',
        data: { errors: { [name]: 'Numeric string is expected' } },
      });
    }

    return parseInt(value, 10);
  }

  private isNumeric(value: any): boolean {
    return (
      ['string', 'number'].includes(typeof value) && /^-?\d+$/.test(value) && isFinite(value as any)
    );
  }
}
