import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getIngredients = async () => {
  return prisma.ingredient.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const createIngredient = async (data) => {
  return prisma.ingredient.create({
    data,
  });
};

export const updateIngredient = async (id, data) => {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404);
  }

  return prisma.ingredient.update({
    where: { id },
    data,
  });
};

export const deactivateIngredient = async (id) => {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404);
  }

  return prisma.ingredient.update({
    where: { id },
    data: { isActive: false },
  });
};
