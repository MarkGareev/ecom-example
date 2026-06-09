import {
  cartPatchSchema,
  orderPostSchema,
  updateProfileSchema,
  productSlugSchema,
} from '#server/validation'

describe('productSlugSchema', () => {
  it('accepts a valid slug', () => {
    expect(productSlugSchema.parse({ slug: 'nike-air-max' })).toEqual({ slug: 'nike-air-max' })
  })

  it('rejects empty slug', () => {
    expect(() => productSlugSchema.parse({ slug: '' })).toThrow()
  })

  it('rejects missing slug', () => {
    expect(() => productSlugSchema.parse({})).toThrow()
  })
})

describe('updateProfileSchema', () => {
  it('accepts name only', () => {
    expect(updateProfileSchema.parse({ name: 'John' })).toEqual({ name: 'John' })
  })

  it('accepts email only', () => {
    expect(updateProfileSchema.parse({ email: 'new@example.com' })).toEqual({
      email: 'new@example.com',
    })
  })

  it('accepts both fields', () => {
    const result = updateProfileSchema.parse({ name: 'John', email: 'new@example.com' })
    expect(result).toEqual({ name: 'John', email: 'new@example.com' })
  })

  it('accepts empty object (no-op update)', () => {
    expect(updateProfileSchema.parse({})).toEqual({})
  })

  it('rejects invalid email', () => {
    expect(() => updateProfileSchema.parse({ email: 'not-an-email' })).toThrow()
  })

  it('rejects empty name', () => {
    expect(() => updateProfileSchema.parse({ name: '' })).toThrow()
  })
})

describe('cartPatchSchema', () => {
  it('accepts valid quantity', () => {
    expect(cartPatchSchema.parse({ quantity: 5 })).toEqual({ quantity: 5 })
  })

  it('coerces string quantity', () => {
    expect(cartPatchSchema.parse({ quantity: '3' })).toEqual({ quantity: 3 })
  })

  it('rejects quantity below 1', () => {
    expect(() => cartPatchSchema.parse({ quantity: 0 })).toThrow()
  })

  it('rejects quantity above 100', () => {
    expect(() => cartPatchSchema.parse({ quantity: 101 })).toThrow()
  })

  it('rejects missing quantity', () => {
    expect(() => cartPatchSchema.parse({})).toThrow()
  })
})

describe('orderPostSchema', () => {
  const validItem = { productId: 'prod-1', quantity: 2 }

  it('accepts valid order', () => {
    const result = orderPostSchema.parse({ address: 'Moscow, Lenina 1', items: [validItem] })
    expect(result.address).toBe('Moscow, Lenina 1')
    expect(result.items).toHaveLength(1)
  })

  it('accepts multiple items', () => {
    const result = orderPostSchema.parse({
      address: 'Moscow',
      items: [validItem, { productId: 'prod-2', quantity: 1 }],
    })
    expect(result.items).toHaveLength(2)
  })

  it('rejects empty address', () => {
    expect(() => orderPostSchema.parse({ address: '', items: [validItem] })).toThrow()
  })

  it('rejects empty items array', () => {
    expect(() => orderPostSchema.parse({ address: 'Moscow', items: [] })).toThrow()
  })

  it('rejects item with quantity below 1', () => {
    expect(() =>
      orderPostSchema.parse({
        address: 'Moscow',
        items: [{ productId: 'prod-1', quantity: 0 }],
      }),
    ).toThrow()
  })

  it('rejects item with empty productId', () => {
    expect(() =>
      orderPostSchema.parse({ address: 'Moscow', items: [{ productId: '', quantity: 1 }] }),
    ).toThrow()
  })

  it('rejects missing address', () => {
    expect(() => orderPostSchema.parse({ items: [validItem] })).toThrow()
  })
})

describe('order price calculation', () => {
  function calcPrice(price: number, discount: number | null): number {
    return discount ? price * (1 - discount / 100) : price
  }

  function calcTotal(
    items: { productId: string; quantity: number }[],
    productMap: Map<string, { price: number; discount: number | null }>,
  ): number {
    return items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!
      return sum + calcPrice(product.price, product.discount) * item.quantity
    }, 0)
  }

  it('calculates total without discount', () => {
    const map = new Map([['p1', { price: 100, discount: null }]])
    expect(calcTotal([{ productId: 'p1', quantity: 3 }], map)).toBe(300)
  })

  it('applies percentage discount', () => {
    const map = new Map([['p1', { price: 100, discount: 20 }]])
    expect(calcTotal([{ productId: 'p1', quantity: 2 }], map)).toBe(160)
  })

  it('handles zero discount as no discount', () => {
    const map = new Map([['p1', { price: 50, discount: 0 }]])
    // discount = 0 is falsy, so no discount applied
    expect(calcTotal([{ productId: 'p1', quantity: 1 }], map)).toBe(50)
  })

  it('sums multiple items correctly', () => {
    const map = new Map([
      ['p1', { price: 100, discount: null }],
      ['p2', { price: 200, discount: 50 }],
    ])
    const items = [
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 2 },
    ]
    expect(calcTotal(items, map)).toBe(300) // 100 + 200*0.5*2
  })
})
