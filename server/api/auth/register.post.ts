import { prisma } from '#prisma'
import { registerSchema } from '#server/validation'
import { hashPassword } from '#server/password'
import { signAccessToken, signRefreshToken } from '#server/jwt'

export default defineEventHandler(async (event) => {
  const result = registerSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const { email, password, name } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already in use' })
  }

  const user = await prisma.user.create({
    data: { email, password: await hashPassword(password), name },
    select: { id: true, email: true, name: true, role: true },
  })

  const [accessToken, refreshTokenJwt] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    signRefreshToken(user.id),
  ])

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshTokenJwt,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  setCookie(event, 'refresh_token', refreshTokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  return { user, accessToken }
})
