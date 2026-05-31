import { z } from 'zod';

export const swapSchema = z.object({
  fromCurrency: z.string().min(3).max(3),
  toCurrency: z.string().min(3).max(3),
  amount: z.number().positive(),
});

export type SwapDTO = z.infer<typeof swapSchema>;
