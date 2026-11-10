import { verifyToken } from "../utils/token.js";
import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    if (!payload || typeof payload !== "object" || !payload.sub) {
      throw new AppError("Invalid authentication token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("User account not found or inactive", 401);
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AppError("Invalid or expired token", 401));
    }

    next(error);
  }
};

export default authenticate;
