/**
 * File Upload Routes
 * 
 * Routes for handling file uploads
 */

import express from 'express';
import fileUploadController from '../controllers/fileUpload.controller';
import fileUploadService from '../services/fileUpload.service';
import { simpleAuthenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Upload profile image
router.post(
  '/profile-image',
  simpleAuthenticate,
  fileUploadService.upload.single('profileImage'),
  fileUploadController.uploadProfileImage
);

// Delete profile image
router.delete(
  '/profile-image',
  simpleAuthenticate,
  fileUploadController.deleteProfileImage
);

export default router; 