import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

export const getAdminSuggestions = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

  if (query.status && !allowedStatuses.includes(query.status)) {
    throw new AppError("Invalid suggestion status", 400);
  }

  const where = query.status ? { status: query.status } : {};

  const [suggestions, total] = await prisma.$transaction([
    prisma.suggestion.findMany({
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
        approvedFood: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.suggestion.count({ where }),
  ]);

  return {
    suggestions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const reviewSuggestion = async (suggestionId, adminId, data) => {
  const id = parseId(suggestionId);

  return prisma.$transaction(async (tx) => {
    const suggestion = await tx.suggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new AppError("Suggestion not found", 404);
    }

    if (suggestion.status !== "PENDING") {
      throw new AppError("Only pending suggestions can be reviewed", 400);
    }

    if (data.approvedFoodId && data.status !== "APPROVED") {
      throw new AppError(
        "A food item can only be linked to an approved suggestion",
        400,
      );
    }

    if (data.approvedFoodId) {
      const food = await tx.food.findUnique({
        where: {
          id: parseId(data.approvedFoodId),
        },
        select: {
          id: true,
        },
      });

      if (!food) {
        throw new AppError("Food item not found", 404);
      }
    }

    return tx.suggestion.update({
      where: { id },
      data: {
        status: data.status,
        adminNote: data.adminNote || null,
        reviewedById: adminId,
        reviewedAt: new Date(),
        approvedFoodId: data.approvedFoodId || null,
      },
    });
  });
};
