import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
} from '../controllers/inquiry.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All inquiry routes require user authentication
router.use(authMiddleware);

// POST /api/inquiries/:apartmentId - Tenant sends inquiry / booking request
router.post('/:apartmentId', createInquiry);

// GET /api/inquiries - Get inquiries (landlord: their apartments, tenant: their submissions)
router.get('/', getInquiries);

// GET /api/inquiries/:id - Inquiry details view
router.get('/:id', getInquiryById);

// PATCH /api/inquiries/:id/status - Landlord updates inquiry status (accepted, rejected, pending)
router.patch('/:id/status', updateInquiryStatus);
router.put('/:id/status', updateInquiryStatus);

export default router;
