import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

export const createSuggestion = async (userId, data) => {
  return prisma.suggestion.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      ingredients: data.ingredients || null,
      recipe: data.recipe || null,
    },
  });
};

export const getMySuggestions = async (userId) => {
  return prisma.suggestion.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      approvedFood: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
};

export const getMySuggestionById = async (suggestionId, userId) => {
  const id = parseId(suggestionId);

  const suggestion = await prisma.suggestion.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      approvedFood: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!suggestion) {
    throw new AppError("Suggestion not found", 404);
  }

  return suggestion;
};
