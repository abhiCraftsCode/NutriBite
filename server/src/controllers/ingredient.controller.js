import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import parseId from "../utils/parseId.js";

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deactivateIngredient,
} from "../services/ingredient.service.js";

import {
  ingredientSchema,
  updateIngredientSchema,
} from "../validators/ingredient.validator.js";

export const listIngredients = asyncHandler(async (req, res) => {
  const ingredients = await getIngredients();

  sendResponse(res, 200, "Ingredients fetched successfully", ingredients);
});

export const addIngredient = asyncHandler(async (req, res) => {
  const data = ingredientSchema.parse(req.body);
  const ingredient = await createIngredient(data);

  sendResponse(res, 201, "Ingredient created successfully", ingredient);
});

export const editIngredient = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const data = updateIngredientSchema.parse(req.body);

  const ingredient = await updateIngredient(id, data);

  sendResponse(res, 200, "Ingredient updated successfully", ingredient);
});

export const removeIngredient = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await deactivateIngredient(id);

  sendResponse(res, 200, "Ingredient deactivated successfully");
});
