import { describe, it, expect } from 'vitest'
import { buildProductsQuery, buildPageMeta } from '../server/lib/products'

describe('buildProductsQuery', () => {
  describe('pagination', () => {
    it('defaults to page 1, limit 20', () => {
      const { page, limit, skip } = buildProductsQuery({})
      expect(page).toBe(1)
      expect(limit).toBe(20)
      expect(skip).toBe(0)
    })

    it('computes skip correctly', () => {
      const { skip } = buildProductsQuery({ page: 3, limit: 10 })
      expect(skip).toBe(20)
    })

    it('clamps limit to 100', () => {
      const { limit } = buildProductsQuery({ limit: 999 })
      expect(limit).toBe(100)
    })

    it('clamps page to minimum 1 for invalid input', () => {
      const { page, skip } = buildProductsQuery({ page: -5 })
      expect(page).toBe(1)
      expect(skip).toBe(0)
    })

    it('handles non-numeric page gracefully', () => {
      const { page } = buildProductsQuery({ page: 'abc' })
      expect(page).toBe(1)
    })
  })

  describe('sorting', () => {
    it('defaults to createdAt desc', () => {
      const { orderBy } = buildProductsQuery({})
      expect(orderBy).toEqual({ createdAt: 'desc' })
    })

    it('sorts by price asc', () => {
      const { orderBy } = buildProductsQuery({ sort: 'price', order: 'asc' })
      expect(orderBy).toEqual({ price: 'asc' })
    })

    it('sorts by name desc', () => {
      const { orderBy } = buildProductsQuery({ sort: 'name', order: 'desc' })
      expect(orderBy).toEqual({ name: 'desc' })
    })

    it('falls back to createdAt desc for unknown sort field', () => {
      const { orderBy } = buildProductsQuery({ sort: 'unknown_field' })
      expect(orderBy).toEqual({ createdAt: 'desc' })
    })
  })

  describe('filters', () => {
    it('filters by category slug', () => {
      const { where } = buildProductsQuery({ category: 'laptops' })
      expect(where.category).toEqual({ slug: 'laptops' })
    })

    it('filters sale items when sale=true', () => {
      const { where } = buildProductsQuery({ sale: 'true' })
      expect(where.discount).toEqual({ gt: 0 })
    })

    it('does not filter discount when sale is not true', () => {
      const { where } = buildProductsQuery({ sale: 'false' })
      expect(where.discount).toBeUndefined()
    })

    it('filters by minPrice', () => {
      const { where } = buildProductsQuery({ minPrice: 100 })
      expect(where.price).toMatchObject({ gte: 100 })
    })

    it('filters by maxPrice', () => {
      const { where } = buildProductsQuery({ maxPrice: 500 })
      expect(where.price).toMatchObject({ lte: 500 })
    })

    it('filters by price range', () => {
      const { where } = buildProductsQuery({ minPrice: 100, maxPrice: 500 })
      expect(where.price).toEqual({ gte: 100, lte: 500 })
    })

    it('filters by search term case-insensitively', () => {
      const { where } = buildProductsQuery({ search: 'blazer' })
      expect(where.name).toEqual({ contains: 'blazer', mode: 'insensitive' })
    })

    it('applies multiple filters together', () => {
      const { where } = buildProductsQuery({ category: 'clothing', sale: 'true', search: 'tee' })
      expect(where.category).toEqual({ slug: 'clothing' })
      expect(where.discount).toEqual({ gt: 0 })
      expect(where.name).toMatchObject({ contains: 'tee' })
    })
  })
})

describe('buildPageMeta', () => {
  it('calculates totalPages correctly', () => {
    expect(buildPageMeta(100, 1, 20).totalPages).toBe(5)
  })

  it('rounds up totalPages', () => {
    expect(buildPageMeta(21, 1, 20).totalPages).toBe(2)
  })

  it('returns 0 total pages when there are no results', () => {
    expect(buildPageMeta(0, 1, 20).totalPages).toBe(0)
  })

  it('reflects page and limit in meta', () => {
    const meta = buildPageMeta(50, 3, 10)
    expect(meta.page).toBe(3)
    expect(meta.limit).toBe(10)
    expect(meta.total).toBe(50)
  })
})
