import { prisma } from '../database/prismaClient.js';
import { cloudinary } from '../config/cloudinary.js';
import { deleteCloudinaryImage } from '../middleware/upload.js';
import { apartmentSchema, apartmentIdSchema, apartmentsQuerySchema } from '../validators/apartment.validator.js';
import { sendSuccess, sendError } from '../utils/response.js';

const LANDLORD_SELECT = {
  id: true,
  companyName: true,
  user: { select: { fullName: true } },
};

/** Find (or create) the Landlord profile belonging to a user. */
const resolveLandlord = async (userId) => {
  let landlord = await prisma.landlord.findUnique({ where: { userId } });
  if (!landlord) {
    landlord = await prisma.landlord.create({ data: { userId } });
  }
  return landlord;
};

/**
 * Persist uploaded images for an apartment.
 * Prefers Cloudinary results when available, otherwise falls back to local disk
 * so the app still works before Cloudinary credentials are configured.
 */
const attachImages = async (apartmentId, files, startIndex = 0, cloudinaryResults = []) => {
  if (cloudinaryResults && cloudinaryResults.length > 0) {
    await prisma.apartmentImage.createMany({
      data: cloudinaryResults.map((result, index) => ({
        apartmentId,
        url: result.url,
        publicId: result.publicId ?? null,
        orderIndex: startIndex + index,
      })),
    });
    return;
  }

  if (!files || files.length === 0) return;
  const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
  await prisma.apartmentImage.createMany({
    data: files.map((file, index) => ({
      apartmentId,
      url: `${baseUrl}/uploads/${file.filename}`,
      orderIndex: startIndex + index,
    })),
  });
};

/** Attach comma-separated amenity names to an apartment. */
const attachAmenities = async (apartmentId, rawAmenities) => {
  if (!rawAmenities) return;
  const names = String(rawAmenities)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 5);

  for (const name of names) {
    let amenity = await prisma.amenity.findUnique({ where: { name } });
    if (!amenity) {
      amenity = await prisma.amenity.create({ data: { name } });
    }
    await prisma.apartmentAmenity
      .create({ data: { apartmentId, amenityId: amenity.id } })
      .catch(() => {
        // Ignore duplicate (apartmentId, amenityId) pairs
      });
  }
};

/**
 * Create a new apartment listing.
 * Only authenticated landlords can create apartments.
 */
