import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";
import { stockMovementSchema } from "../validators/inventory.validator.js";

import {
  getInventory,
  getIngredientMovements,
  recordStockMovement,
} from "../services/inventory.service.js";

export const listInventory = async (req, res) => {
  const lowStockOnly = req.query.lowStock === "true";

  const inventory = await getInventory({ lowStockOnly });

  res.status(200).json({
    success: true,
    data: inventory,
  });
};

export const listIngredientMovements = async (req, res) => {
  const ingredientId = parseId(req.params.id);

  const movements = await getIngredientMovements(ingredientId);

  res.status(200).json({
    success: true,
    data: movements,
  });
};

export const createStockMovement = async (req, res) => {
  const ingredientId = parseId(req.params.id);

  const result = stockMovementSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const { ingredient, movement } = await recordStockMovement(
    ingredientId,
    req.user.id,
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Stock updated successfully",
    data: {
      ingredient,
      movement,
    },
  });
};
