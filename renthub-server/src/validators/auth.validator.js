import { z } from 'zod';

/// Registration schema
export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(150),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
  phone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .nullable()
    .or(z.literal('')),
  role: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.enum(['TENANT', 'LANDLORD'])
    )
    .default('TENANT'),
});

/// Login schema
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});
