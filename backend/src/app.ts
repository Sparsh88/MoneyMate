import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import zlib from 'zlib';
import { errorHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import goalRoutes from './routes/goalRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Enable strong ETags for HTTP 304 Not Modified caching
app.set('etag', 'strong');

// Trust Proxy for Render / Heroku / Vercel reverse proxies
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Native high-performance gzip compression middleware (> 1KB payload compression)
app.use((req, res, next) => {
  const acceptEncoding = (req.headers['accept-encoding'] as string) || '';
  if (!acceptEncoding.includes('gzip') || req.method === 'HEAD') {
    return next();
  }

  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    if (res.headersSent) return originalSend(body);

    const payload = typeof body === 'string' ? body : Buffer.isBuffer(body) ? body : JSON.stringify(body);
    const byteLength = Buffer.byteLength(payload);

    if (byteLength > 1024) {
      zlib.gzip(Buffer.from(payload), (err, compressed) => {
        if (!err && compressed) {
          res.setHeader('Content-Encoding', 'gzip');
          if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', typeof body === 'object' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8');
          }
          res.removeHeader('Content-Length');
          return originalSend(compressed);
        }
        return originalSend(body);
      });
      return res;
    }
    return originalSend(body);
  };
  next();
});


// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://money-mate-omega.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, health checks)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsers & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Anti MongoDB Query Injection
app.use(mongoSanitize());

// Health Check Endpoints for Render / Uptime Monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'MoneyMate Backend API is healthy' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'MoneyMate Backend API is healthy' });
});

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'MoneyMate API Operational' });
});

// Global Rate Limiting on API routes
app.use('/api', apiLimiter);

// API Routing Setup
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Fallback Route Handler
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
