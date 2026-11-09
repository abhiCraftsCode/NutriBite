import bcrypt from "bcryptjs";

import { prisma } from "../src/config/prisma.js";
import { config } from "../src/config/config.js";

const seedAdmin = async () => {
  if (!config.admin.email || !config.admin.password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured");
  }

  const email = config.admin.email.toLowerCase().trim();

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin account already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash(config.admin.password, 12);

  await prisma.user.create({
    data: {
      name: config.admin.name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin account created successfully.");
};

try {
  await seedAdmin();
} catch (error) {
  console.error("Admin seeding failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
