import { reviewPostSchema } from '#server/validation'

describe('reviewPostSchema', () => {
  it('parses a valid rating with comment', () => {
    const result = reviewPostSchema.parse({ rating: 4, comment: 'Great product' })
    expect(result).toEqual({ rating: 4, comment: 'Great product' })
  })

  it('parses a valid rating without comment', () => {
    const result = reviewPostSchema.parse({ rating: 5 })
    expect(result.rating).toBe(5)
    expect(result.comment).toBeUndefined()
  })

  it('accepts all ratings from 1 to 5', () => {
    for (const r of [1, 2, 3, 4, 5]) {
      expect(() => reviewPostSchema.parse({ rating: r })).not.toThrow()
    }
  })

  it('rejects rating below 1', () => {
    expect(() => reviewPostSchema.parse({ rating: 0 })).toThrow()
  })

  it('rejects rating above 5', () => {
    expect(() => reviewPostSchema.parse({ rating: 6 })).toThrow()
  })

  it('rejects non-integer rating', () => {
    expect(() => reviewPostSchema.parse({ rating: 3.5 })).toThrow()
  })

  it('rejects missing rating', () => {
    expect(() => reviewPostSchema.parse({})).toThrow()
  })

  it('rejects empty comment', () => {
    expect(() => reviewPostSchema.parse({ rating: 3, comment: '' })).toThrow()
  })

  it('rejects comment exceeding 1000 characters', () => {
    expect(() => reviewPostSchema.parse({ rating: 3, comment: 'a'.repeat(1001) })).toThrow()
  })

  it('accepts comment at exactly 1000 characters', () => {
    expect(() => reviewPostSchema.parse({ rating: 3, comment: 'a'.repeat(1000) })).not.toThrow()
  })
})
