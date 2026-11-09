import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

export const createReview = async (userId, data) => {
  const orderItemId = parseId(data.orderItemId);

  const orderItem = await prisma.orderItem.findUnique({
    where: {
      id: orderItemId,
    },
    include: {
      order: {
        select: {
          userId: true,
          status: true,
        },
      },
    },
  });

  if (!orderItem || orderItem.order.userId !== userId) {
    throw new AppError("Order item not found", 404);
  }

  if (orderItem.order.status !== "DELIVERED") {
    throw new AppError(
      "You can review food only after it has been delivered",
      400,
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      orderItemId,
    },
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this item", 409);
  }

  return prisma.review.create({
    data: {
      userId,
      foodId: orderItem.foodId,
      orderItemId,
      rating: data.rating,
      comment: data.comment || null,
    },
    select: {
      id: true,
      foodId: true,
      rating: true,
      comment: true,
      status: true,
      createdAt: true,
    },
  });
};

export const getFoodReviews = async (foodId, query = {}) => {
  const id = parseId(foodId);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const where = {
    foodId: id,
    status: "APPROVED",
  };

  const [reviews, total, aggregate] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      where,
      _avg: {
        rating: true,
      },
    }),
  ]);

  return {
    reviews,
    averageRating: Number((aggregate._avg.rating || 0).toFixed(1)),
    totalReviews: total,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyReviews = async (userId) => {
  return prisma.review.findMany({
    where: {
      userId,
    },
    include: {
      food: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
