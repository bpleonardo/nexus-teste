import { flattenZodErrors } from '@/utils';
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import z, { ZodError, ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<any>) {}

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
