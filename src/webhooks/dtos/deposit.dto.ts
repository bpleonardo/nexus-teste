import { z } from 'zod';

export const depositSchema = z.object({
  userId: z.uuid(),
  token: z.string().min(3).max(3),
  amount: z.number().positive(),
  idempotencyKey: z.string(),
});

export type DepositDTO = z.infer<typeof depositSchema>;
