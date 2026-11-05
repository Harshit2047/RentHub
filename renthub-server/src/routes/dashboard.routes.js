import { Router } from 'express';
import {
  getTenantDashboard,
  getLandlordDashboard,
} from '../controllers/dashboard.controller.js';

const router = Router();

// GET /api/dashboard/tenant - Tenant dashboard data
router.get('/tenant', getTenantDashboard);

// GET /api/dashboard/landlord - Landlord dashboard data
router.get('/landlord', getLandlordDashboard);

export default router;
