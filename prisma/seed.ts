import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Users
  const [, john, jane] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@shop.com' },
      update: {},
      create: {
        email: 'admin@shop.com',
        name: 'Admin',
        password: 'hashed_password',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: { email: 'john@example.com', name: 'John Doe', password: 'hashed_password' },
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: { email: 'jane@example.com', name: 'Jane Smith', password: 'hashed_password' },
    }),
  ])
  console.log('Seeded users')

  // Top-level categories
  const [clothing, electronics, homeDecor] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: { name: 'Clothing', slug: 'clothing' },
    }),
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-decor' },
      update: {},
      create: { name: 'Home & Decor', slug: 'home-decor' },
    }),
  ])

  // Subcategories
  const [menswear, womenswear, phones, laptops, furniture, lighting] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'menswear' },
      update: {},
      create: { name: 'Menswear', slug: 'menswear', parentId: clothing.id },
    }),
    prisma.category.upsert({
      where: { slug: 'womenswear' },
      update: {},
      create: { name: 'Womenswear', slug: 'womenswear', parentId: clothing.id },
    }),
    prisma.category.upsert({
      where: { slug: 'phones' },
      update: {},
      create: { name: 'Phones', slug: 'phones', parentId: electronics.id },
    }),
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: { name: 'Laptops', slug: 'laptops', parentId: electronics.id },
    }),
    prisma.category.upsert({
      where: { slug: 'furniture' },
      update: {},
      create: { name: 'Furniture', slug: 'furniture', parentId: homeDecor.id },
    }),
    prisma.category.upsert({
      where: { slug: 'lighting' },
      update: {},
      create: { name: 'Lighting', slug: 'lighting', parentId: homeDecor.id },
    }),
  ])
  console.log('Seeded categories')

  // Products
  const products = await Promise.all([
    // Menswear
    prisma.product.upsert({
      where: { slug: 'classic-white-tee' },
      update: {},
      create: {
        name: 'Classic White Tee',
        slug: 'classic-white-tee',
        price: 29.99,
        stock: 120,
        categoryId: menswear.id,
        description: 'Essential cotton crew-neck tee.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'slim-chinos' },
      update: {},
      create: {
        name: 'Slim Chinos',
        slug: 'slim-chinos',
        price: 79.99,
        discount: 15,
        stock: 60,
        categoryId: menswear.id,
        description: 'Tapered chinos in stretch cotton.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'wool-blazer' },
      update: {},
      create: {
        name: 'Wool Blazer',
        slug: 'wool-blazer',
        price: 249.0,
        stock: 25,
        categoryId: menswear.id,
        description: 'Single-breasted blazer in Italian wool.',
      },
    }),
    // Womenswear
    prisma.product.upsert({
      where: { slug: 'linen-midi-dress' },
      update: {},
      create: {
        name: 'Linen Midi Dress',
        slug: 'linen-midi-dress',
        price: 119.0,
        discount: 20,
        stock: 45,
        categoryId: womenswear.id,
        description: 'Relaxed fit midi dress in pure linen.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ribbed-knit-top' },
      update: {},
      create: {
        name: 'Ribbed Knit Top',
        slug: 'ribbed-knit-top',
        price: 49.99,
        stock: 80,
        categoryId: womenswear.id,
        description: 'Slim-fit ribbed top in viscose blend.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'high-waist-trousers' },
      update: {},
      create: {
        name: 'High-Waist Trousers',
        slug: 'high-waist-trousers',
        price: 99.0,
        stock: 50,
        categoryId: womenswear.id,
        description: 'Wide-leg trousers with a pressed crease.',
      },
    }),
    // Phones
    prisma.product.upsert({
      where: { slug: 'nova-pro-15' },
      update: {},
      create: {
        name: 'Nova Pro 15',
        slug: 'nova-pro-15',
        price: 1099.0,
        stock: 30,
        categoryId: phones.id,
        description: '6.7" OLED, 50MP camera, 5000mAh battery.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'nova-lite-13' },
      update: {},
      create: {
        name: 'Nova Lite 13',
        slug: 'nova-lite-13',
        price: 599.0,
        discount: 10,
        stock: 55,
        categoryId: phones.id,
        description: 'Compact 6.1" display with all-day battery.',
      },
    }),
    // Laptops
    prisma.product.upsert({
      where: { slug: 'aerobook-pro-14' },
      update: {},
      create: {
        name: 'AeroBook Pro 14',
        slug: 'aerobook-pro-14',
        price: 1499.0,
        stock: 18,
        categoryId: laptops.id,
        description: '14" 2K display, 32GB RAM, 1TB SSD.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'aerobook-air-13' },
      update: {},
      create: {
        name: 'AeroBook Air 13',
        slug: 'aerobook-air-13',
        price: 999.0,
        discount: 5,
        stock: 22,
        categoryId: laptops.id,
        description: 'Ultra-thin 13" laptop under 1kg.',
      },
    }),
    // Furniture
    prisma.product.upsert({
      where: { slug: 'oak-side-table' },
      update: {},
      create: {
        name: 'Oak Side Table',
        slug: 'oak-side-table',
        price: 189.0,
        stock: 14,
        categoryId: furniture.id,
        description: 'Solid oak with a matte lacquer finish.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'linen-sofa-2-seat' },
      update: {},
      create: {
        name: 'Linen Sofa 2-Seat',
        slug: 'linen-sofa-2-seat',
        price: 899.0,
        discount: 12,
        stock: 8,
        categoryId: furniture.id,
        description: 'Deep-seat sofa in stone linen.',
      },
    }),
    // Lighting
    prisma.product.upsert({
      where: { slug: 'arc-floor-lamp' },
      update: {},
      create: {
        name: 'Arc Floor Lamp',
        slug: 'arc-floor-lamp',
        price: 159.0,
        stock: 20,
        categoryId: lighting.id,
        description: 'Matte black arc lamp with marble base.',
      },
    }),
    prisma.product.upsert({
      where: { slug: 'pendant-light-globe' },
      update: {},
      create: {
        name: 'Globe Pendant Light',
        slug: 'pendant-light-globe',
        price: 89.0,
        discount: 25,
        stock: 35,
        categoryId: lighting.id,
        description: 'Smoked glass globe, E27 fitting.',
      },
    }),
  ])
  console.log('Seeded products')

  // Reviews
  await Promise.all([
    prisma.review.createMany({
      data: [
        {
          rating: 5,
          comment: 'Perfect fit, great quality.',
          userId: john.id,
          productId: products[0].id,
        },
        {
          rating: 4,
          comment: 'Good material, runs slightly large.',
          userId: jane.id,
          productId: products[0].id,
        },
        { rating: 5, comment: 'Love the cut.', userId: john.id, productId: products[3].id },
        {
          rating: 3,
          comment: 'Decent quality for the price.',
          userId: jane.id,
          productId: products[6].id,
        },
        {
          rating: 5,
          comment: 'Blazing fast, great display.',
          userId: john.id,
          productId: products[8].id,
        },
      ],
      skipDuplicates: true,
    }),
  ])
  console.log('Seeded reviews')

  // Cart items
  await Promise.all([
    prisma.cartItem.upsert({
      where: { userId_productId: { userId: john.id, productId: products[0].id } },
      update: { quantity: 2 },
      create: { userId: john.id, productId: products[0].id, quantity: 2 },
    }),
    prisma.cartItem.upsert({
      where: { userId_productId: { userId: john.id, productId: products[1].id } },
      update: { quantity: 1 },
      create: { userId: john.id, productId: products[1].id, quantity: 1 },
    }),
    prisma.cartItem.upsert({
      where: { userId_productId: { userId: jane.id, productId: products[3].id } },
      update: { quantity: 1 },
      create: { userId: jane.id, productId: products[3].id, quantity: 1 },
    }),
  ])
  console.log('Seeded cart items')

  // Articles
  await Promise.all([
    prisma.article.upsert({
      where: { slug: 'summer-essentials-2025' },
      update: {},
      create: {
        title: 'Summer Essentials 2025',
        slug: 'summer-essentials-2025',
        excerpt: 'The pieces you need for a warm-weather wardrobe.',
        content:
          'Summer dressing is all about lightness and ease. Start with a quality linen shirt — it breathes well and looks polished. Pair it with slim chinos in a neutral tone. For footwear, a leather sandal or clean white sneaker works in most situations. Layer with a lightweight knit for cooler evenings.',
        publishedAt: new Date('2025-05-01'),
      },
    }),
    prisma.article.upsert({
      where: { slug: 'how-to-pick-a-laptop' },
      update: {},
      create: {
        title: 'How to Pick a Laptop in 2025',
        slug: 'how-to-pick-a-laptop',
        excerpt: 'A straightforward guide to finding the right machine for your needs.',
        content:
          'Start by narrowing down your use case. Creative professionals doing video editing or 3D work need a dedicated GPU and at least 32GB RAM. For everyday productivity and coding, a modern ARM chip with 16GB is more than sufficient and gives you excellent battery life. Screen quality matters more than most people expect — look for at least a 2K panel with good color accuracy.',
        publishedAt: new Date('2025-04-15'),
      },
    }),
    prisma.article.upsert({
      where: { slug: 'interior-trends-minimalism' },
      update: {},
      create: {
        title: 'Interior Trends: The Return of Minimalism',
        slug: 'interior-trends-minimalism',
        excerpt: 'Why less is still more in contemporary home design.',
        content:
          'After a few years of maximalist interiors dominating design media, the pendulum is swinging back. Clean lines, natural materials, and deliberate negative space are central to the current aesthetic. Oak, linen, and matte blacks are the palette. The key is restraint — every object should earn its place.',
        publishedAt: new Date('2025-03-20'),
      },
    }),
  ])
  console.log('Seeded articles')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
