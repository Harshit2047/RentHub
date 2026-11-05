import { Router } from 'express';
import {
  register,
  login,
  me,
  authMiddleware,
  roleMiddleware,
} from '../controllers/auth.controller.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route: requires valid JWT
router.get('/me', authMiddleware, me);

// Role-based authorization
router.use('/landlord', roleMiddleware(['LANDLORD']));
router.use('/tenant', roleMiddleware(['TENANT']));

export default router;