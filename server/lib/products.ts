import type { Prisma } from '#db'
import type { ProductsQuery } from '#server/validation'

export function buildProductsWhere(query: ProductsQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (query.category) {
    where.category = { slug: query.category }
  }

  if (query.sale) {
    where.discount = { gt: 0 }
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {}
    if (query.minPrice !== undefined) where.price = { ...where.price, gte: query.minPrice }
    if (query.maxPrice !== undefined) where.price = { ...where.price, lte: query.maxPrice }
  }

  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' }
  }

  return where
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
