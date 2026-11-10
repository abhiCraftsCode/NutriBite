import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

const allowedTransitions = {
  PLACED: ["CONFIRMED"],
  CONFIRMED: ["PREPARING"],
  PREPARING: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: [],
  OUT_FOR_DELIVERY: [],
  DELIVERED: [],
  CANCELLED: [],
  PENDING_PAYMENT: [],
};

const validStatuses = [
  "PENDING_PAYMENT",
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const customerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
};

export const getAdminOrders = async ({
  status,
  search,
  page = 1,
  limit = 10,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);

  if (status && !validStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search?.trim()) {
    const term = search.trim();

    where.OR = [
      {
        orderNumber: {
          contains: term,
        },
      },
      {
        user: {
          name: {
            contains: term,
          },
        },
      },
      {
        user: {
          email: {
            contains: term,
          },
        },
      },
    ];
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        deliveryFee: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: customerSelect,
        },
        items: {
          select: {
            id: true,
            foodName: true,
            quantity: true,
            total: true,
          },
        },
        payments: {
          select: {
            id: true,
            method: true,
            status: true,
            amount: true,
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getAdminOrderById = async (id) => {
  const orderId = parseId(id);

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: customerSelect,
      },
      items: {
        include: {
          food: {
            select: {
              id: true,
              image: true,
              servingSize: true,
              calories: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          failureReason: true,
          createdAt: true,
        },
      },
      delivery: {
        include: {
          partner: {
            select: customerSelect,
          },
          events: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
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

export const updateAdminOrderStatus = async (id, adminId, { status, note }) => {
  const orderId = parseId(id);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const allowed = allowedTransitions[order.status] || [];

    if (!allowed.includes(status)) {
      throw new AppError(
        `Cannot change order status from ${order.status} to ${status}`,
        400,
      );
    }

    const updatedOrder = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        changedById: adminId,
        status,
        note: note?.trim() || `Order status updated to ${status}`,
      },
    });

    return updatedOrder;
  });
};
