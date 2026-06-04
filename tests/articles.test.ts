import { articlesQuerySchema } from '#server/validation'

describe('articlesQuerySchema', () => {
  it('defaults to page 1, limit 10', () => {
    const result = articlesQuerySchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('parses string numbers from query params', () => {
    const result = articlesQuerySchema.parse({ page: '2', limit: '5' })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(5)
  })

  it('clamps limit to max 50', () => {
    const result = articlesQuerySchema.parse({ limit: '999' })
    expect(result.limit).toBe(50)
  })

  it('rejects page less than 1', () => {
    expect(() => articlesQuerySchema.parse({ page: '0' })).toThrow()
  })

  it('rejects non-numeric page', () => {
    expect(() => articlesQuerySchema.parse({ page: 'abc' })).toThrow()
  })
})
