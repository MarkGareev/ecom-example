import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20),
})

export const productsQuerySchema = paginationSchema.extend({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((v) => Math.min(v, 100))
    .default(20),
  sort: z.enum(['price', 'createdAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().optional(),
  sale: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().min(1).optional(),
})

export const articlesQuerySchema = paginationSchema.extend({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .transform((v) => Math.min(v, 50))
    .default(10),
})

export const articleSlugSchema = z.object({
  slug: z.string().min(1),
})

export const cartGetSchema = z.object({
  userId: z.string().min(1),
})

export const cartPostSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
})

export const cartDeleteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
})

export type ProductsQuery = z.infer<typeof productsQuerySchema>
export type ArticlesQuery = z.infer<typeof articlesQuerySchema>
export type CartPostBody = z.infer<typeof cartPostSchema>
