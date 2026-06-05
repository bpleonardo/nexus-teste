import { z } from 'zod';

export const withdrawSchema = z.object({
  currency: z.string().length(3),
  amount: z.number().positive(),
});

export type WithdrawDTO = z.infer<typeof withdrawSchema>;
