/**
 * Error Handler Utilities
 * 
 * Provides standardized error handling for the application
 */

import { Response, Request } from 'express';
import logger from './logger';
import { serverError, badRequest, notFound, unauthorized } from './responseFormatter';
import { RequestWithUser } from '../types/request.types';

// Custom application error class
export class AppError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
};

/**
 * Standardized controller error handler
 * Wraps controller methods with consistent error handling
 */
export const withControllerErrorHandling = <P extends any[]>(
  controllerFn: (req: RequestWithUser, res: Response, ...args: P) => Promise<Response>,
  context: string
) => {
  return async (req: RequestWithUser, res: Response, ...args: P): Promise<Response> => {
    try {
      return await controllerFn(req, res, ...args);
    } catch (error: unknown) {
      logger.error(`Error in ${context}:`, error);
      
      if (error instanceof AppError) {
        switch (error.status) {
          case 400:
            return badRequest(res, error.message, error.details);
          case 401:
            return unauthorized(res, error.message);
          case 404:
            return notFound(res, error.message);
          default:
            return serverError(res, error.message);
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return serverError(res, errorMessage);
    }
  };
};

/**
 * Standardized service error handler
 * Wraps service methods with consistent error handling
 */
export const withServiceErrorHandling = <T extends any[], R>(
  serviceFn: (...args: T) => Promise<R>,
  context: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await serviceFn(...args);
    } catch (error: unknown) {
      logger.error(`Error in ${context}:`, error);
      
      // Rethrow as AppError with appropriate status
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle database errors
      if (
        typeof error === 'object' && 
        error !== null && 
        'code' in error && 
        typeof error.code === 'string' && (
          error.code.startsWith('P') || // Prisma error codes
          error.code === 'ER_DUP_ENTRY' || // MySQL duplicate entry
          error.code === '23505' // PostgreSQL unique violation
        )
      ) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new AppError(
          'Database operation failed',
          500,
          ErrorTypes.DATABASE,
          { originalError: errorMessage }
        );
      }
      
      // Default error
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new AppError(
        errorMessage,
        500,
        ErrorTypes.INTERNAL
      );
    }
  };
};

/**
 * Validate that a required parameter exists
 */
export const validateRequired = (value: any, name: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new AppError(`${name} is required`, 400, ErrorTypes.VALIDATION);
  }
};

/**
 * Validate that an entity exists
 */
export const validateExists = <T>(entity: T | null | undefined, entityName: string): T => {
  if (!entity) {
    throw new AppError(`${entityName} not found`, 404, ErrorTypes.NOT_FOUND);
  }
  return entity as T;
};

/**
 * Validate that a user has permission for an entity
 */
export const validateOwnership = (userId: string, entityUserId: string, entityName: string): void => {
  if (userId !== entityUserId) {
    throw new AppError(
      `You don't have permission to access this ${entityName}`,
      403,
      ErrorTypes.AUTHORIZATION
    );
  }
};

// Export default error handler middleware
export default (err: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', err);
  
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}; 