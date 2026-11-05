import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { prisma } from '../database/prismaClient.js';
import { env } from '../config/env.js';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

/// Authentication middleware: verifies JWT token and attaches user to request
export const authMiddleware = async function (req, res, next) {
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

    // Attach user info to request - we need to fetch the user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: User not found',
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email || '',
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
}

/// Authorization middleware: restricts access based on user role
export const roleMiddleware = function (allowedRoles) {
  return async function (req, res, next) {
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
  }
}

/// @route POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { user, token } = await registerUser(req.body);

    // Send success response (exclude password from response)
    const { password: _password, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: userWithoutPassword, token },
    });
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }

    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: err.errors.map((e) => e.message).join(', '),
      });
    }

    next(err);
  }
}

/// @route POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { user, token } = await loginUser(req.body);

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: err.message,
      });
    }

    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: err.errors.map((e) => e.message).join(', '),
      });
    }

    next(err);
  }
}

/// @route GET /api/auth/me
export async function me(req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user context',
      });
    }

    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}