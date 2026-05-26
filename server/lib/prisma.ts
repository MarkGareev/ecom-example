import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../app/generated/prisma/client'

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

const globalWithPrisma = globalThis as GlobalWithPrisma

export const prisma = globalWithPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma
}
