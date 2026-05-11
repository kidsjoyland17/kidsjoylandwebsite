/**
 * Global error handler — catches anything passed to next(err).
 * Must have 4 parameters to be recognised as an error handler by Express.
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} is already registered.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired." });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
