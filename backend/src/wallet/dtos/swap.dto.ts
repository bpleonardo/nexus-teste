import { z } from 'zod';

export const swapSchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  amount: z.number().positive(),
});

export type SwapDTO = z.infer<typeof swapSchema>;
