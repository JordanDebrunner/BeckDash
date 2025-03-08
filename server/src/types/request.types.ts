/**
 * Request Types
 * 
 * Shared request interface types used throughout the application
 */

import { Request } from 'express';

/**
 * Extended request interface with user information
 */
export interface RequestWithUser extends Request {
  userId?: string;
  user?: any;
} 