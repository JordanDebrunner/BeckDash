/**
 * Authentication middleware
 *
 * Protects routes by verifying JWT tokens and adding user info to request
 */

import { Response, NextFunction } from 'express';
import { unauthorized } from '../utils/responseFormatter';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwtUtils';
import logger from '../utils/logger';
import prisma from '../config/database';
import { RequestWithUser } from '../types/RequestWithUser';

/**
 * Middleware to verify JWT tokens and attach user to request
 */
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    // If no auth header is present, return unauthorized
    if (!authHeader) {
      return unauthorized(res, 'Authentication required');
    }

    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return unauthorized(res, 'Invalid authentication token format');
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return unauthorized(res, 'Invalid or expired token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    // If user doesn't exist, return unauthorized
    if (!user) {
      return unauthorized(res, 'User not found');
    }

    // Remove password from user object for security
    const { password, ...userWithoutPassword } = user;

    // Attach user info to request
    req.user = userWithoutPassword;
    req.userId = decoded.userId;

    // Proceed to next middleware
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return unauthorized(res, 'Authentication failed');
  }
};

/**
 * Optional authentication middleware - doesn't require authentication
 * but will attach user info if token is valid
 */
export const optionalAuthenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    // If no auth header is present, continue without authentication
    if (!authHeader) {
      return next();
    }

    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return next();
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next();
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    // If user doesn't exist, continue without user info
    if (!user) {
      return next();
    }

    // Remove password from user object for security
    const { password, ...userWithoutPassword } = user;

    // Attach user info to request
    req.user = userWithoutPassword;
    req.userId = decoded.userId;

    // Proceed to next middleware
    next();
  } catch (error) {
    // In case of error, just proceed without user info
    next();
  }
};