/**
 * File Upload Controller
 * 
 * Handles HTTP requests related to file uploads
 */

import { Request, Response, NextFunction } from 'express';
import { success, badRequest } from '../utils/responseFormatter';
import fileUploadService from '../services/fileUpload.service';
import { RequestWithUser } from '../types/RequestWithUser';
import authService from '../services/authService';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

export const fileUploadController = {
  /**
   * Upload profile image
   */
  async uploadProfileImage(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      logger.debug('Processing profile image upload request');
      
      // Check if file exists in request
      if (!req.file) {
        logger.error('No file in request');
        return badRequest(res, 'No file uploaded');
      }
      
      logger.debug(`File uploaded: ${req.file.filename}`);

      // Get user ID from authenticated request
      const userId = req.userId;
      if (!userId) {
        logger.error('No user ID in request');
        return badRequest(res, 'User not authenticated');
      }
      
      logger.debug(`User ID: ${userId}`);

      // Generate URL for the uploaded file
      const fileUrl = fileUploadService.getFileUrl(req.file.filename);
      logger.debug(`Generated file URL: ${fileUrl}`);
      
      // For development mode, use a simpler approach
      if (process.env.NODE_ENV === 'development' || userId === 'dev-user-id') {
        logger.debug('Development mode detected, using simplified approach');
        
        // Generate URL for the uploaded file
        const fileUrl = fileUploadService.getFileUrl(req.file.filename);
        logger.debug(`Generated file URL: ${fileUrl}`);
        
        // Make sure the URL is properly formatted
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || req.protocol + '://' + req.get('host')
          : '';
        const fullUrl = baseUrl + fileUrl;
        logger.debug(`Full URL: ${fullUrl}`);
        
        // Store the profile image URL in a global variable for persistence
        global.userProfileImageUrl = fileUrl;
        logger.debug(`Stored profile image URL in global variable: ${global.userProfileImageUrl}`);
        
        // Return a successful response with dummy data
        return success(res, { 
          user: {
            id: 'dev-user-id',
            email: 'dev@example.com',
            firstName: 'Dev',
            lastName: 'User',
            profileImageUrl: fileUrl, // Use the relative URL here
            theme: global.userTheme || 'light',
            notificationsEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          imageUrl: fileUrl // Use the relative URL here
        }, 'Profile image uploaded successfully');
      }

      // Production code path
      // Get current user to check if they have an existing profile image
      const user = await authService.getUserById(userId);
      if (!user) {
        return badRequest(res, 'User not found');
      }

      // If user has an existing profile image, delete it
      if (user.profileImageUrl) {
        try {
          // Extract filename from URL
          const filename = path.basename(user.profileImageUrl);
          const filePath = fileUploadService.getFilePath(filename);
          
          // Delete the file
          await fileUploadService.deleteFile(filePath);
        } catch (error) {
          // Log error but continue
          logger.error('Error deleting previous profile image', error);
        }
      }

      // Update user profile with new image URL
      const updatedUser = await authService.updateProfile(userId, {
        profileImageUrl: fileUrl
      });

      return success(res, { 
        user: updatedUser,
        imageUrl: fileUrl 
      }, 'Profile image uploaded successfully');
    } catch (error) {
      logger.error('Error in uploadProfileImage:', error);
      next(error);
    }
  },

  /**
   * Delete profile image
   */
  async deleteProfileImage(req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      logger.debug('Processing profile image delete request');
      
      // Get user ID from authenticated request
      const userId = req.userId;
      if (!userId) {
        logger.error('No user ID in request');
        return badRequest(res, 'User not authenticated');
      }
      
      logger.debug(`User ID: ${userId}`);

      // For development mode, use a simpler approach
      if (process.env.NODE_ENV === 'development' || userId === 'dev-user-id') {
        logger.debug('Development mode detected, using simplified approach');
        
        // Return a successful response with dummy data
        return success(res, { 
          user: {
            id: 'dev-user-id',
            email: 'dev@example.com',
            firstName: 'Dev',
            lastName: 'User',
            profileImageUrl: null,
            theme: 'light',
            notificationsEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }, 'Profile image deleted successfully');
      }

      // Production code path
      // Get current user
      const user = await authService.getUserById(userId);
      if (!user) {
        return badRequest(res, 'User not found');
      }

      // If user has a profile image, delete it
      if (user.profileImageUrl) {
        try {
          // Extract filename from URL
          const filename = path.basename(user.profileImageUrl);
          const filePath = fileUploadService.getFilePath(filename);
          
          // Delete the file
          await fileUploadService.deleteFile(filePath);
        } catch (error) {
          // Log error but continue
          logger.error('Error deleting profile image', error);
        }
      }

      // Update user profile to remove image URL
      const updatedUser = await authService.updateProfile(userId, {
        profileImageUrl: null
      });

      return success(res, { user: updatedUser }, 'Profile image deleted successfully');
    } catch (error) {
      logger.error('Error in deleteProfileImage:', error);
      next(error);
    }
  }
};

export default fileUploadController; 