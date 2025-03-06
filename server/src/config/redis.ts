/**
 * Redis client configuration and connection management
 *
 * Sets up Redis for caching, sessions, and background tasks
 */

import { createClient } from 'redis';
import config from './config';
import logger from '../utils/logger';

// Create Redis client
const redisClient = createClient({
  url: config.redis.url,
});

// Connect to Redis and handle errors
async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Implement retry logic with exponential backoff
    setTimeout(connectRedis, 5000);
  }
}

// Handle Redis errors
redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

// Handle Redis reconnection
redisClient.on('reconnecting', () => {
  logger.warn('Reconnecting to Redis...');
});

// Handle Redis ready event
redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

// Connect to Redis
connectRedis();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  logger.info('Redis client disconnected');
  process.exit(0);
});

export default redisClient;

// Utility functions for common Redis operations

/**
 * Cache data with an expiration time
 */
export const setCache = async (key: string, data: any, expirationInSeconds = 3600): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: expirationInSeconds,
  });
};

/**
 * Retrieve cached data
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redisClient.get(key);
  if (!cachedData) return null;
  return JSON.parse(cachedData) as T;
};

/**
 * Delete cached data
 */
export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

/**
 * Clear all cached data (use with caution)
 */
export const clearCache = async (): Promise<void> => {
  await redisClient.flushAll();
};