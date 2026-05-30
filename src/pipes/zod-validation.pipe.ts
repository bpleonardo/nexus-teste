import { z, ZodError, ZodType } from 'zod';
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { flattenZodErrors } from '@/utils';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType<any>) {}

  transform(value: unknown, _: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const err = z.treeifyError(error);
        throw new BadRequestException({
          status: 400,
          message: 'Validation failed',
          errors: flattenZodErrors(err),
        });
      }

      throw error;
    }
  }
}
