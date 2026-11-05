import { z } from 'zod';

/// Registration schema
export const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(150),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
  // Phone is optional in the UI; an empty string must be accepted too.
  phone: z
    .string()
    .trim()
    .max(20)
    .refine(
      (val) => val === '' || /^[\d+\- ]+$/.test(val),
      'Must be a valid phone number'
    )
    .optional(),
  role: z.enum(['TENANT', 'LANDLORD']),
})

/// Login schema
export const loginSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
})