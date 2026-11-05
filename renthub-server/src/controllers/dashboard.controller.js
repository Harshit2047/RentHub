import { prisma } from '../database/prismaClient.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/dashboard/tenant
 * Tenant dashboard data:
 * - Total favourite apartments
 * - Total inquiries sent
 * - My favourite listings
 * - My submitted inquiries
 */
export const getTenantDashboard = async function (req, res, next) {
  try {
    // Check if user is authenticated and is a tenant
    if (!req.user || req.user.role !== 'TENANT') {
      return sendError(res, 'Forbidden: Tenant access required', 403);
    }

    const userId = req.user.userId;

    // Get total favourite apartments
    const totalFavourites = await prisma.favourite.count({
      where: { userId },
    });

    // Get my favourite listings with apartment details
    const favourites = await prisma.favourite.findMany({
      where: { userId },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            monthlyRent: true,
            images: {
              orderBy: { orderIndex: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    // Get total inquiries sent
    const totalInquiriesSent = await prisma.inquiry.count({
      where: { tenantId: userId },
    });

    // Get my submitted inquiries with apartment and landlord details
    const inquiriesSent = await prisma.inquiry.findMany({
      where: { tenantId: userId },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            monthlyRent: true,
          },
        },
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, {
      totalFavourites,
      totalInquiriesSent,
      favourites,
      inquiriesSent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/landlord
 * Landlord dashboard data:
 * - Total apartment listings
 * - Active listings
 * - Rented listings
 * - Total inquiries received
 * - Recently created listings
 * - Manage my apartments
 */
export const getLandlordDashboard = async function (req, res, next) {
  try {
    // Check if user is authenticated and is a landlord
    if (!req.user || req.user.role !== 'LANDLORD') {
      return sendError(res, 'Forbidden: Landlord access required', 403);
    }

    const userId = req.user.userId;

    // Get total apartment listings
    const totalListings = await prisma.apartment.count({
      where: { landlordId: userId },
    });

    // Get active listings (availability = AVAILABLE)
    const activeListings = await prisma.apartment.count({
      where: {
        landlordId: userId,
        availability: 'AVAILABLE',
      },
    });

    // Get rented listings (availability = RENTED)
    const rentedListings = await prisma.apartment.count({
      where: {
        landlordId: userId,
        availability: 'RENTED',
      },
    });

    // Get total inquiries received for all this landlord's apartments
    const landlordApartments = await prisma.apartment.findMany({
      where: { landlordId: userId },
      select: { id: true },
    });

    const landlordApartmentIds = landlordApartments.map(apt => apt.id);

    const totalInquiriesReceived = await prisma.inquiry.count({
      where: {
        landlordId: userId,
        OR: landlordApartmentIds.map(apartmentId => ({
          apartmentId,
        })),
      },
    });

    // Get recently created listings
    const recentListings = await prisma.apartment.findMany({
      where: { landlordId: userId },
      select: {
        id: true,
        title: true,
        availability: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get inquiries received with tenant and apartment details (latest)
    const inquiriesReceived = await prisma.inquiry.findMany({
      where: {
        landlordId: userId,
        OR: landlordApartmentIds.map(apartmentId => ({
          apartmentId,
        })),
      },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        apartment: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return sendSuccess(res, {
      totalListings,
      activeListings,
      rentedListings,
      totalInquiriesReceived,
      recentListings,
      inquiriesReceived,
    });
  } catch (error) {
    next(error);
  }
};