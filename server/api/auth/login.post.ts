import { prisma } from '#prisma'
import { loginSchema } from '#server/validation'
import { verifyPassword } from '#server/password'
import { signAccessToken, signRefreshToken } from '#server/jwt'

export default defineEventHandler(async (event) => {
  const result = loginSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.password))) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

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

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
  }
})
