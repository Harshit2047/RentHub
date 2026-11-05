import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
// Allowed origins include localhost, rent-hub-tawny.vercel.app, and any Vercel
// deployment domain to ensure production and preview environments work seamlessly.
const isLocalhostOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    return (
      (protocol === 'http:' || protocol === 'https:') &&
      ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
    );
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  // No Origin header: curl, Postman, server-to-server, health checks.
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, '');

  // Check explicit allowed origins from env.CLIENT_URLS
  if (env.CLIENT_URLS.some((u) => u.replace(/\/+$/, '') === normalized)) {
    return true;
  }

  // Allow all Vercel domains (e.g. rent-hub-tawny.vercel.app and preview deployments)
  try {
    const { hostname } = new URL(normalized);
    if (hostname === 'rent-hub-tawny.vercel.app' || hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    // Ignore URL parse error
  }

  // Allow localhost origins in development
  return env.NODE_ENV !== 'production' && isLocalhostOrigin(normalized);
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS as the very first middleware
app.use(cors(corsOptions));

// API responses are dynamic — never let the browser serve a stale 304 cache.
app.set('etag', false);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static uploads (local development fallback for Cloudinary) ───────────────
app.use('/uploads', express.static('uploads'));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 — must come after all routes ────────────────────────────────────────
app.use(notFoundHandler);

// ─── Centralised error handler — must be last ─────────────────────────────────
app.use(errorHandler);

export default app;
