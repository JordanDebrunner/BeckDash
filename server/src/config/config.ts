/**
 * Main configuration file that centralizes all environment variables and settings
 *
 * This ensures type safety and provides proper defaults for all configuration values
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Server configuration
const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/beckdash';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Authentication configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_here';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// API Keys
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';

// CORS Configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || (IS_PRODUCTION ? 'https://beckdash.example.com' : 'http://localhost:5173');

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window

// Export all configuration variables
export default {
  server: {
    port: SERVER_PORT,
    nodeEnv: NODE_ENV,
    isProduction: IS_PRODUCTION,
  },
  db: {
    url: DATABASE_URL,
  },
  redis: {
    url: REDIS_URL,
  },
  auth: {
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: JWT_EXPIRES_IN,
    refreshTokenSecret: REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
  },
  api: {
    openWeatherMap: {
      key: OPENWEATHERMAP_API_KEY,
    },
  },
  cors: {
    origin: CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
  },
};