import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const getStockChange = (type, quantity) => {
  if (type === "WASTE") return -quantity;
  return quantity;
};

const recalculateFoodAvailability = async (tx, ingredientId) => {
  const foods = await tx.food.findMany({
    where: {
      ingredients: {
        some: { ingredientId },
      },
    },
    include: {
      ingredients: {
        include: {
          ingredient: {
            select: {
              stockQuantity: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  for (const food of foods) {
    const hasIngredients = food.ingredients.length > 0;

    const hasEnoughStock =
      hasIngredients &&
      food.ingredients.every(
        ({ quantity, ingredient }) =>
          ingredient.isActive && ingredient.stockQuantity >= quantity,
      );

    await tx.food.update({
      where: { id: food.id },
      data: { isAvailable: hasEnoughStock },
    });
  }
};

export const getInventory = async ({ lowStockOnly = false } = {}) => {
  const ingredients = await prisma.ingredient.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { movements: true },
      },
    },
  });

  const inventory = ingredients.map((ingredient) => ({
    ...ingredient,
    isLowStock: ingredient.stockQuantity <= ingredient.reorderLevel,
    movementCount: ingredient._count.movements,
  }));

  return lowStockOnly ? inventory.filter((item) => item.isLowStock) : inventory;
};

export const getIngredientMovements = async (ingredientId) => {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
    select: { id: true },
  });

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404);
  }

  return prisma.ingredientStockMovement.findMany({
    where: { ingredientId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const recordStockMovement = async (
  ingredientId,
  userId,
  { type, quantity, note },
) => {
  return prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new AppError("Ingredient not found", 404);
    }

    if (!ingredient.isActive) {
      throw new AppError("Cannot update stock of an inactive ingredient", 400);
    }

    const change = getStockChange(type, quantity);
    const newStock = ingredient.stockQuantity + change;

    if (newStock < 0) {
      throw new AppError("Insufficient stock for this operation", 400);
    }

    const updatedIngredient = await tx.ingredient.update({
      where: { id: ingredientId },
      data: { stockQuantity: newStock },
    });

    const movement = await tx.ingredientStockMovement.create({
      data: {
        ingredientId,
        userId,
        type,
        quantity: change,
        note: note || null,
      },
    });

    await recalculateFoodAvailability(tx, ingredientId);

    return {
      ingredient: updatedIngredient,
      movement,
    };
  });
};
