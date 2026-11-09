import app from "./src/app.js";
import { config } from "./src/config/config.js";
import { prisma } from "./src/config/prisma.js";

const PORT = config.port;

const startServer = async () => {
  try {
    // Establish database connection
    await prisma.$connect();

    console.log("Database connected successfully");

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`NutriBite API running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
