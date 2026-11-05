/**
 * Centralised environment variable access.
 * All process.env reads in the application should come through this module,
 * so there is a single place to validate and document required variables.
 */

/**
 * CLIENT_URL may contain a comma-separated list of allowed origins, e.g.
 *   CLIENT_URL=http://localhost:4200,http://localhost:5173
 * The first entry is treated as the primary client URL.
 */
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:4200')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  // Will be populated in later phases:
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  CLIENT_URL: clientUrls[0] || 'http://localhost:4200',
  CLIENT_URLS: clientUrls,
};

