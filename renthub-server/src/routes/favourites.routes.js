import { Router } from 'express';
import {
  toggleFavourite,
  getUserFavourites,
  getFavouriteStatus,
} from '../controllers/favourite.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All favourite endpoints require an authenticated user.
router.use(authMiddleware);

// GET /api/favourites/is-favourite/:apartmentId - Is this apartment favourited?
router.get('/is-favourite/:apartmentId', getFavouriteStatus);

// POST /api/favourites/:apartmentId - Toggle favourite
router.post('/:apartmentId', toggleFavourite);

// GET /api/favourites - Get user's favourite apartments
router.get('/', getUserFavourites);

export default router;
