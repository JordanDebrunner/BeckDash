/**
 * Request validation middleware using Zod
 *
 * Provides type-safe validation for request body, query parameters, and route parameters
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { validationError } from '../utils/responseFormatter';
import logger from '../utils/logger';

/**
 * Validates request against a Zod schema
 *
 * @param schema Zod schema for validation
 * @returns Express middleware function
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      // Combine request objects to validate (based on HTTP method)
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      // Validate data against schema
      await schema.parseAsync(dataToValidate);

      // Continue to controller if validation passes
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        logger.debug('Validation error:', error.errors);

        // Format errors for response
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Send validation error response
        return validationError(res, formattedErrors);
      }

      // Pass other errors to global error handler
      next(error);
    }
  };
};

/**
 * Create schema validator for specific parts of the request
 *
 * Example usage:
 * const createUserSchema = z.object({
 *   body: z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   }),
 * });
 *
 * router.post('/users', validateRequest(createUserSchema), createUser);
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      // Extract just the parts of the request we want to validate based on schema
      const dataToValidate: Record<string, unknown> = {};

      // Only include parts defined in the schema
      if ('body' in schema.shape) dataToValidate.body = req.body;
      if ('query' in schema.shape) dataToValidate.query = req.query;
      if ('params' in schema.shape) dataToValidate.params = req.params;

      // Validate the data
      await schema.parseAsync(dataToValidate);

      // Continue to controller if validation passes
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        logger.debug('Validation error:', error.errors);

        // Format errors for response
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Send validation error response
        return validationError(res, formattedErrors);
      }

      // Pass other errors to global error handler
      next(error);
    }
  };
};