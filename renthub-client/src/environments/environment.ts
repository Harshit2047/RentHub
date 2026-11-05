/**
 * Development environment configuration.
 * Automatically falls back to the production Render backend when accessed from
 * deployed domains (e.g., Vercel), while using localhost:3000 during local development.
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

export const environment = {
  production: false,
  apiUrl: isLocalhost ? 'http://localhost:3000/api' : 'https://renthub-ez74.onrender.com/api',
};