export const createApartment = async function (req, res, next) {
  try {
    // Validate request body
    const result = apartmentSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 'Validation failed', 400, result.error.format());
    }

    const { amenities, ...data } = result.data;

    // Check if user is authenticated and is a landlord
    if (!req.user || req.user.role !== 'LANDLORD') {
      return sendError(res, 'Forbidden: Only landlords can create apartments', 403);
    }

    // Find or create landlord profile for this user
    const landlord = await resolveLandlord(req.user.userId);

    // Create the apartment
    const apartment = await prisma.apartment.create({
      data: {
        ...data,
        landlordId: landlord.id,
      },
      include: {
        landlord: { select: LANDLORD_SELECT },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    await attachAmenities(apartment.id, amenities);
    await attachImages(apartment.id, req.files, 0, req.cloudinaryResults);

    const created = await prisma.apartment.findUnique({
      where: { id: apartment.id },
      include: {
        landlord: { select: LANDLORD_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return sendSuccess(res, created, 'Apartment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available apartments with pagination, filtering and sorting.
 */
export const getApartments = async function (req, res, next) {
  try {
    // Query validation
    const result = apartmentsQuerySchema.safeParse({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      city: req.query.city,
      minRent: req.query.minRent,
      maxRent: req.query.maxRent,
      bedrooms: req.query.bedrooms,
      bathrooms: req.query.bathrooms,
      furnished: req.query.furnished,
      availability: req.query.availability,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });

    if (!result.success) {
      return sendError(res, 'Validation failed', 400, result.error.format());
    }

    const {
      page,
      limit,
      search,
      city,
      minRent,
      maxRent,
      bedrooms,
      bathrooms,
      furnished,
      availability,
      sortBy,
      sortOrder,
    } = result.data;

    // Build where condition for filtering
    const where = {
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(availability && { availability }),
      ...(minRent !== undefined && maxRent !== undefined && {
        monthlyRent: { gte: minRent, lte: maxRent },
      }),
      ...(minRent !== undefined && maxRent === undefined && {
        monthlyRent: { gte: minRent },
      }),
      ...(maxRent !== undefined && minRent === undefined && {
        monthlyRent: { lte: maxRent },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(bedrooms && { bedrooms }),
      ...(bathrooms && { bathrooms }),
      ...(furnished && { furnished }),
    };

    // Count total documents for pagination
    const total = await prisma.apartment.count({ where });

    // Build orderBy
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Fetch apartments with pagination
    const apartments = await prisma.apartment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return sendSuccess(res, {
      apartments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single apartment by ID.
 */
export const getApartmentById = async function (req, res, next) {
  try {
    // Validate ID
    const result = apartmentIdSchema.safeParse({ apartmentId: req.params.id });
    if (!result.success) {
      return sendError(res, 'Invalid apartment ID', 400, result.error.format());
    }

    const { apartmentId } = result.data;

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    if (!apartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    return sendSuccess(res, apartment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an apartment listing.
 * Only the landlord who owns the listing can update it.
 */
export const updateApartment = async function (req, res, next) {
  try {
    // Validate ID
    const idResult = apartmentIdSchema.safeParse({ apartmentId: req.params.id });
    if (!idResult.success) {
      return sendError(res, 'Invalid apartment ID', 400, idResult.error.format());
    }

    const { apartmentId } = idResult.data;

    // Validate request body (partial update)
    const bodyResult = apartmentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return sendError(res, 'Validation failed', 400, bodyResult.error.format());
    }

    const { amenities, ...data } = bodyResult.data;

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!existingApartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check authorization: only the landlord who owns this apartment can update it
    const landlord = await resolveLandlord(req.user.userId);
    if (existingApartment.landlordId !== landlord.id) {
      return sendError(res, 'Forbidden: You can only update your own apartments', 403);
    }

    // Update the apartment
    const apartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data,
      include: {
        landlord: { select: LANDLORD_SELECT },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    await attachImages(apartment.id, req.files, apartment.images.length, req.cloudinaryResults);

    const updated = await prisma.apartment.findUnique({
      where: { id: apartment.id },
      include: {
        landlord: { select: LANDLORD_SELECT },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return sendSuccess(res, updated, 'Apartment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an apartment listing.
 * Only the landlord who owns the listing can delete it.
 */
export const deleteApartment = async function (req, res, next) {
  try {
    // Validate ID
    const idResult = apartmentIdSchema.safeParse({ apartmentId: req.params.id });
    if (!idResult.success) {
      return sendError(res, 'Invalid apartment ID', 400, idResult.error.format());
    }

    const { apartmentId } = idResult.data;

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!existingApartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check authorization: only the landlord who owns this apartment can delete it
    const landlord = await resolveLandlord(req.user.userId);
    if (existingApartment.landlordId !== landlord.id) {
      return sendError(res, 'Forbidden: You can only delete your own apartments', 403);
    }

    // Remove any Cloudinary assets before the cascade deletes the DB rows
    const images = await prisma.apartmentImage.findMany({
      where: { apartmentId },
      select: { publicId: true },
    });
    await Promise.allSettled(images.map((image) => deleteCloudinaryImage(image.publicId)));

    // Delete the apartment (cascade will handle images, amenities, etc.)
    await prisma.apartment.delete({
      where: { id: apartmentId },
    });

    return sendSuccess(res, null, 'Apartment deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get apartments created by the logged-in landlord.
 */
export const getMyListings = async function (req, res, next) {
  try {
    // Check if user is a landlord
    if (!req.user || req.user.role !== 'LANDLORD') {
      return sendError(res, 'Forbidden: Only landlords can view their listings', 403);
    }

    // Fetch all apartments owned by this landlord
    const landlord = await resolveLandlord(req.user.userId);
    const apartments = await prisma.apartment.findMany({
      where: { landlordId: landlord.id },
      include: {
        landlord: { select: LANDLORD_SELECT },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, apartments);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload images for an apartment.
 * Only the landlord who owns the apartment can upload images.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const uploadApartmentImages = async function (req, res, next) {
  try {
    // Check if user is a landlord
    if (!req.user || req.user.role !== 'LANDLORD') {
      return sendError(res, 'Forbidden: Only landlords can upload images', 403);
    }

    // Validate apartment ID
    const idResult = apartmentIdSchema.safeParse({ apartmentId: req.params.id });
    if (!idResult.success) {
      return sendError(res, 'Invalid apartment ID', 400, idResult.error.format());
    }

    const { apartmentId } = idResult.data;

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        landlord: { select: { id: true } },
        images: true,
      },
    });

    if (!existingApartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check authorization: only the landlord who owns this apartment can upload images
    const landlord = await resolveLandlord(req.user.userId);
    if (existingApartment.landlordId !== landlord.id) {
      return sendError(res, 'Forbidden: You can only upload images to your own apartments', 403);
    }

    // Handle single or multiple file upload via Multer
    if (!req.files || req.files.length === 0) {
      // If no Multer files but we have a single Cloudinary result
      if (req.cloudinaryResult) {
        const image = await prisma.apartmentImage.create({
          data: {
            apartmentId,
            url: req.cloudinaryResult.url,
            publicId: req.cloudinaryResult.publicId,
            orderIndex: existingApartment.images.length,
          },
        });
        return sendSuccess(res, image, 'Image uploaded successfully');
      }
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Upload multiple images to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'renthub/apartments',
        use_filename: true,
        unique_filename: false,
        resource_type: 'image',
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    // Collect successful uploads
    const successfulUploads = [];
    const failedFiles = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const uploadResult = result.value;
        successfulUploads.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          orderIndex: existingApartment.images.length + index,
        });
      } else {
        failedFiles.push(req.files[index] ? req.files[index].originalname : 'unknown');
      }
    });

    // Clean up all local files
    import('fs').then(fs => {
      try {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    // Create image records in database for successful uploads
    const createdImages = [];
    for (let i = 0; i < successfulUploads.length; i++) {
      const image = await prisma.apartmentImage.create({
        data: {
          apartmentId,
          url: successfulUploads[i].url,
          publicId: successfulUploads[i].publicId,
          orderIndex: existingApartment.images.length + i,
        },
      });
      createdImages.push(image);
    }

    return sendSuccess(res, {
      images: createdImages,
      successfulUploads: successfulUploads.length,
      failedUploads: failedFiles.length,
      message: `${successfulUploads.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    // Clean up local files on error
    import('fs').then(fs => {
      try {
        if (req.files) {
          req.files.forEach((file) => {
            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              // Ignore cleanup errors
            }
          });
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    next(error);
  }
};

/**
 * Delete an apartment image.
 * Only the landlord who owns the apartment can delete its images.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const deleteApartmentImage = async function (req, res, next) {
  try {
    // Validate apartment ID
    const idResult = apartmentIdSchema.safeParse({ apartmentId: req.params.id });
    if (!idResult.success) {
      return sendError(res, 'Invalid apartment ID', 400, idResult.error.format());
    }

    const { apartmentId } = idResult.data;

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        landlord: { select: { id: true } },
        images: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!existingApartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check authorization: only the landlord who owns this apartment can delete images
    const landlord = await resolveLandlord(req.user.userId);
    if (existingApartment.landlordId !== landlord.id) {
      return sendError(res, 'Forbidden: You can only delete images from your own apartments', 403);
    }

    // Get the image index from request params
    const imageIndex = parseInt(req.params.imageIndex) || 0;
    const imageToDelete = existingApartment.images[imageIndex];

    if (!imageToDelete) {
      return sendError(res, 'Image not found', 404);
    }

    // Delete from Cloudinary first
    const cloudinaryDeleted = await deleteCloudinaryImage(imageToDelete.publicId);

    // Delete from database
    await prisma.apartmentImage.delete({
      where: { id: imageToDelete.id },
    });

    return sendSuccess(res, {
      cloudinaryDeleted,
      imageId: imageToDelete.id,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};