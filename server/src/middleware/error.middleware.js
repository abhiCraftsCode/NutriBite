import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma errors
  if (err.code?.startsWith("P")) {
    switch (err.code) {
      case "P2002":
        error = new AppError("Resource already exists", 409);
        break;

      case "P2025":
        error = new AppError("Requested resource not found", 404);
        break;

      case "P2003":
        error = new AppError("Related resource does not exist", 400);
        break;

      default:
        error = new AppError("Database operation failed", 500);
    }
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    error = new AppError(
      "Validation failed",
      400,
      err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  // Handle malformed JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error = new AppError("Invalid JSON request body", 400);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message || "Something went wrong",
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
