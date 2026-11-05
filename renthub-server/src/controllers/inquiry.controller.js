import { prisma } from '../database/prismaClient.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * POST /api/inquiries/:apartmentId
 * Tenants can send booking requests / inquiries about apartments.
 */
export const createInquiry = async function (req, res, next) {
  try {
    const { apartmentId } = req.params;
    const { message } = req.body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return sendError(res, 'Inquiry message is required', 400);
    }

    if (message.trim().length < 5) {
      return sendError(res, 'Inquiry message must be at least 5 characters', 400);
    }

    if (message.trim().length > 1500) {
      return sendError(res, 'Inquiry message must not exceed 1500 characters', 400);
    }

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check authentication
    if (!req.user || !req.user.userId) {
      return sendError(res, 'Unauthenticated: Please log in to send a booking inquiry', 401);
    }

    const userId = req.user.userId;

    // Check user and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.role !== 'TENANT') {
      return sendError(res, 'Only tenants can send booking inquiries', 403);
    }

    // Resolve Landlord for this apartment
    let landlord = await prisma.landlord.findFirst({
      where: {
        OR: [
          { id: apartment.landlordId },
          { userId: apartment.landlordId },
        ],
      },
    });

    if (!landlord) {
      // Fallback: create landlord profile if missing
      landlord = await prisma.landlord.create({
        data: { userId: apartment.landlordId },
      }).catch(() => null);
    }

    if (!landlord) {
      return sendError(res, 'Landlord profile not found for this apartment', 500);
    }

    const landlordId = landlord.id;

    // Check for existing inquiry from this tenant for this apartment
    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        apartmentId,
        tenantId: userId,
      },
    });

    let inquiry;
    if (existingInquiry) {
      // Update existing inquiry with new message and refreshed status
      inquiry = await prisma.inquiry.update({
        where: { id: existingInquiry.id },
        data: {
          message: message.trim(),
          status: 'pending',
          updatedAt: new Date(),
        },
        include: {
          apartment: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              monthlyRent: true,
              images: { select: { url: true }, take: 1 },
            },
          },
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          landlord: {
            select: {
              id: true,
              companyName: true,
              user: { select: { fullName: true, email: true, phone: true } },
            },
          },
        },
      });

      return sendSuccess(res, inquiry, 'Booking inquiry updated successfully');
    }

    // Create a new inquiry
    inquiry = await prisma.inquiry.create({
      data: {
        apartmentId,
        tenantId: userId,
        landlordId,
        message: message.trim(),
        status: 'pending',
      },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            monthlyRent: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    return sendSuccess(res, inquiry, 'Booking inquiry sent successfully!', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/inquiries
 * Returns inquiries based on role:
 * - Tenants: Inquiries they submitted
 * - Landlords: Inquiries received for their listings
 */
export const getInquiries = async function (req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    const userId = req.user.userId;

    // Tenant View
    if (req.user.role !== 'LANDLORD') {
      const inquiries = await prisma.inquiry.findMany({
        where: { tenantId: userId },
        include: {
          apartment: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              monthlyRent: true,
              images: { select: { url: true }, take: 1 },
            },
          },
          landlord: {
            select: {
              id: true,
              companyName: true,
              user: { select: { fullName: true, email: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, inquiries);
    }

    // Landlord View
    const landlord = await prisma.landlord.findUnique({
      where: { userId },
    });

    if (!landlord) {
      return sendSuccess(res, []);
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { landlordId: landlord.id },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            monthlyRent: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/inquiries/:id
 */
export const getInquiryById = async function (req, res, next) {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            monthlyRent: true,
            bedrooms: true,
            bathrooms: true,
            furnished: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    return sendSuccess(res, inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/inquiries/:id/status
 * Updates inquiry status (e.g. 'accepted', 'rejected', 'pending')
 * Only accessible by the landlord who owns the listing (or ADMIN).
 */
export const updateInquiryStatus = async function (req, res, next) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return sendError(res, 'Status is required and must be a string', 400);
    }

    const normalizedStatus = status.trim().toLowerCase();
    const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(normalizedStatus)) {
      return sendError(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    // Find inquiry with landlord and apartment
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        landlord: true,
        apartment: true,
      },
    });

    if (!inquiry) {
      return sendError(res, 'Inquiry not found', 404);
    }

    // Verify ownership: req.user must be the landlord associated with this inquiry or ADMIN
    const userId = req.user.userId;
    const isOwnerLandlord = inquiry.landlord?.userId === userId || inquiry.landlordId === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwnerLandlord && !isAdmin) {
      // Check if user has a landlord profile matching landlordId
      const landlord = await prisma.landlord.findUnique({ where: { userId } });
      if (!landlord || landlord.id !== inquiry.landlordId) {
        return sendError(res, 'Unauthorized: Only the property landlord can update inquiry status', 403);
      }
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: normalizedStatus },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            monthlyRent: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        landlord: {
          select: {
            id: true,
            companyName: true,
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    return sendSuccess(res, updatedInquiry, `Inquiry status updated to ${normalizedStatus}`);
  } catch (error) {
    next(error);
  }
};
