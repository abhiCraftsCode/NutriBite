import { prisma } from "../config/prisma.js";

const getTodayStart = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const getAdminDashboard = async () => {
  const today = getTodayStart();

  const [
    totalOrders,
    todayOrders,
    totalCustomers,
    totalDeliveryPartners,
    totalFoods,
    activeFoods,
    totalRevenue,
    todayRevenue,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    readyOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockIngredients,
    recentOrders,
    popularFoods,
  ] = await Promise.all([
    // Total orders
    prisma.order.count(),

    // Orders created today
    prisma.order.count({
      where: {
        createdAt: { gte: today },
      },
    }),

    // Active customers
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        isActive: true,
      },
    }),

    // Active delivery partners
    prisma.user.count({
      where: {
        role: "DELIVERY_PARTNER",
        isActive: true,
      },
    }),

    // Total food items
    prisma.food.count(),

    // Published and available food
    prisma.food.count({
      where: {
        isPublished: true,
        isAvailable: true,
      },
    }),

    // Lifetime captured revenue
    prisma.payment.aggregate({
      where: {
        status: "CAPTURED",
      },
      _sum: {
        amount: true,
      },
    }),

    // Captured payments created today
    prisma.payment.aggregate({
      where: {
        status: "CAPTURED",
        createdAt: { gte: today },
      },
      _sum: {
        amount: true,
      },
    }),

    // Order status counts
    prisma.order.count({
      where: { status: "PLACED" },
    }),

    prisma.order.count({
      where: { status: "CONFIRMED" },
    }),

    prisma.order.count({
      where: { status: "PREPARING" },
    }),

    prisma.order.count({
      where: { status: "READY_FOR_PICKUP" },
    }),

    prisma.order.count({
      where: { status: "DELIVERED" },
    }),

    prisma.order.count({
      where: { status: "CANCELLED" },
    }),

    // Ingredients for low-stock calculation
    prisma.ingredient.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        stockQuantity: true,
        reorderLevel: true,
      },
    }),

    // Latest five orders
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),

    // Top five foods by quantity sold in delivered orders
    prisma.orderItem.groupBy({
      by: ["foodId", "foodName"],
      where: {
        order: {
          status: "DELIVERED",
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
  ]);

  // Calculate low-stock ingredients
  const lowStock = lowStockIngredients.filter(
    (ingredient) => ingredient.stockQuantity <= ingredient.reorderLevel,
  );

  return {
    overview: {
      totalOrders,
      todayOrders,
      totalCustomers,
      totalDeliveryPartners,
      totalFoods,
      activeFoods,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
    },

    orders: {
      pending: pendingOrders,
      confirmed: confirmedOrders,
      preparing: preparingOrders,
      readyForPickup: readyOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },

    lowStock: {
      count: lowStock.length,
      ingredients: lowStock,
    },

    recentOrders,

    popularFoods: popularFoods.map((food) => ({
      foodId: food.foodId,
      foodName: food.foodName,
      quantitySold: food._sum.quantity || 0,
      revenue: food._sum.total || 0,
    })),
  };
};
