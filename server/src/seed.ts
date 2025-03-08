import prisma from './config/database';
import logger from './utils/logger';

async function main() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        password: 'hashedpassword',
        firstName: 'Dev',
        lastName: 'User'
      }
    });
    
    logger.info('Created test user:', user);
  } catch (error) {
    // If the user already exists, just log it
    if ((error as any).code === 'P2002') {
      logger.info('Test user already exists');
    } else {
      logger.error('Error seeding database:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    logger.info('Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }); 