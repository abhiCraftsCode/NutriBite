import { prisma } from "../config/prisma.js";
import { razorpay } from "../config/razorpay.js";
import { config } from "../config/config.js";
import { verifyRazorpaySignature } from "../config/razorpay.js";
import AppError from "../utils/AppError.js";

export const createPaymentOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status !== "PENDING_PAYMENT") {
    throw new AppError("This order cannot be paid", 400);
  }

  if (order.total <= 0) {
    throw new AppError("Invalid payment amount", 400);
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: order.total,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: String(order.id),
      customerId: String(userId),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method: "RAZORPAY",
      status: "CREATED",
      amount: order.total,
      razorpayOrderId: razorpayOrder.id,
    },
  });

  return {
    paymentId: payment.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: config.razorpay.keyId,
    orderNumber: order.orderNumber,
  };
};

const deductOrderStock = async (tx, order) => {
  const required = new Map();

  for (const item of order.items) {
    const ingredients = await tx.foodIngredient.findMany({
      where: { foodId: item.foodId },
      include: {
        ingredient: {
          select: { id: true, name: true },
        },
      },
    });

    if (ingredients.length === 0) {
      throw new AppError(
        `${item.foodName} has no ingredient configuration`,
        400,
      );
    }

    for (const entry of ingredients) {
      const amount = entry.quantity * item.quantity;

      required.set(
        entry.ingredientId,
        (required.get(entry.ingredientId) || 0) + amount,
      );
    }
  }

  for (const [ingredientId, quantity] of required) {
    // Conditional update prevents stock from becoming negative.
    const result = await tx.ingredient.updateMany({
      where: {
        id: ingredientId,
        isActive: true,
        stockQuantity: { gte: quantity },
      },
      data: {
        stockQuantity: { decrement: quantity },
      },
    });

    if (result.count !== 1) {
      const ingredient = await tx.ingredient.findUnique({
        where: { id: ingredientId },
        select: { name: true },
      });

      throw new AppError(
        `Insufficient stock for ${ingredient?.name || "an ingredient"}`,
        409,
      );
    }

    await tx.ingredientStockMovement.create({
      data: {
        ingredientId,
        userId: order.userId,
        type: "ORDER_DEDUCTION",
        quantity,
        note: `Deducted for order ${order.orderNumber}`,
      },
    });
  }
};

export const verifyPayment = async (userId, payload) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

  // 1. Find payment and verify ownership
  const payment = await prisma.payment.findFirst({
    where: {
      razorpayOrderId,
      order: {
        userId,
      },
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              food: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  const order = payment.order;

  // 2. Idempotency: already completed payment
  if (payment.status === "CAPTURED" && order.status === "PLACED") {
    return {
      success: true,
      message: "Payment already verified",
      order,
    };
  }

  if (payment.status !== "CREATED" || order.status !== "PENDING_PAYMENT") {
    throw new AppError("Payment cannot be verified", 400);
  }

  // 3. Verify Razorpay signature
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );

  if (!isValid) {
    throw new AppError("Invalid payment signature", 400);
  }

  // 4. Fetch payment from Razorpay
  let razorpayPayment;

  try {
    razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
  } catch {
    throw new AppError("Unable to verify payment with Razorpay", 502);
  }

  // 5. Verify payment details
  if (
    razorpayPayment.order_id !== razorpayOrderId ||
    Number(razorpayPayment.amount) !== payment.amount ||
    razorpayPayment.currency !== "INR"
  ) {
    throw new AppError("Payment details do not match", 400);
  }

  // 6. Capture payment if it is only authorized
  if (razorpayPayment.status === "authorized") {
    try {
      razorpayPayment = await razorpay.payments.capture(
        razorpayPaymentId,
        payment.amount,
        "INR",
      );
    } catch {
      throw new AppError("Payment capture failed", 502);
    }
  }

  if (razorpayPayment.status !== "captured") {
    throw new AppError("Payment has not been captured", 400);
  }

  // 7. Update database transactionally
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Recheck state to handle concurrent verification requests
      const currentPayment = await tx.payment.findUnique({
        where: {
          id: payment.id,
        },
        include: {
          order: true,
        },
      });

      if (
        currentPayment.status === "CAPTURED" &&
        currentPayment.order.status === "PLACED"
      ) {
        return currentPayment.order;
      }

      if (
        currentPayment.status !== "CREATED" ||
        currentPayment.order.status !== "PENDING_PAYMENT"
      ) {
        throw new AppError("Payment state has changed", 409);
      }

      // Deduct ingredient stock and record stock movements
      await deductOrderStock(tx, order);

      // Mark payment as captured
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "CAPTURED",
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      // Fail other pending payment attempts for this order
      await tx.payment.updateMany({
        where: {
          orderId: order.id,
          id: {
            not: payment.id,
          },
          status: "CREATED",
        },
        data: {
          status: "FAILED",
          failureReason: "Another payment attempt succeeded",
        },
      });

      // Mark order as placed
      const updatedOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PLACED",
        },
      });

      // Record order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          changedById: userId,
          status: "PLACED",
          note: "Payment successfully verified",
        },
      });

      // Clear customer's cart
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId,
          },
        },
      });

      return updatedOrder;
    });

    return {
      success: true,
      message: "Payment verified successfully",
      order: result,
    };
  } catch (error) {
    // 8. If stock deduction fails after payment capture,
    // initiate a full refund.
    if (error.statusCode === 409) {
      let refund;

      try {
        refund = await razorpay.payments.refund(razorpayPaymentId, {
          amount: payment.amount,
        });
      } catch {
        throw new AppError(
          "Payment was captured, but the refund could not be confirmed. Please contact support.",
          502,
        );
      }

      // Update database only after Razorpay confirms refund
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "REFUNDED",
            razorpayPaymentId,
            razorpaySignature,
            failureReason: `Stock unavailable. Refund initiated: ${refund.id}`,
          },
        });

        await tx.payment.updateMany({
          where: {
            orderId: order.id,
            id: {
              not: payment.id,
            },
            status: "CREATED",
          },
          data: {
            status: "FAILED",
            failureReason: "Order cancelled due to unavailable stock",
          },
        });

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "CANCELLED",
            cancelReason: "Stock became unavailable after payment",
            cancelledAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            changedById: userId,
            status: "CANCELLED",
            note: `Stock unavailable. Payment refunded: ${refund.id}`,
          },
        });
      });

      throw new AppError(
        "Stock became unavailable. Your payment has been refunded.",
        409,
      );
    }

    throw error;
  }
};

export const markPaymentFailed = async (
  userId,
  razorpayOrderId,
  failureReason,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      razorpayOrderId,
      order: { userId },
    },
  });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  if (payment.status === "CAPTURED") {
    throw new AppError("This payment is already successful", 400);
  }

  if (payment.status === "CREATED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: failureReason || "Payment failed or cancelled",
      },
    });
  }

  return { message: "Payment failure recorded" };
};
