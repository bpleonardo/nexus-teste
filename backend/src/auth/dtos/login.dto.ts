import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  persistent: z.boolean().optional(),
});

export type LoginDTO = z.infer<typeof loginSchema>;
