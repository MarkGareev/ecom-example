import type { Prisma } from '#db'

export type ProductsQuery = {
  page?: string | number
  limit?: string | number
  sort?: string
  order?: string
  category?: string
  sale?: string
  minPrice?: string | number
  maxPrice?: string | number
  search?: string
}

export function buildProductsQuery(query: ProductsQuery) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
  const skip = (page - 1) * limit

  const sortField = String(query.sort || 'createdAt')
  const sortOrder = query.order === 'asc' ? 'asc' : ('desc' as const)
  const allowedSorts = ['price', 'createdAt', 'name']
  const orderBy = allowedSorts.includes(sortField)
    ? { [sortField]: sortOrder }
    : { createdAt: 'desc' as const }

  const where: Prisma.ProductWhereInput = {}

  if (query.category) {
    where.category = { slug: String(query.category) }
  }

  if (query.sale === 'true') {
    where.discount = { gt: 0 }
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {}
    if (query.minPrice) where.price = { ...where.price, gte: Number(query.minPrice) }
    if (query.maxPrice) where.price = { ...where.price, lte: Number(query.maxPrice) }
  }

  if (query.search) {
    where.name = { contains: String(query.search), mode: 'insensitive' }
  }

  return { page, limit, skip, orderBy, where }
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
