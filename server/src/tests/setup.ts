/**
 * Test setup file
 *
 * This file runs before tests to set up the test environment
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Create test database connection
const prisma = new PrismaClient();

// Create test Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Before all tests
beforeAll(async () => {
  // Connect to Redis
  await redisClient.connect();

  // Clean up database before tests
  await prisma.$transaction([
    prisma.maintenanceTask.deleteMany(),
    prisma.mealPlan.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.plant.deleteMany(),
    prisma.task.deleteMany(),
    prisma.event.deleteMany(),
    prisma.weatherLocation.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

// After all tests
afterAll(async () => {
  // Disconnect from database and Redis
  await prisma.$disconnect();
  await redisClient.quit();
});

// Exports for tests to use
export { prisma, redisClient };