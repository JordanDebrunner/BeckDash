/**
 * Application Configuration
 *
 * Sets up Express application with middleware and routes
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import plantRoutes from './routes/plants.routes';
import recipeRoutes from './routes/recipes.routes';
import authRoutes from './routes/auth.routes';
import calendarRoutes from './routes/calendar.routes';
import fileUploadRoutes from './routes/fileUpload.routes';
import logger from './utils/logger';
import { serverError } from './utils/responseFormatter';
import fs from 'fs';

// Create Express app
const app = express();

// Apply middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'Access-Control-Allow-Origin']
}));
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false // Allow loading resources from different origins
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join('/app/uploads');
logger.debug(`Uploads directory: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info(`Created uploads directory: ${uploadsDir}`);
}

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));
logger.info(`Serving static files from: ${uploadsDir} with CORS headers`);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plants', plantRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/files', fileUploadRoutes);

// 404 handler for API routes
app.use('/api/v1/*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log the error with detailed information
  logger.error('Server error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Handle SyntaxError (e.g., invalid JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle other types of errors
  return serverError(res, 'Internal Server Error');
});

export default app;
