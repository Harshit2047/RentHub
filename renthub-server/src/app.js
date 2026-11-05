import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// API responses are dynamic — never let the browser serve a stale 304 cache.
app.set('etag', false);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ─── CORS ───────────────────────────────────────────────────────────────────
// Allowed origins come from CLIENT_URL (comma-separated). In development we
// also accept any localhost / 127.0.0.1 port, so Angular picking a random port
// (e.g. when 4200 is busy) never breaks logins. Production stays strict.
const isLocalhostOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    return (
      protocol === 'http:' &&
      ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
    );
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  // No Origin header: curl, Postman, server-to-server, same-origin requests.
  if (!origin) return true;
  if (env.CLIENT_URLS.includes(origin)) return true;
  return env.NODE_ENV !== 'production' && isLocalhostOrigin(origin);
};

app.use(
  cors({
    origin(origin, callback) {
      // callback(null, false) omits the CORS header; the browser then blocks it.
      callback(null, isAllowedOrigin(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

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