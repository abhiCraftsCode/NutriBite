import bcrypt from "bcryptjs";

import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const createDeliveryPartner = async (data) => {
  const email = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const partner = await prisma.user.create({
    data: {
      name: data.name,
      email,
      password: hashedPassword,
      phone: data.phone || null,
      role: "DELIVERY_PARTNER",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return partner;
};

export const getDeliveryPartners = async () => {
  const partners = await prisma.user.findMany({
    where: {
      role: "DELIVERY_PARTNER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const partnerIds = partners.map((partner) => partner.id);

  const activeDeliveries = await prisma.delivery.findMany({
    where: {
      partnerId: {
        in: partnerIds,
      },
      status: {
        in: ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"],
      },
    },
    select: {
      partnerId: true,
    },
  });

  const busyPartnerIds = new Set(
    activeDeliveries.map((delivery) => delivery.partnerId),
  );

  return partners.map((partner) => ({
    ...partner,
    availability: !partner.isActive
      ? "INACTIVE"
      : busyPartnerIds.has(partner.id)
        ? "BUSY"
        : "AVAILABLE",
  }));
};
