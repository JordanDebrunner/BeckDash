/**
 * Authentication controller
 *
 * Handles HTTP requests related to authentication
 */

import { Response, NextFunction } from 'express';
import { success, unauthorized, badRequest, created, serverError } from '../utils/responseFormatter';
import { RequestWithUser } from '../types/request.types';
import logger from '../utils/logger';

// Add this at the top of the file, after the imports
declare global {
  var userTheme: string | undefined;
  var userProfileImageUrl: string | undefined;
}

// Authentication controller methods
const authController = {
  /**
   * Register a new user
   */
  async register(req: RequestWithUser, res: Response): Promise<Response> {
    const userData = req.body;
    
    // For development, just return a successful response with dummy data
    return created(res, {
      user: {
        id: 'dev-user-id',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || null,
        profileImageUrl: null,
        theme: 'light',
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      tokens: {
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token'
      }
    }, 'User registered successfully');
  },

  /**
   * Login a user
   */
  async login(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      // Log the entire request for debugging
      logger.info('Login request received:', {
        body: req.body,
        headers: req.headers,
        path: req.path,
        method: req.method
      });

      // Check if email and password are provided
      const { email, password } = req.body;
      
      if (!email || !password) {
        logger.warn('Login attempt missing email or password');
        return badRequest(res, 'Email and password are required');
      }
      
      // Log the login attempt
      logger.info('Login attempt:', { email, path: req.path });
      
      // For development, just return a successful response with dummy data
      return success(res, {
        user: {
          id: 'dev-user-id',
          email: email,
          firstName: 'Dev',
          lastName: 'User',
          profileImageUrl: null,
          theme: 'light',
          notificationsEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        accessToken: 'dummy-access-token',
        refreshToken: 'dummy-refresh-token'
      }, 'Login successful');
    } catch (error) {
      // Log the error with detailed information
      logger.error('Login error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      
      // Return a server error response
      return serverError(res, 'An error occurred during login');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(req: RequestWithUser, res: Response): Promise<Response> {
    // For development, just return a successful response with dummy data
    return success(res, {
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token'
    }, 'Token refreshed successfully');
  },

  /**
   * Logout a user
   */
  async logout(req: RequestWithUser, res: Response): Promise<Response> {
    // For development, just return a successful response
    return success(res, {}, 'Logout successful');
  },

  /**
   * Get user profile
   */
  async getProfile(req: RequestWithUser, res: Response): Promise<Response> {
    // For development, return a dummy user
    return success(res, {
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: global.userProfileImageUrl || null,
        theme: global.userTheme || 'light',
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, 'Profile retrieved successfully');
  },

  /**
   * Update user profile
   */
  async updateProfile(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const userData = req.body;
      
      // Log the incoming request data
      logger.debug('Updating profile with data:', userData);
      
      // Store the theme in a variable for persistence
      let currentTheme = 'light';
      
      // Check if we're updating the theme
      if (userData.theme) {
        logger.debug(`Updating theme to: ${userData.theme}`);
        currentTheme = userData.theme;
        
        // Store the theme in a global variable or file for persistence
        // This is a simple approach for development
        global.userTheme = userData.theme;
      } else if (global.userTheme) {
        // Use the stored theme if available
        currentTheme = global.userTheme;
      }
      
      // Check if we're updating the profile image URL
      if (userData.profileImageUrl) {
        logger.debug(`Updating profile image URL to: ${userData.profileImageUrl}`);
        
        // Store the profile image URL in a global variable for persistence
        global.userProfileImageUrl = userData.profileImageUrl;
      }
      
      // For development, return a response with the updated data
      return success(res, {
        user: {
          id: 'dev-user-id',
          email: 'dev@example.com',
          firstName: userData.firstName || 'Dev',
          lastName: userData.lastName || 'User',
          profileImageUrl: userData.profileImageUrl || global.userProfileImageUrl || null,
          theme: currentTheme,
          notificationsEnabled: userData.notificationsEnabled !== undefined ? userData.notificationsEnabled : true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }, 'Profile updated successfully');
    } catch (error) {
      logger.error('Error updating profile:', error);
      return serverError(res, 'Failed to update profile');
    }
  },

  /**
   * Change user password
   */
  async changePassword(req: RequestWithUser, res: Response): Promise<Response> {
    // For development, just return a successful response
    return success(res, {}, 'Password changed successfully');
  }
};

export default authController;