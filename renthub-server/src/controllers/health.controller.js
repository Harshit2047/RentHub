import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * GET /api/health
 * Returns server health status.
 * Controller is responsible only for HTTP request / response handling.
 */
export const healthCheck = async (_req, res, next) => {
  try {
    const data = getHealthStatus();
    sendSuccess(res, data, 'RentHub API is running');
  } catch (err) {
    next(err);
  }
};

