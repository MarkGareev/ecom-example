import { prisma } from '#prisma'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '#server/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'refresh_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Missing refresh token' })
  }

  let payload: { sub: string }
  try {
    payload = await verifyRefreshToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid refresh token' })
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: token } })
  if (!stored || stored.expiresAt < new Date()) {
    throw createError({ statusCode: 401, message: 'Refresh token expired or revoked' })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  })
  if (!user) {
    throw createError({ statusCode: 401, message: 'User not found' })
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    signRefreshToken(user.id),
  ])

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  setCookie(event, 'refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  return { accessToken: newAccessToken }
})
