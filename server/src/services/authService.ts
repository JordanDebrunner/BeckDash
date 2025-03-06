/**
 * Authentication service
 *
 * Handles user registration, login, token management, and password reset
 */

import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwtUtils';
import { AppError } from '../middleware/errorHandler';
import redisClient from '../config/redis';
import logger from '../utils/logger';

// Interface for registration data
interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Interface for login data
interface LoginData {
  email: string;
  password: string;
}

// Interface for token response
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Authentication service methods
export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<{ user: User; tokens: TokenResponse }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Check if user exists
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      tokens,
    };
  },

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(userId: string, email: string): Promise<TokenResponse> {
    const payload: TokenPayload = { userId, email };

    // Generate tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in Redis with user ID as reference
    const redisKey = `refresh_token:${refreshToken}`;
    await redisClient.set(redisKey, userId, {
      EX: 60 * 60 * 24 * 7, // 7 days (match refresh token expiry)
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse | null> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    // Check if token is in Redis (not revoked)
    const redisKey = `refresh_token:${refreshToken}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId || storedUserId !== decoded.userId) {
      logger.warn(`Invalid refresh token for user ${decoded.userId}`);
      return null;
    }

    // Find user to verify they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      logger.warn(`User not found for refresh token: ${decoded.userId}`);
      return null;
    }

    // Delete old refresh token
    await redisClient.del(redisKey);

    // Generate new tokens
    return this.generateTokens(user.id, user.email);
  },

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<boolean> {
    // Delete refresh token from Redis
    const redisKey = `refresh_token:${refreshToken}`;
    const result = await redisClient.del(redisKey);

    // Return true if token was deleted, false if it didn't exist
    return result > 0;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // Prevent updating sensitive fields
    const { id, password, email, createdAt, updatedAt, ...updateData } = data;

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  },
};

export default authService;