/**
 * Response formatter utility
 *
 * Provides standardized API responses throughout the application
 */

import { Response } from 'express';

// Error response types
export type ErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};

// Success response with data
export const success = <T>(res: Response, data: T, message = 'Success', statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Success response without data
export const successMessage = (res: Response, message = 'Success', statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
  });
};

// Error response
export const error = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors: ErrorDetail[] = []
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  });
};

// Validation error response
export const validationError = (
  res: Response,
  errors: ErrorDetail[],
  message = 'Validation failed'
): Response => {
  return error(res, message, 400, errors);
};

// Not found error response
export const notFound = (
  res: Response,
  message = 'Resource not found'
): Response => {
  return error(res, message, 404);
};

// Unauthorized error response
export const unauthorized = (
  res: Response,
  message = 'Unauthorized access'
): Response => {
  return error(res, message, 401);
};

// Forbidden error response
export const forbidden = (
  res: Response,
  message = 'Access forbidden'
): Response => {
  return error(res, message, 403);
};

// Bad request error response
export const badRequest = (
  res: Response,
  message = 'Bad request',
  errors: ErrorDetail[] = []
): Response => {
  return error(res, message, 400, errors);
};

// Internal server error response
export const serverError = (
  res: Response,
  message = 'Internal server error'
): Response => {
  return error(res, message, 500);
};

// Too many requests error response
export const tooManyRequests = (
  res: Response,
  message = 'Too many requests, please try again later'
): Response => {
  return error(res, message, 429);
};

// Response for created resources
export const created = <T>(res: Response, data: T, message = 'Resource created successfully'): Response => {
  return success(res, data, message, 201);
};

// Response for no content
export const noContent = (res: Response): Response => {
  return res.status(204).send();
};