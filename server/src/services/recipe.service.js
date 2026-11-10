import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getRecipe = async (foodId, isAdmin = false) => {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
    include: {
      recipe: true,
      category: true,
    },
  });

  if (!food) {
    throw new AppError("Food item not found", 404);
  }

  if (
    !isAdmin &&
    (!food.isPublished || !food.isAvailable || !food.category.isActive)
  ) {
    throw new AppError("Food item is not available", 404);
  }

  if (!food.recipe) {
    throw new AppError("Recipe not found", 404);
  }

  return food.recipe;
};

export const saveRecipe = async (foodId, data) => {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
  });

  if (!food) {
    throw new AppError("Food item not found", 404);
  }

  return prisma.recipe.upsert({
    where: { foodId },

    create: {
      foodId,
      ...data,
    },

    update: data,
  });
};
