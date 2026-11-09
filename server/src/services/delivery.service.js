import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import parseId from "../utils/parseId.js";

const activeDeliveryStatuses = [
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
];

const deliveryTransitions = {
  ASSIGNED: ["ACCEPTED"],
  ACCEPTED: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  UNASSIGNED: [],
};

export const assignDelivery = async (orderId, adminId, partnerId) => {
  const parsedOrderId = parseId(orderId);
  const parsedPartnerId = parseId(partnerId);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: parsedOrderId },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "READY_FOR_PICKUP") {
      throw new AppError("Only ready-for-pickup orders can be assigned", 400);
    }

    const partner = await tx.user.findUnique({
      where: { id: parsedPartnerId },
    });

    if (!partner || partner.role !== "DELIVERY_PARTNER" || !partner.isActive) {
      throw new AppError("Active delivery partner not found", 404);
    }

    const existingActiveDelivery = await tx.delivery.findFirst({
      where: {
        partnerId: parsedPartnerId,
        status: {
          in: activeDeliveryStatuses,
        },
      },
    });

    if (existingActiveDelivery) {
      throw new AppError(
        "Delivery partner already has an active delivery",
        409,
      );
    }

    const existingDelivery = await tx.delivery.findUnique({
      where: {
        orderId: parsedOrderId,
      },
    });

    if (existingDelivery) {
      throw new AppError("This order already has a delivery record", 409);
    }

    const delivery = await tx.delivery.create({
      data: {
        orderId: parsedOrderId,
        partnerId: parsedPartnerId,
        status: "ASSIGNED",
        assignedAt: new Date(),
      },
    });

    await tx.deliveryEvent.create({
      data: {
        deliveryId: delivery.id,
        actorId: adminId,
        status: "ASSIGNED",
        note: "Delivery assigned by admin",
      },
    });

    return delivery;
  });
};

export const getPartnerDeliveries = async (partnerId) => {
  return prisma.delivery.findMany({
    where: {
      partnerId,
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          deliveryName: true,
          deliveryPhone: true,
          deliveryAddress: true,
          deliveryCity: true,
          deliveryState: true,
          deliveryPincode: true,
          deliveryLandmark: true,
          createdAt: true,
          items: {
            select: {
              foodName: true,
              quantity: true,
            },
          },
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPartnerDeliveryById = async (deliveryId, partnerId) => {
  const id = parseId(deliveryId);

  const delivery = await prisma.delivery.findFirst({
    where: {
      id,
      partnerId,
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!delivery) {
    throw new AppError("Delivery not found", 404);
  }

  return delivery;
};

export const updateDeliveryStatus = async (
  deliveryId,
  partnerId,
  { status, note },
) => {
  const id = parseId(deliveryId);

  return prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findFirst({
      where: {
        id,
        partnerId,
      },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }

    const allowed = deliveryTransitions[delivery.status] || [];

    if (!allowed.includes(status)) {
      throw new AppError(
        `Cannot change delivery status from ${delivery.status} to ${status}`,
        400,
      );
    }

    const now = new Date();

    const timestampUpdates = {
      ACCEPTED: { acceptedAt: now },
      PICKED_UP: { pickedUpAt: now },
      DELIVERED: { deliveredAt: now },
    };

    const updatedDelivery = await tx.delivery.update({
      where: {
        id,
      },
      data: {
        status,
        ...(timestampUpdates[status] || {}),
      },
    });

    await tx.deliveryEvent.create({
      data: {
        deliveryId: id,
        actorId: partnerId,
        status,
        note: note?.trim() || `Delivery status updated to ${status}`,
      },
    });

    // Keep order status synchronized with delivery progress.
    if (status === "OUT_FOR_DELIVERY" || status === "DELIVERED") {
      const orderStatus =
        status === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : "DELIVERED";

      await tx.order.update({
        where: {
          id: delivery.orderId,
        },
        data: {
          status: orderStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          changedById: partnerId,
          status: orderStatus,
          note:
            note?.trim() ||
            `Order ${orderStatus.toLowerCase().replaceAll("_", " ")}`,
        },
      });
    }

    return updatedDelivery;
  });
};
