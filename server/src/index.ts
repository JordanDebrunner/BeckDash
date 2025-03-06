import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis'; // Correct import
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
});

// Connect to databases
async function connectDatabases() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check route
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Start server
async function startServer() {
  try {
    await connectDatabases();
    console.log("Applying Prisma migrations...");
    const { exec } = require('child_process');
    exec('npx prisma migrate dev --name init', (err, stdout, stderr) => {
      if (err) console.error("Migration failed:", stderr);
      else console.log("Migration output:", stdout);
    });
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Cleanup on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});