import { productsQuerySchema } from '#server/validation'
import { buildProductsWhere, buildPageMeta } from '#server/products'

describe('productsQuerySchema', () => {
  describe('pagination', () => {
    it('defaults to page 1, limit 20', () => {
      const result = productsQuerySchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('parses string numbers from query params', () => {
      const result = productsQuerySchema.parse({ page: '3', limit: '10' })
      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
    })

    it('clamps limit to max 100', () => {
      const result = productsQuerySchema.parse({ limit: '999' })
      expect(result.limit).toBe(100)
    })

    it('rejects page less than 1', () => {
      expect(() => productsQuerySchema.parse({ page: '0' })).toThrow()
    })

    it('rejects non-numeric page', () => {
      expect(() => productsQuerySchema.parse({ page: 'abc' })).toThrow()
    })
  })

  describe('sorting', () => {
    it('defaults to createdAt desc', () => {
      const result = productsQuerySchema.parse({})
      expect(result.sort).toBe('createdAt')
      expect(result.order).toBe('desc')
    })

    it('accepts valid sort fields', () => {
      expect(productsQuerySchema.parse({ sort: 'price' }).sort).toBe('price')
      expect(productsQuerySchema.parse({ sort: 'name' }).sort).toBe('name')
    })

    it('rejects unknown sort field', () => {
      expect(() => productsQuerySchema.parse({ sort: 'unknown' })).toThrow()
    })

    it('accepts asc order', () => {
      expect(productsQuerySchema.parse({ order: 'asc' }).order).toBe('asc')
    })

    it('rejects invalid order', () => {
      expect(() => productsQuerySchema.parse({ order: 'random' })).toThrow()
    })
  })

  describe('filters', () => {
    it('parses category', () => {
      expect(productsQuerySchema.parse({ category: 'laptops' }).category).toBe('laptops')
    })

    it('coerces sale to boolean', () => {
      expect(productsQuerySchema.parse({ sale: 'true' }).sale).toBe(true)
      expect(productsQuerySchema.parse({ sale: 'false' }).sale).toBe(false)
    })

    it('parses numeric price range', () => {
      const result = productsQuerySchema.parse({ minPrice: '100', maxPrice: '500' })
      expect(result.minPrice).toBe(100)
      expect(result.maxPrice).toBe(500)
    })

    it('rejects negative minPrice', () => {
      expect(() => productsQuerySchema.parse({ minPrice: '-1' })).toThrow()
    })
  })
})

describe('buildProductsWhere', () => {
  it('returns empty where for no filters', () => {
    const query = productsQuerySchema.parse({})
    expect(buildProductsWhere(query)).toEqual({})
  })

  it('filters by category slug', () => {
    const query = productsQuerySchema.parse({ category: 'laptops' })
    expect(buildProductsWhere(query).category).toEqual({ slug: 'laptops' })
  })

  it('filters sale items', () => {
    const query = productsQuerySchema.parse({ sale: 'true' })
    expect(buildProductsWhere(query).discount).toEqual({ gt: 0 })
  })

  it('filters by price range', () => {
    const query = productsQuerySchema.parse({ minPrice: '100', maxPrice: '500' })
    expect(buildProductsWhere(query).price).toEqual({ gte: 100, lte: 500 })
  })

  it('filters by search term', () => {
    const query = productsQuerySchema.parse({ search: 'blazer' })
    expect(buildProductsWhere(query).name).toEqual({ contains: 'blazer', mode: 'insensitive' })
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
})
