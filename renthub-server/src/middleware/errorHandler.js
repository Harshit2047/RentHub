import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

/**
 * Centralised 404 handler.
 * Registered after all routes so it only fires when nothing else matched.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
export const notFoundHandler = (req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

/**
 * Centralised error handler.
 * Express recognises this as an error middleware because it has four parameters.
 * All next(err) calls and unhandled throws inside async routes land here.
 *
 * @param {Error}                      err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  // Log the full error in development; avoid leaking stack traces in production
  if (env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  sendError(res, message, statusCode, err.errors || null);
};

