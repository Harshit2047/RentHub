import { prisma } from '../database/prismaClient.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * POST /api/apartments/:apartmentId/favourites
 * Toggle favourite status for an apartment.
 * Only authenticated users can favourite apartments.
 * Prevents duplicate favourites.
 */
export const toggleFavourite = async function (req, res, next) {
  try {
    const { apartmentId } = req.params;

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthorized: No user context', 401);
    }

    const userId = req.user.userId;

    // Check if already favourited
    const existingFavourite = await prisma.favourite.findUnique({
      where: {
        userId_apartmentId: {
          userId,
          apartmentId,
        },
      },
    });

    if (existingFavourite) {
      // Remove favourite
      await prisma.favourite.delete({
        where: {
          userId_apartmentId: {
            userId,
            apartmentId,
          },
        },
      });
      return sendSuccess(res, {
        isFavourite: false,
        message: 'Removed from favourites',
      });
    } else {
      // Add favourite
      const favourite = await prisma.favourite.create({
        data: {
          userId,
          apartmentId,
        },
      });
      return sendSuccess(res, {
        isFavourite: true,
        favourite,
        message: 'Added to favourites',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favourites/is-favourite/:apartmentId
 * Return whether the current user has favourited the given apartment.
 */
export const getFavouriteStatus = async function (req, res, next) {
  try {
    const { apartmentId } = req.params;
    const userId = req.user.userId;

    const favourite = await prisma.favourite.findUnique({
      where: {
        userId_apartmentId: { userId, apartmentId },
      },
    });

    return sendSuccess(res, { isFavourite: !!favourite });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favourites
 * Get user's favourite apartments.
 * Only authenticated users can view their favourites.
 */
export const getUserFavourites = async function (req, res, next) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthorized: No user context', 401);
    }

    const userId = req.user.userId;

    const favourites = await prisma.favourite.findMany({
      where: { userId },
      include: {
        apartment: {
          include: {
            landlord: {
              select: {
                id: true,
                companyName: true,
                user: {
                  select: { fullName: true },
                },
              },
            },
            images: {
              orderBy: { orderIndex: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        apartment: {
          createdAt: 'desc',
        },
      },
    });

    return sendSuccess(res, favourites);
  } catch (error) {
    next(error);
  }
};