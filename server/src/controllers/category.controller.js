import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import parseId from "../utils/parseId.js";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

import {
  categorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await getCategories(req.user?.role === "ADMIN");

  sendResponse(res, 200, "Categories fetched successfully", categories);
});

export const addCategory = asyncHandler(async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await createCategory(data);

  sendResponse(res, 201, "Category created successfully", category);
});

export const editCategory = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const data = updateCategorySchema.parse(req.body);

  const category = await updateCategory(id, data);

  sendResponse(res, 200, "Category updated successfully", category);
});

export const removeCategory = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  await deleteCategory(id);

  sendResponse(res, 200, "Category deleted successfully");
});
