/**
 * Extended Request interface with User information
 *
 * This type is used to extend the Express Request interface
 * to include the authenticated user's information
 */

import { Request } from 'express';
import { User } from '@prisma/client';

export interface RequestWithUser extends Request {
  user?: Omit<User, 'password'>;
  userId?: string;
}