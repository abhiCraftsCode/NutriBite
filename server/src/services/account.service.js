import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      "New password must be different from the current password",
      400,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};
