import { prisma } from '../database/prismaClient.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * GET /api/apartments/:apartmentId/comments
 * Get all comments for an apartment with their replies.
 */
export const getApartmentComments = async function (req, res, next) {
  try {
    const { apartmentId } = req.params;

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Fetch comments with their replies eagerly loaded
    const comments = await prisma.comment.findMany({
      where: { apartmentId, parentCommentId: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, comments);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/apartments/:apartmentId/comments
 * Create a new comment on an apartment.
 * Authenticated users can comment.
 */
export const createComment = async function (req, res, next) {
  try {
    const { apartmentId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return sendError(res, 'Comment content is required', 400);
    }

    if (content.trim().length < 1) {
      return sendError(res, 'Comment content must not be empty', 400);
    }

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return sendError(res, 'Apartment not found', 404);
    }

    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    const userId = req.user.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // If this is a reply, validate parent comment exists
    let parentCommentId = null;
    if (req.body.parentCommentId) {
      parentCommentId = req.body.parentCommentId;
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
      });

      if (!parentComment) {
        return sendError(res, 'Parent comment not found', 404);
      }

      if (parentComment.apartmentId !== apartmentId) {
        return sendError(res, 'Parent comment does not belong to this apartment', 400);
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        apartmentId,
        userId,
        parentCommentId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return sendSuccess(res, comment, 'Comment posted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/comments/:commentId/replies
 * Create a reply to a comment.
 */
export const createReply = async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return sendError(res, 'Reply content is required', 400);
    }

    // Check if comment exists (parent comment)
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!parentComment) {
      return sendError(res, 'Parent comment not found', 404);
    }

    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    const userId = req.user.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Create the reply
    const reply = await prisma.comment.create({
      data: {
        content: content.trim(),
        apartmentId: parentComment.apartmentId,
        userId,
        parentCommentId: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return sendSuccess(res, reply, 'Reply posted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/comments/:commentId
 * Edit a comment.
 * Only the comment author can edit their own comment.
 */
export const editComment = async function (req, res, next) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return sendError(res, 'Comment content is required', 400);
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    // Check if user is the author of the comment
    if (comment.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You can only edit your own comments', 403);
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return sendSuccess(res, updatedComment, 'Comment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/comments/:commentId
 * Delete a comment.
 * Only the comment author can delete their own comment.
 * When a parent comment is deleted, replies remain but show as orphaned.
 */
export const deleteComment = async function (req, res, next) {
  try {
    const { commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, 'Unauthenticated: No user context', 401);
    }

    // Check if user is the author of the comment
    if (comment.userId !== req.user.userId) {
      return sendError(res, 'Forbidden: You can only delete your own comments', 403);
    }

    // Soft delete approach: we'll set a deleted flag or just delete
    // Since Prisma doesn't have built-in soft delete, we'll delete and
    // replies will remain as orphaned comments (parentCommentId will be nulled)
    
    // Actually, let's delete the comment and its replies will be orphaned
    // Prisma's onDelete: Cascade on parentComment means replies won't be auto-deleted
    // Let's just delete the comment
    
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};