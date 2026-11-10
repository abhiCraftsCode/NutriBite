import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getCategories = async (isAdmin = false) => {
  return prisma.category.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const createCategory = async (data) => {
  return prisma.category.create({ data });
};

export const updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { foods: true },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category._count.foods > 0) {
    throw new AppError(
      "Category contains food items. Deactivate it instead.",
      409,
    );
  }

  await prisma.category.delete({ where: { id } });
};
