import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import apartmentRouter from './apartments.routes.js';
import favouriteRouter from './favourites.routes.js';
import commentRouter from './comment.routes.js';
import inquiryRouter from './inquiry.routes.js';
import dashboardRouter from './dashboard.routes.js';

const router = Router();

/**
 * API route aggregator.
 * Mount all feature routers here. The /api prefix is applied in app.js.
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/apartments', apartmentRouter);
router.use('/favourites', favouriteRouter);
router.use('/comments', commentRouter);
router.use('/inquiries', inquiryRouter);
router.use('/dashboard', dashboardRouter);

export default router;