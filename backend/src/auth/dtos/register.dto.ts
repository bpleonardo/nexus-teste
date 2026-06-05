import { z } from 'zod';

import { zodCpfValidator } from '@/utils';

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  cpf: z.string().refine(zodCpfValidator, { error: 'Invalid CPF number' }),
  phone: z.e164('Invalid phone number'),
  address: z.object({
    address: z.string().min(4, 'Address must be at least 4 characters long'),
    city: z.string().min(2, 'City must be at least 2 characters long'),
    state: z.string().min(2, 'State must be at least 2 characters long'),
    country: z
      .string()
      .min(2, 'Country must be at least 2 characters long')
      .max(3, 'Country must be at most 3 characters long'),
    postalCode: z.string().min(4, 'Postal code must be at least 4 characters long'),
  }),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
