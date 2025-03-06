/**
 * Rate limiting middleware
 *
 * Protects the API from abuse by limiting the number of requests
 * from a single IP address or user
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import config from '../config/config';
import redisClient from '../config/redis';
import logger from '../utils/logger';

// Create a rate limiter using Redis as the store
export const apiLimiter = rateLimit({
  // Use Redis as the store if configured, otherwise use memory
  store: redisClient.isReady
    ? new RedisStore({
        // Updated to match the correct signature for the Redis client
        sendCommand: async (command, ...args) => {
          return redisClient.sendCommand([command, ...args].flat());
        },
        prefix: 'rate-limit:',
      })
    : undefined,
  windowMs: config.rateLimit.windowMs, // Time window in milliseconds
  max: config.rateLimit.max, // Limit each IP to X requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  handler: (req, res, next, options) => {
    const ip = req.ip || 'unknown';
    logger.warn(`Rate limit exceeded by IP: ${ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

// More restrictive rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  // Use Redis as the store if configured, otherwise use memory
  store: redisClient.isReady
    ? new RedisStore({
        // Updated to match the correct signature for the Redis client
        sendCommand: async (command, ...args) => {
          return redisClient.sendCommand([command, ...args].flat());
        },
        prefix: 'auth-rate-limit:',
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  handler: (req, res, next, options) => {
    const ip = req.ip || 'unknown';
    logger.warn(`Authentication rate limit exceeded by IP: ${ip}`);
    res.status(options.statusCode).json(options.message);
  },
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