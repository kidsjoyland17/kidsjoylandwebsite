import rateLimit from "express-rate-limit";

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Try again later.",
});

export default resetLimiter;