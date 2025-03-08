import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a development user if it doesn't exist
  const existingUser = await prisma.user.findUnique({
    where: {
      id: 'dev-user-id'
    }
  });

  if (!existingUser) {
    console.log('Creating development user...');
    const hashedPassword = hashSync('Password123!', 10);
    
    await prisma.user.create({
      data: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        password: hashedPassword,
        firstName: 'Dev',
        lastName: 'User',
        theme: 'light',
        notificationsEnabled: true
      }
    });
    
    console.log('Development user created successfully!');
  } else {
    console.log('Development user already exists.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 