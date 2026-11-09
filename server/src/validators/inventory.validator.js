import { z } from "zod";

export const stockMovementSchema = z
  .object({
    type: z.enum(["PURCHASE", "RESTOCK", "ADJUSTMENT", "WASTE"]),
    quantity: z
      .number()
      .finite()
      .refine((value) => value !== 0, {
        message: "Quantity cannot be zero",
      }),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "ADJUSTMENT" && data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity must be positive for this movement type",
      });
    }
  });
