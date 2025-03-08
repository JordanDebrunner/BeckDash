/**
 * Rate Limiting Middleware
 *
 * Middleware for limiting request rates to prevent abuse
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import config from '../config/config';
import redisClient from '../config/redis';
import logger from '../utils/logger';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  }
});

/**
 * More restrictive rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  }
});

// Create a custom rate limiter for specific routes or users
export const createRateLimiter = (
  windowMs: number,
  max: number,
  prefix = 'custom-rate-limit:'
) => {
  return rateLimit({
    store: redisClient.isReady
      ? new RedisStore({
          // Updated to match the correct signature for the Redis client
          sendCommand: async (command, ...args) => {
            return redisClient.sendCommand([command, ...args].flat());
          },
          prefix,
        })
      : undefined,
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Rate limit exceeded, please try again later',
    },
  });
};