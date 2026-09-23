import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/error';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import telemetryRoutes from './routes/telemetryRoutes';
import { autoSeedIfEmpty } from './scripts/seed';

// Prevent any external third-party SDK or stream error from crashing the server
process.on('unhandledRejection', (reason: any) => {
  console.warn('⚠️ Process intercepted unhandledRejection (server remains stable):', reason?.message || reason);
});

process.on('uncaughtException', (error: any) => {
  console.error('⚠️ Process intercepted uncaughtException (server remains stable):', error?.message || error);
});

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === config.CLIENT_URL ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('organiva')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Ensure database connection on Vercel serverless invocations
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('Vercel DB connection check:', err);
    }
  }
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Organiva E-Commerce Backend API',
    status: 'online',
    tagline: 'Smart products. Simpler living.',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      shippingRule: '/api/orders/shipping-rule',
      aiChat: '/api/ai/chat',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Organiva Backend API',
    tagline: 'Smart products. Simpler living.',
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel-serverless' : config.NODE_ENV,
  });
});

import rateLimit from 'express-rate-limit';

// Security Rate Limiters
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests to AI concierge. Please try again shortly.' },
});

const checkoutRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Order submission rate limit reached. Please wait a moment.' },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// API Mounts with Rate Limiting
app.use('/api/auth/login', authRateLimiter);
app.use('/api/orders/checkout', checkoutRateLimiter);
app.use('/api/ai', aiRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌿 ORGANIVA E-COMMERCE BACKEND RUNNING ON PORT ${PORT}`);
      console.log(`🚀 Mode: ${config.NODE_ENV}`);
      console.log(`📦 Health: http://localhost:${PORT}/api/health`);
      console.log(`✨ AI Concierge: http://localhost:${PORT}/api/ai/chat`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to boot Organiva backend:', error);
    process.exit(1);
  }
};

// Only listen directly on a port in non-serverless environments
if (!process.env.VERCEL) {
  startServer();
}

export default app;
