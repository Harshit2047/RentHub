import {
  createApartment as createApartmentService,
  getApartments as getApartmentsService,
  getApartmentById as getApartmentByIdService,
  updateApartment as updateApartmentService,
  deleteApartment as deleteApartmentService,
  getMyListings as getMyListingsService,
  uploadApartmentImages as uploadApartmentImagesService,
  deleteApartmentImage as deleteApartmentImageService,
} from '../services/apartment.service.js';

/// @route POST /api/apartments
export const createApartment = async function (req, res, next) {
  try {
    await createApartmentService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/// @route GET /api/apartments
export const getApartments = async function (req, res, next) {
  try {
    await getApartmentsService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/// @route GET /api/apartments/:id
export const getApartmentById = async function (req, res, next) {
  try {
    await getApartmentByIdService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/// @route PUT /api/apartments/:id
export const updateApartment = async function (req, res, next) {
  try {
    await updateApartmentService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/// @route DELETE /api/apartments/:id
export const deleteApartment = async function (req, res, next) {
  try {
    await deleteApartmentService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/// @route GET /api/apartments/my-listings
export const getMyListings = async function (req, res, next) {
  try {
    await getMyListingsService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/apartments/:id/upload-images
 * @description Upload images for an apartment (landlord only)
 * @param {string} req.params.id - Apartment ID
 * @param {Array} req.files - Uploaded files (Multer)
 * @returns {Object} Upload results
 */
export const uploadApartmentImages = async function (req, res, next) {
  try {
    await uploadApartmentImagesService(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/apartments/:id/images/:imageIndex
 * @description Delete an apartment image (landlord only)
 * @param {string} req.params.id - Apartment ID
 * @param {number} req.params.imageIndex - Image index to delete
 * @returns {Object} Deletion result
 */
export const deleteApartmentImage = async function (req, res, next) {
  try {
    await deleteApartmentImageService(req, res, next);
  } catch (error) {
    next(error);
  }
};
