// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error("Unhandled Error:", err);

  // Prisma specific error handling
  if (err.code === "P2002") {
    return res.status(409).json({
      message: "Unique constraint violation",
      error: err.message,
    });
  }

  // General error response
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
