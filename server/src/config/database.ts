/**
 * Database configuration and connection management
 *
 * This file sets up the Prisma client and handles database connection
 */

import { PrismaClient } from '@prisma/client';
import config from './config';
import logger from '../utils/logger';

// Create a global variable to store the Prisma instance across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a new Prisma client or reuse the existing one
const prisma = global.prisma || new PrismaClient({
  log: config.server.isProduction
    ? ['error']
    : ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: config.db.url,
    },
  },
});

// Prisma connection event handlers
prisma.$on('connect', () => {
  logger.info('Successfully connected to PostgreSQL database');
});

prisma.$on('error', (e) => {
  logger.error('Database connection error:', e);
});

// Save the client in global object in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from PostgreSQL database');
});

export default prisma;