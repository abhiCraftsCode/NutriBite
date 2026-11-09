import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const getAddresses = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const createAddress = async (userId, data) => {
  return prisma.address.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const updateAddress = async (userId, addressId, data) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
};

export const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return { message: "Address deleted successfully" };
};
