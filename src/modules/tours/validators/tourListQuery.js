import { z } from 'zod';

export const tourListQuery = z.object({
  category: z.string().max(40).optional(),
  sort: z.enum(['newest', 'price']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
