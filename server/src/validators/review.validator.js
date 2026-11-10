import { z } from "zod";

export const createReviewSchema = z.object({
  orderItemId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"]),
});
