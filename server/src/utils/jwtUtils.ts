/**
 * JWT Utilities for token generation and verification
 *
 * Provides methods for:
 * - Generating access tokens
 * - Generating refresh tokens
 * - Verifying tokens
 */

import jwt from 'jsonwebtoken';
import config from '../config/config';
import logger from './logger';

// Token types
export interface TokenPayload {
  userId: string;
  email: string;
}

// Generate a new access token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

// Generate a new refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.auth.refreshTokenSecret, {
    expiresIn: config.auth.refreshTokenExpiresIn,
  });
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    logger.debug(`Verifying access token: ${token.substring(0, 10)}...`);
    const decoded = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
    logger.debug('Token verified successfully');
    return decoded;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`JWT verification failed: ${errorMessage}`);
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    logger.debug(`Verifying refresh token: ${token.substring(0, 10)}...`);
    const decoded = jwt.verify(token, config.auth.refreshTokenSecret) as TokenPayload;
    logger.debug('Refresh token verified successfully');
    return decoded;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Refresh token verification failed: ${errorMessage}`);
    return null;
  }
};

// Handle both token types in one function
export const verifyToken = (token: string, isRefreshToken = false): TokenPayload | null => {
  return isRefreshToken ? verifyRefreshToken(token) : verifyAccessToken(token);
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader: string): string | null => {
  // Check if header exists and has the right format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.debug(`Invalid auth header format: ${authHeader}`);
    return null;
  }

  // Extract token from header
  const token = authHeader.split(' ')[1];
  logger.debug(`Extracted token: ${token.substring(0, 10)}...`);
  return token;
};