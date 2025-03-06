/**
 * Authentication controller
 *
 * Handles HTTP requests related to authentication
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/authService';
import { success, unauthorized, badRequest, created } from '../utils/responseFormatter';
import logger from '../utils/logger';
import { RequestWithUser } from '../types/RequestWithUser';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional().nullable(),
  theme: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
});

// Authentication controller methods
export const authController = {
  /**
   * Register a new user
   */
  async register(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      // Register user
      const user = await authService.register(validationResult.data);

      // Generate tokens
      const tokens = await authService.generateTokens(user.id, user.email);

      // Return user and tokens
      return created(res, {
        user,
        tokens
      }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   */
  async login(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      // Login user
      const { user, tokens } = await authService.login(validationResult.data);

      // Set refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return user and access token
      return success(res, {
        user,
        accessToken: tokens.accessToken
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Get refresh token from cookie or request body
      let refreshToken = req.cookies.refreshToken;

      // If not in cookie, check request body
      if (!refreshToken) {
        const validationResult = refreshTokenSchema.safeParse(req.body);
        if (!validationResult.success) {
          return unauthorized(res, 'Invalid refresh token');
        }
        refreshToken = validationResult.data.refreshToken;
      }

      // Refresh token
      const tokens = await authService.refreshToken(refreshToken);

      // If token refresh failed
      if (!tokens) {
        return unauthorized(res, 'Invalid or expired refresh token');
      }

      // Set new refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return new access token
      return success(res, {
        accessToken: tokens.accessToken
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout user
   */
  async logout(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Get refresh token from cookie or request body
      let refreshToken = req.cookies.refreshToken;

      // If not in cookie, check request body
      if (!refreshToken && req.body.refreshToken) {
        refreshToken = req.body.refreshToken;
      }

      // If no refresh token found
      if (!refreshToken) {
        return success(res, null, 'Logged out successfully');
      }

      // Invalidate refresh token
      await authService.logout(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        return unauthorized(res, 'Not authenticated');
      }

      // Get user from database
      const user = await authService.getUserById(req.userId);

      if (!user) {
        return unauthorized(res, 'User not found');
      }

      return success(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        return unauthorized(res, 'Not authenticated');
      }

      // Validate request body
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      // Update user profile
      const user = await authService.updateProfile(req.userId, validationResult.data);

      return success(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change user password
   */
  async changePassword(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.userId) {
        return unauthorized(res, 'Not authenticated');
      }

      // Validate request body
      const validationResult = changePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return badRequest(res, 'Validation error', validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }

      // Change password
      await authService.changePassword(
        req.userId,
        validationResult.data.currentPassword,
        validationResult.data.newPassword
      );

      return success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  },
};

export default authController;