import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import parseId from "../utils/parseId.js";

import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  archiveFood,
  setFoodIngredients,
} from "../services/food.service.js";

import {
  foodSchema,
  updateFoodSchema,
  foodIngredientsSchema,
} from "../validators/food.validator.js";

export const listFoods = asyncHandler(async (req, res) => {
  let categoryId;

  if (req.query.categoryId !== undefined) {
    categoryId = parseId(req.query.categoryId);
  }

  const foods = await getFoods({
    isAdmin: req.user?.role === "ADMIN",
    categoryId,
    search: req.query.search?.trim(),
  });

  sendResponse(res, 200, "Foods fetched successfully", foods);
});

export const getFood = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const food = await getFoodById(id, req.user?.role === "ADMIN");

  sendResponse(res, 200, "Food fetched successfully", food);
});

export const addFood = asyncHandler(async (req, res) => {
  const data = foodSchema.parse(req.body);
  const food = await createFood(data);

  sendResponse(res, 201, "Food created successfully", food);
});

export const editFood = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const data = updateFoodSchema.parse(req.body);

  const food = await updateFood(id, data);

  sendResponse(res, 200, "Food updated successfully", food);
});

export const removeFood = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await archiveFood(id);

  sendResponse(res, 200, "Food archived successfully");
});

export const updateFoodIngredients = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { ingredients } = foodIngredientsSchema.parse(req.body);

  const food = await setFoodIngredients(id, ingredients);

  sendResponse(res, 200, "Food ingredients updated successfully", food);
});
