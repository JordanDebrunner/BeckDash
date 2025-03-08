/**
 * Temporary Authentication Middleware
 * 
 * This is a simplified version that doesn't require actual authentication
 * for development purposes only.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Extended request interface with userId
export interface RequestWithUser extends Request {
  userId?: string;
  user?: any;
}

/**
 * Simplified authentication middleware that doesn't require actual authentication
 * This is for development purposes only
 */
export const authenticate = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Log the request for debugging
    logger.debug('SimpleAuth: Authenticating request', {
      path: req.path,
      method: req.method,
      headers: req.headers
    });
    
    // Set a dummy user ID for development
    req.userId = 'dev-user-id';
    req.user = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: null,
      theme: 'light',
      notificationsEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Log successful authentication
    logger.debug('SimpleAuth: Authentication successful', {
      userId: req.userId,
      path: req.path,
      method: req.method
    });
    
    // Continue to the next middleware
    next();
  } catch (error) {
    // Log the error
    logger.error('SimpleAuth: Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method
    });
    
    // Continue to the next middleware even if there's an error
    next();
  }
}; 