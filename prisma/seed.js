import { prisma } from '../src/config/dbConfig.js'

async function main() {
  console.log(`Start seeding ...`)

  const services = [
    {
      name: 'Basic Haircut',
      description: 'A standard professional haircut.',
      duration: 30, // 30 minutes
      price: 25.00,
      currency: 'usd',
      isActive: true,
    },
    {
      name: 'Premium Styling',
      description: 'Haircut, wash, and premium styling.',
      duration: 60, // 60 minutes
      price: 50.00,
      currency: 'usd',
      isActive: true,
    },
    {
      name: 'Beard Trim & Grooming',
      description: 'Professional beard trimming and shaping.',
      duration: 20, // 20 minutes
      price: 15.00,
      currency: 'usd',
      isActive: true,
    }
  ]

  for (const s of services) {
    const service = await prisma.service.create({
      data: s,
    })
    console.log(`Created service with id: ${service.id} - ${service.name}`)
  }

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
