/**
 * Authentication Middleware
 *
 * Provides various authentication strategies for route protection
 * and user identification.
 */

import { Request, Response, NextFunction } from 'express';
import { unauthorized } from '../utils/responseFormatter';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwtUtils';
import logger from '../utils/logger';
import prisma from '../config/database';
import { RequestWithUser } from '../types/request.types';

/**
 * Full authentication middleware
 * Verifies JWT tokens and attaches user to request
 * Returns 401 if authentication fails
 */
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    logger.debug('Auth: Authenticating request');
    logger.debug('Auth: Token present: ' + (authHeader ? 'true' : 'false'));

    // If no auth header is present, return unauthorized
    if (!authHeader) {
      logger.debug('Auth: No authorization header found');
      return unauthorized(res, 'Authentication required');
    }

    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      logger.debug('Auth: Could not extract token from header');
      return unauthorized(res, 'Invalid authentication token format');
    }

    // Verify the token
    try {
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        logger.debug('Auth: Token verification failed');
        return unauthorized(res, 'Invalid or expired token');
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      // If user doesn't exist, return unauthorized
      if (!user) {
        logger.debug(`Auth: User ${decoded.userId} not found`);
        return unauthorized(res, 'User not found');
      }

      // Remove password from user object for security
      const { password, ...userWithoutPassword } = user;

      // Attach user info to request
      req.user = userWithoutPassword;
      req.userId = decoded.userId;

      logger.debug('Auth: Authentication successful');
      // Proceed to next middleware
      next();
    } catch (tokenError: unknown) {
      logger.error('Token verification error:', tokenError);
      return unauthorized(res, `Token verification failed: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`);
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return unauthorized(res, 'Authentication failed');
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
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

/**
 * Simple authentication middleware for development
 * Uses a default user ID if token verification fails
 */
export const simpleAuthenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.debug('SimpleAuth: Authenticating request');
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    logger.debug('SimpleAuth: Token present: ' + (authHeader ? 'true' : 'false'));
    
    // If no auth header is present, use a default user ID for development
    if (!authHeader) {
      logger.debug('SimpleAuth: No authorization header found, using default user ID');
      req.userId = 'dev-user-id'; // Default user ID for development
      next();
      return;
    }
    
    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      logger.debug('SimpleAuth: Could not extract token from header, using default user ID');
      req.userId = 'dev-user-id'; // Default user ID for development
      next();
      return;
    }
    
    try {
      // Try to verify the token, but don't fail if it's invalid
      const decoded = verifyAccessToken(token);
      if (decoded) {
        logger.debug(`SimpleAuth: Token verified, user ID: ${decoded.userId}`);
        
        // Try to find the user in the database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        
        if (user) {
          // Remove password from user object for security
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
          req.userId = decoded.userId;
        } else {
          logger.debug(`SimpleAuth: User ${decoded.userId} not found, using default user ID`);
          req.userId = 'dev-user-id';
        }
      } else {
        logger.debug('SimpleAuth: Token verification failed, using default user ID');
        req.userId = 'dev-user-id'; // Default user ID for development
      }
    } catch (error) {
      logger.debug('SimpleAuth: Token verification error, using default user ID');
      req.userId = 'dev-user-id'; // Default user ID for development
    }
    
    logger.debug(`SimpleAuth: Authentication successful, user ID: ${req.userId}`);
    next();
  } catch (error) {
    logger.error('SimpleAuth: Authentication error:', error);
    req.userId = 'dev-user-id'; // Default user ID for development
    next();
  }
};

/**
 * Role-based authentication middleware
 * Verifies JWT tokens and checks if user has required role
 */
export const authorizeRole = (roles: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      // First authenticate the user
      const authResult = await authenticate(req, res, () => {});
      
      // If authentication failed, return the result
      if (authResult) return authResult;
      
      // Check if user has required role
      const userRoles = req.user?.roles || [];
      const hasRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        logger.debug(`User ${req.userId} does not have required roles: ${roles.join(', ')}`);
        return unauthorized(res, 'Insufficient permissions');
      }
      
      // User has required role, proceed
      next();
    } catch (error) {
      logger.error('Role authorization error:', error);
      return unauthorized(res, 'Authorization failed');
    }
  };
};

// Export default authenticate for backward compatibility
export default authenticate; 