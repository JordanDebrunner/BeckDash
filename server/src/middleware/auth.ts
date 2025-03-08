/**
 * Temporary Authentication Middleware
 * 
 * This is a simplified version that doesn't require actual authentication
 * for development purposes only.
 */

import { Request, Response, NextFunction } from 'express';

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
  // Set a dummy user ID for development
  req.userId = 'dev-user-id';
  
  // Continue to the next middleware
  next();
}; 