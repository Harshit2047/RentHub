import { Router } from 'express';
import {
  createApartment,
  getApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
  getMyListings,
  uploadApartmentImages,
  deleteApartmentImage,
} from '../controllers/apartment.controller.js';
import { upload, uploadMultipleImages } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Apartment CRUD routes

// Create apartment (landlord only, checked in service); accepts multipart images
router.post(
  '/',
  authMiddleware,
  upload.array('images', 10),
  uploadMultipleImages,
  createApartment
);

// Public listing endpoints
router.get('/', getApartments);

// Landlord's own listings (must be declared before '/:id')
router.get('/my-listings', authMiddleware, getMyListings);

router.get('/:id', getApartmentById); // Get apartment by ID

// Protected routes: require authentication
router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 10),
  uploadMultipleImages,
  updateApartment
);
router.delete('/:id', authMiddleware, deleteApartment); // Delete apartment (owner only)

// Image upload and management routes
router.post(
  '/:id/upload-images',
  authMiddleware,
  upload.single('image'),
  uploadApartmentImages
); // Upload single image
router.post(
  '/:id/upload-images-multi',
  authMiddleware,
  upload.array('images', 10),
  uploadApartmentImages
); // Upload multiple images (max 10)

router.delete(
  '/:id/images/:imageIndex',
  authMiddleware,
  deleteApartmentImage
); // Delete apartment image by index

export default router;
