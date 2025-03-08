/**
 * Server Entry Point
 *
 * Initializes the application and starts the server
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import logger from './utils/logger';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

// Redis event handlers
redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('connect', () => {
  logger.info('Successfully connected to Redis');
});

redisClient.on('end', () => {
  logger.info('Redis connection closed');
});

// Connect to databases
async function connectDatabases() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await connectDatabases();
    console.log("Applying Prisma migrations...");
    
    exec('npx prisma migrate dev', (err, stdout, stderr) => {
      if (err) console.error("Migration failed:", stderr);
      else console.log("Migration output:", stdout);
    });
    
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Cleanup on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});