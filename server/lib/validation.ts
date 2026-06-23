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

export const cartPostSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export const cartPatchSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(100),
})

export const orderPostSchema = z.object({
  address: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1),
})

export const productSlugSchema = z.object({
  slug: z.string().min(1),
})

export const reviewPostSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
})

export type ProductsQuery = z.infer<typeof productsQuerySchema>
export type ArticlesQuery = z.infer<typeof articlesQuerySchema>
export type CartPostBody = z.infer<typeof cartPostSchema>
export type CartPatchBody = z.infer<typeof cartPatchSchema>
export type RegisterBody = z.infer<typeof registerSchema>
export type LoginBody = z.infer<typeof loginSchema>
export type OrderPostBody = z.infer<typeof orderPostSchema>
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>
