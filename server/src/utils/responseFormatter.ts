/**
 * Response Formatter
 *
 * Utility functions for formatting API responses
 */

import { Response } from 'express';

// Error detail interface
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Format a successful response
 */
export const success = (
  res: Response,
  data: any = {},
  message = 'Success'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

/**
 * Format a created response (201)
 */
export const created = (
  res: Response,
  data: any = {},
  message = 'Resource created successfully'
): Response => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

/**
 * Format a bad request response (400)
 */
export const badRequest = (
  res: Response,
  message = 'Bad request',
  errors: ErrorDetail[] = []
): Response => {
  return res.status(400).json({
    success: false,
    message,
    errors
  });
};

/**
 * Format an unauthorized response (401)
 */
export const unauthorized = (
  res: Response,
  message = 'Unauthorized'
): Response => {
  return res.status(401).json({
    success: false,
    message
  });
};

/**
 * Format a forbidden response (403)
 */
export const forbidden = (
  res: Response,
  message = 'Forbidden'
): Response => {
  return res.status(403).json({
    success: false,
    message
  });
};

/**
 * Format a not found response (404)
 */
export const notFound = (
  res: Response,
  message = 'Resource not found'
): Response => {
  return res.status(404).json({
    success: false,
    message
  });
};

/**
 * Format a conflict response (409)
 */
export const conflict = (
  res: Response,
  message = 'Resource already exists',
  errors: ErrorDetail[] = []
): Response => {
  return res.status(409).json({
    success: false,
    message,
    errors
  });
};

/**
 * Format a validation error response (422)
 */
export const validationError = (
  res: Response,
  message = 'Validation error',
  errors: ErrorDetail[] = []
): Response => {
  return res.status(422).json({
    success: false,
    message,
    errors
  });
};

/**
 * Format a server error response (500)
 */
export const serverError = (
  res: Response,
  message = 'Internal server error'
): Response => {
  return res.status(500).json({
    success: false,
    message
  });
};

// Too many requests error response
export const tooManyRequests = (
  res: Response,
  message = 'Too many requests, please try again later'
): Response => {
  return error(res, message, 429);
};

// Response for no content
export const noContent = (res: Response): Response => {
  return res.status(204).send();
};