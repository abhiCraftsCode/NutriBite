import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const result = await registerUser(data);

  sendResponse(res, 201, "Registration successful", result);
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const result = await loginUser(data);

  sendResponse(res, 200, "Login successful", result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  sendResponse(res, 200, "User profile fetched successfully", user);
});
