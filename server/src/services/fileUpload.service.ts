/**
 * File Upload Service
 * 
 * Handles file uploads for profile images
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Ensure upload directory exists
const uploadDir = path.resolve('/app/uploads/profiles');
logger.debug(`Upload directory path: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created upload directory: ${uploadDir}`);
  } catch (error) {
    logger.error(`Failed to create upload directory: ${error}`);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.debug(`Storing file in: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `profile-${uniqueSuffix}${ext}`;
    logger.debug(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// File filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400) as any);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Function to delete a file
const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve(); // File doesn't exist, nothing to delete
    }
  });
};

// Function to get the full path of a file
const getFilePath = (filename: string): string => {
  return path.join(uploadDir, filename);
};

// Function to get the public URL of a file
const getFileUrl = (filename: string): string => {
  return `/uploads/profiles/${filename}`;
};

export default {
  upload,
  deleteFile,
  getFilePath,
  getFileUrl,
  uploadDir,
}; 