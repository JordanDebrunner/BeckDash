/**
 * Authentication routes
 *
 * Routes for user registration, login, logout, and token refresh
 */

import { Router } from 'express';
import authController from '../controllers/authController';
import { simpleAuthenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profileImageUrl: z.string().optional().nullable(),
    theme: z.string().optional(),
    notificationsEnabled: z.boolean().optional(),
  }),
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', simpleAuthenticate, authController.getProfile);
router.put('/profile', simpleAuthenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', simpleAuthenticate, validate(changePasswordSchema), authController.changePassword);

export default router;