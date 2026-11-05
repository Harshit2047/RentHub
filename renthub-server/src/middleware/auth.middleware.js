import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/// Authentication middleware: verifies JWT token and attaches user to request
export const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: No token provided',
      });
    }

    const token = authorization.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid token format',
      });
    }

    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email || '',
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid token',
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Token expired',
      });
    }

    next(err);
  }
};

/// Authorization middleware: restricts access based on user role
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No role information',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Requires one of ${allowedRoles.join(', ')} role`,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
