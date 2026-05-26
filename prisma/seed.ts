import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@shop.com',
        name: 'Admin',
        password: 'hashed_password',
        role: 'ADMIN',
      },
      {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashed_password',
        role: 'CUSTOMER',
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: 'hashed_password',
        role: 'CUSTOMER',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seeded users')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
