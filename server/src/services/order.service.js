import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const orderInclude = {
  items: true,
  statusHistory: {
    orderBy: { createdAt: "asc" },
  },
  payments: true,
};

const validateStock = async (tx, cartItems) => {
  const required = new Map();

  for (const item of cartItems) {
    const ingredients = await tx.foodIngredient.findMany({
      where: { foodId: item.foodId },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            stockQuantity: true,
            isActive: true,
          },
        },
      },
    });

    if (ingredients.length === 0) {
      throw new AppError(
        `${item.food.name} has no ingredient configuration`,
        400,
      );
    }

    for (const entry of ingredients) {
      if (!entry.ingredient.isActive) {
        throw new AppError(`${entry.ingredient.name} is unavailable`, 400);
      }

      const needed = entry.quantity * item.quantity;

      required.set(
        entry.ingredient.id,
        (required.get(entry.ingredient.id) || 0) + needed,
      );
    }
  }

  for (const [ingredientId, needed] of required) {
    const ingredient = await tx.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient || ingredient.stockQuantity < needed) {
      throw new AppError(
        `Insufficient stock for ${ingredient?.name || "an ingredient"}`,
        400,
      );
    }
  }
};

export const createOrder = async (userId, addressId) => {
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new AppError("Delivery address not found", 404);
    }

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            food: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    for (const item of cart.items) {
      const food = item.food;

      if (!food.isPublished || !food.isAvailable || !food.category.isActive) {
        throw new AppError(`${food.name} is currently unavailable`, 400);
      }
    }

    await validateStock(tx, cart.items);

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0,
    );

    // Free delivery for this MVP.
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    const orderNumber = `NB-${Date.now()}-${randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

    const customer = await tx.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,

        deliveryName: customer.name,
        deliveryPhone: customer.phone || "",
        deliveryAddress: address.address,
        deliveryCity: address.city,
        deliveryState: address.state,
        deliveryPincode: address.pincode,
        deliveryLandmark: address.landmark,

        subtotal,
        deliveryFee,
        total,
        status: "PENDING_PAYMENT",

        items: {
          create: cart.items.map((item) => ({
            foodId: item.foodId,
            foodName: item.food.name,
            unitPrice: item.food.price,
            quantity: item.quantity,
            total: item.food.price * item.quantity,
          })),
        },

        statusHistory: {
          create: {
            status: "PENDING_PAYMENT",
            note: "Order created; awaiting payment",
          },
        },
      },
      include: orderInclude,
    });

    return order;
  });
};

export const getCustomerOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      delivery: {
        include: {
          events: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getCustomerOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
      payments: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
      delivery: {
        include: {
          events: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};
