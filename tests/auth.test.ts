import { registerSchema, loginSchema, refreshSchema } from '#server/validation'
import { hashPassword, verifyPassword } from '#server/password'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '#server/jwt'

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.parse({ email: 'user@example.com', password: 'password123' })
    expect(result.email).toBe('user@example.com')
    expect(result.password).toBe('password123')
  })

  it('accepts optional name', () => {
    const result = registerSchema.parse({
      email: 'user@example.com',
      password: 'password123',
      name: 'John',
    })
    expect(result.name).toBe('John')
  })

  it('rejects invalid email', () => {
    expect(() => registerSchema.parse({ email: 'not-an-email', password: 'password123' })).toThrow()
  })

  it('rejects password shorter than 8 chars', () => {
    expect(() => registerSchema.parse({ email: 'user@example.com', password: 'short' })).toThrow()
  })

  it('rejects missing email', () => {
    expect(() => registerSchema.parse({ password: 'password123' })).toThrow()
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.parse({ email: 'user@example.com', password: 'any' })
    expect(result.email).toBe('user@example.com')
  })

  it('rejects invalid email', () => {
    expect(() => loginSchema.parse({ email: 'bad', password: 'pass' })).toThrow()
  })

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ email: 'user@example.com', password: '' })).toThrow()
  })
})

describe('refreshSchema', () => {
  it('accepts a token string', () => {
    expect(refreshSchema.parse({ refreshToken: 'abc' })).toEqual({ refreshToken: 'abc' })
  })

  it('rejects empty token', () => {
    expect(() => refreshSchema.parse({ refreshToken: '' })).toThrow()
  })
})

describe('password', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).not.toBe('secret123')
    await expect(verifyPassword('secret123', hash)).resolves.toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('secret123')
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false)
  })
})

describe('jwt', () => {
  const payload = { sub: 'user-1', email: 'user@example.com', role: 'CUSTOMER' }

  it('signs and verifies an access token', async () => {
    const token = await signAccessToken(payload)
    const verified = await verifyAccessToken(token)
    expect(verified.sub).toBe(payload.sub)
    expect(verified.email).toBe(payload.email)
    expect(verified.role).toBe(payload.role)
  })

  it('signs and verifies a refresh token', async () => {
    const token = await signRefreshToken('user-1')
    const verified = await verifyRefreshToken(token)
    expect(verified.sub).toBe('user-1')
  })

  it('rejects a tampered access token', async () => {
    const token = await signAccessToken(payload)
    await expect(verifyAccessToken(token + 'x')).rejects.toThrow()
  })

  it('rejects a tampered refresh token', async () => {
    const token = await signRefreshToken('user-1')
    await expect(verifyRefreshToken(token + 'x')).rejects.toThrow()
  })

  it('rejects an access token verified as refresh token', async () => {
    const token = await signAccessToken(payload)
    await expect(verifyRefreshToken(token)).rejects.toThrow()
  })
})
