import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.number().int().positive(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const failedPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  failureReason: z.string().max(500).optional(),
});
