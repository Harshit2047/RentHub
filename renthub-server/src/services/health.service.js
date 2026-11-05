import { env } from '../config/env.js';

/**
 * Health check service.
 * Returns runtime information about the server.
 * Business logic lives here, not in the controller.
 */
export const getHealthStatus = () => {
  return {
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  };
};

