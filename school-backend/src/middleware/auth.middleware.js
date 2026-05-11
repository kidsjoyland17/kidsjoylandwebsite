import { verifyToken } from "../utils/token.js";
import { sendError } from "../utils/response.js";

/**
 * protect — verifies JWT from cookie OR Authorization header.
 * Attaches decoded payload to req.user.
 */
export const protect = (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) return sendError(res, "Not authenticated. Please log in.", 401);

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    sendError(res, "Session expired. Please log in again.", 401);
  }
};
