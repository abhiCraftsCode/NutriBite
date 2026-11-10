import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

export const getAdminReviews = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const allowedStatuses = ["PENDING", "APPROVED", "HIDDEN"];

  if (query.status && !allowedStatuses.includes(query.status)) {
    throw new AppError("Invalid review status", 400);
  }

  const where = query.status ? { status: query.status } : {};

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        food: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const moderateReview = async (reviewId, adminId, status) => {
  const id = parseId(reviewId);

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.status !== "PENDING") {
    throw new AppError("Only pending reviews can be moderated", 400);
  }

  return prisma.review.update({
    where: { id },
    data: {
      status,
      moderatedById: adminId,
    },
  });
};
