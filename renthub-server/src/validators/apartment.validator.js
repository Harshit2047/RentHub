import { z } from 'zod';

/// Apartment creation / update schema
export const apartmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  address: z.string().min(1, 'Address is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  monthlyRent: z.coerce
    .number()
    .min(0)
    .max(999999.99)
    .refine((val) => val > 0, 'Monthly rent must be greater than 0'),
  securityDeposit: z.coerce
    .number()
    .min(0)
    .max(999999.99)
    .optional()
    .refine((val) => val === undefined || val >= 0, 'Security deposit must be non-negative'),
  bedrooms: z.coerce
    .number()
    .int('Bedrooms must be an integer')
    .min(1, 'Must have at least 1 bedroom')
    .max(10, 'Must have at most 10 bedrooms'),
  bathrooms: z.coerce
    .number()
    .int('Bathrooms must be an integer')
    .min(1, 'Must have at least 1 bathroom')
    .max(10, 'Must have at most 10 bathrooms'),
  area: z.coerce
    .number()
    .min(0)
    .max(999999.99)
    .optional()
    .refine((val) => val === undefined || val > 0, 'Area must be positive'),
  furnished: z.enum(['FURNISHED', 'UNFURNISHED', 'SEMI_FURNISHED']),
  vegetarian: z.enum(['ALLOWED', 'NOT_ALLOWED']),
  availability: z.enum(['AVAILABLE', 'PENDING', 'RENTED']).default('AVAILABLE'),
  // Comma-separated amenity names sent by the client (multipart form field)
  amenities: z.string().optional(),
});

/// Apartment query/params schema
export const apartmentIdSchema = z.object({
  apartmentId: z.string().uuid('Must be a valid UUID'),
});

/// Query parameters for listing apartments with search, filtering and sorting
export const apartmentsQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),

  // Search
  search: z.string().optional(),
  city: z.string().optional(),

  // Filtering
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(1).max(10).optional(),
  bathrooms: z.coerce.number().int().min(1).max(10).optional(),
  furnished: z.enum(['FURNISHED', 'UNFURNISHED', 'SEMI_FURNISHED']).optional(),
  availability: z.enum(['AVAILABLE', 'PENDING', 'RENTED']).optional(),

  // Sorting
  sortBy: z.enum(['createdAt', 'monthlyRent', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});