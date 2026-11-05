import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// ─── Bulletproof Universal CORS Middleware ────────────────────────────────────
// Dynamically reflect any requesting origin (including all Vercel domains,
// preview branch URLs, and localhost) and immediately handle preflight OPTIONS.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  }

  // Immediately respond to preflight OPTIONS requests with 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Also wire standard cors package with origin reflection as safety net
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
  })
);

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
