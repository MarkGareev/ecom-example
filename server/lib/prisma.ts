import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#db'

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

const globalWithPrisma = globalThis as GlobalWithPrisma

export const prisma = globalWithPrisma.prisma ?? createPrismaClient()

globalWithPrisma.prisma = prisma
