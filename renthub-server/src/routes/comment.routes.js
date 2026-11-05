import { Router } from 'express';
import {
  getApartmentComments,
  createComment,
  createReply,
  editComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/comments/:apartmentId - Get comments for an apartment (public)
router.get('/:apartmentId', getApartmentComments);

// Protected routes (require user login)
router.post('/:apartmentId', authMiddleware, createComment);
router.post('/:commentId/replies', authMiddleware, createReply);
router.put('/:commentId', authMiddleware, editComment);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
