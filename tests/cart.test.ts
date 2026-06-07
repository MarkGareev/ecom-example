import { cartPostSchema } from '#server/validation'

describe('cartPostSchema', () => {
  it('parses a valid body', () => {
    const result = cartPostSchema.parse({ productId: 'p1', quantity: 3 })
    expect(result).toEqual({ productId: 'p1', quantity: 3 })
  })

  it('defaults quantity to 1 when omitted', () => {
    const result = cartPostSchema.parse({ productId: 'p1' })
    expect(result.quantity).toBe(1)
  })

  it('rejects quantity less than 1', () => {
    expect(() => cartPostSchema.parse({ productId: 'p1', quantity: 0 })).toThrow()
  })

  it('rejects quantity above 100', () => {
    expect(() => cartPostSchema.parse({ productId: 'p1', quantity: 101 })).toThrow()
  })

  it('rejects missing productId', () => {
    expect(() => cartPostSchema.parse({})).toThrow()
  })

  it('rejects empty productId', () => {
    expect(() => cartPostSchema.parse({ productId: '' })).toThrow()
  })
})
