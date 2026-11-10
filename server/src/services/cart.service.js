import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const foodSelect = {
  id: true,
  name: true,
  image: true,
  price: true,
  servingSize: true,
  isPublished: true,
  isAvailable: true,
  category: {
    select: { name: true, isActive: true },
  },
};

const getOrCreateCart = async (userId, db = prisma) => {
  return db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: {
          food: { select: foodSelect },
        },
      },
    },
  });
};

const ensureFoodAvailable = async (foodId) => {
  const food = await prisma.food.findFirst({
    where: {
      id: foodId,
      isPublished: true,
      isAvailable: true,
      category: { isActive: true },
    },
    select: { id: true },
  });

  if (!food) {
    throw new AppError("Food is currently unavailable", 400);
  }
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const items = cart.items.map((item) => ({
    id: item.id,
    foodId: item.foodId,
    quantity: item.quantity,
    food: item.food,
    lineTotal: item.food.price * item.quantity,
  }));

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
};

export const addCartItem = async (userId, foodId, quantity) => {
  await ensureFoodAvailable(foodId);

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_foodId: {
        cartId: cart.id,
        foodId,
      },
    },
  });

  const nextQuantity = (existing?.quantity || 0) + quantity;

  if (nextQuantity > 20) {
    throw new AppError("Maximum quantity per food is 20", 400);
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_foodId: {
        cartId: cart.id,
        foodId,
      },
    },
    create: {
      cartId: cart.id,
      foodId,
      quantity,
    },
    update: {
      quantity: nextQuantity,
    },
  });

  return getCart(userId);
};

export const updateCartItem = async (userId, itemId, quantity) => {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
    include: { food: true },
  });

  if (!item) {
    throw new AppError("Cart item not found", 404);
  }

  await ensureFoodAvailable(item.foodId);

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCart(userId);
};

export const removeCartItem = async (userId, itemId) => {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
  });

  if (!item) {
    throw new AppError("Cart item not found", 404);
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return getCart(userId);
};

export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return { message: "Cart cleared successfully" };
};
