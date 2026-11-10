import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const foodDetails = {
  category: true,

  ingredients: {
    include: {
      ingredient: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
  },

  recipe: true,
};

export const getFoods = async ({ isAdmin = false, categoryId, search }) => {
  const where = {};

  if (!isAdmin) {
    where.isPublished = true;
    where.isAvailable = true;
    where.category = { isActive: true };
  }

  if (categoryId !== undefined) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.name = {
      contains: search,
    };
  }

  return prisma.food.findMany({
    where,
    include: foodDetails,
    orderBy: { createdAt: "desc" },
  });
};

export const getFoodById = async (id, isAdmin = false) => {
  const food = await prisma.food.findUnique({
    where: { id },
    include: foodDetails,
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

  return food;
};

export const createFood = async (data) => {
  const { categoryId, ...foodData } = data;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || !category.isActive) {
    throw new AppError("Valid active category is required", 400);
  }

  return prisma.food.create({
    data: {
      ...foodData,
      category: {
        connect: { id: categoryId },
      },
    },
    include: foodDetails,
  });
};

export const updateFood = async (id, data) => {
  const food = await prisma.food.findUnique({
    where: { id },
  });

  if (!food) {
    throw new AppError("Food item not found", 404);
  }

  const { categoryId, ...foodData } = data;

  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.isActive) {
      throw new AppError("Valid active category is required", 400);
    }
  }

  return prisma.food.update({
    where: { id },
    data: {
      ...foodData,
      ...(categoryId !== undefined && {
        category: { connect: { id: categoryId } },
      }),
    },
    include: foodDetails,
  });
};

export const archiveFood = async (id) => {
  const food = await prisma.food.findUnique({
    where: { id },
  });

  if (!food) {
    throw new AppError("Food item not found", 404);
  }

  return prisma.food.update({
    where: { id },
    data: {
      isPublished: false,
      isAvailable: false,
    },
  });
};

export const setFoodIngredients = async (foodId, ingredients) => {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
  });

  if (!food) {
    throw new AppError("Food item not found", 404);
  }

  const ingredientIds = ingredients.map((item) => item.ingredientId);

  const activeIngredients = await prisma.ingredient.findMany({
    where: {
      id: { in: ingredientIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (activeIngredients.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid or inactive", 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.foodIngredient.deleteMany({
      where: { foodId },
    });

    await tx.foodIngredient.createMany({
      data: ingredients.map((item) => ({
        foodId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      })),
    });

    return tx.food.findUnique({
      where: { id: foodId },
      include: foodDetails,
    });
  });
};
