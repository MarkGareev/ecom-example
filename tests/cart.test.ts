import { cartPostSchema, cartGetSchema, cartDeleteSchema } from '#server/validation'

describe('cartGetSchema', () => {
  it('parses a valid userId', () => {
    expect(cartGetSchema.parse({ userId: 'u1' })).toEqual({ userId: 'u1' })
  })

  it('rejects missing userId', () => {
    expect(() => cartGetSchema.parse({})).toThrow()
  })

  it('rejects empty userId', () => {
    expect(() => cartGetSchema.parse({ userId: '' })).toThrow()
  })
})

describe('cartPostSchema', () => {
  it('parses a valid body', () => {
    const result = cartPostSchema.parse({ userId: 'u1', productId: 'p1', quantity: 3 })
    expect(result).toEqual({ userId: 'u1', productId: 'p1', quantity: 3 })
  })

  it('defaults quantity to 1 when omitted', () => {
    const result = cartPostSchema.parse({ userId: 'u1', productId: 'p1' })
    expect(result.quantity).toBe(1)
  })

  it('rejects quantity less than 1', () => {
    expect(() => cartPostSchema.parse({ userId: 'u1', productId: 'p1', quantity: 0 })).toThrow()
  })

  it('rejects missing userId', () => {
    expect(() => cartPostSchema.parse({ productId: 'p1' })).toThrow()
  })

  it('rejects missing productId', () => {
    expect(() => cartPostSchema.parse({ userId: 'u1' })).toThrow()
  })

  it('rejects empty userId', () => {
    expect(() => cartPostSchema.parse({ userId: '', productId: 'p1' })).toThrow()
  })
})

describe('cartDeleteSchema', () => {
  it('parses a valid id', () => {
    expect(cartDeleteSchema.parse({ id: 'abc123' })).toEqual({ id: 'abc123' })
  })

  it('rejects missing id', () => {
    expect(() => cartDeleteSchema.parse({})).toThrow()
  })

  it('rejects empty id', () => {
    expect(() => cartDeleteSchema.parse({ id: '' })).toThrow()
  })
})
