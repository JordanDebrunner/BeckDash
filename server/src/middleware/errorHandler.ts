/**
 * Global error handling middleware
 *
 * Provides centralized error handling for the entire application
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { error, ErrorDetail, validationError } from '../utils/responseFormatter';
import config from '../config/config';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  errors?: ErrorDetail[];

  constructor(message: string, statusCode = 500, errors: ErrorDetail[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors.length > 0 ? errors : undefined;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error Handler
 * Catch 404 errors for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return error(
    res,
    `Cannot ${req.method} ${req.originalUrl}`,
    404
  );
};

/**
 * Global Error Handler
 * Handles all errors that occur in the application
 */
export const globalErrorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  // Set default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails: ErrorDetail[] = [];

  // Log the error
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errors || [];
  }
  // Handle validation errors from Zod
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    return validationError(res, errorDetails, message);
  }
  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        message = `A record with this ${err.meta?.target as string || 'value'} already exists`;
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        break;
      default:
        message = 'Database operation failed';
    }
  }
  // Handle other errors
  else {
    message = err.message;
  }

  // In production, don't send detailed error information
  if (config.server.isProduction) {
    // Don't expose error details in production
    const isServerError = statusCode >= 500;

    if (isServerError) {
      return error(res, 'Internal Server Error', statusCode);
    }
  }

  // Send error response
  return error(res, message, statusCode, errorDetails);
};

/**
 * Error Handler Middleware
 *
 * Global error handling middleware for Express
 */

export interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};