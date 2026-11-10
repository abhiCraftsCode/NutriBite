import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import parseId from "../utils/parseId.js";

import { getRecipe, saveRecipe } from "../services/recipe.service.js";

import { recipeSchema } from "../validators/recipe.validator.js";

export const viewRecipe = asyncHandler(async (req, res) => {
  const foodId = parseId(req.params.foodId);

  const recipe = await getRecipe(foodId, req.user?.role === "ADMIN");

  sendResponse(res, 200, "Recipe fetched successfully", recipe);
});

export const upsertRecipe = asyncHandler(async (req, res) => {
  const foodId = parseId(req.params.foodId);
  const data = recipeSchema.parse(req.body);

  const recipe = await saveRecipe(foodId, data);

  sendResponse(res, 200, "Recipe saved successfully", recipe);
});
