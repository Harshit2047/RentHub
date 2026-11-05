/**
 * Centralised environment variable access.
 * All process.env reads in the application should come through this module,
 * so there is a single place to validate and document required variables.
 */

/**
 * Default known origins that should always be allowed across development
 * and production (including the live Vercel frontend).
 */
const defaultOrigins = [
  'http://localhost:4200',
  'http://localhost:5173',
  'https://rent-hub-tawny.vercel.app',
];

/**
 * CLIENT_URL may contain a comma-separated list of allowed origins, e.g.
 *   CLIENT_URL=http://localhost:4200,https://rent-hub-tawny.vercel.app
 */
const envUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const clientUrls = Array.from(new Set([...defaultOrigins, ...envUrls]));

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  CLIENT_URL: clientUrls[0] || 'http://localhost:4200',
  CLIENT_URLS: clientUrls,
};
