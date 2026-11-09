import { z } from "zod";

export const createSuggestionSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional(),
  ingredients: z.string().trim().max(3000).optional(),
  recipe: z.string().trim().max(5000).optional(),
});

export const reviewSuggestionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().trim().max(1000).optional(),
  approvedFoodId: z.number().int().positive().optional(),
});
