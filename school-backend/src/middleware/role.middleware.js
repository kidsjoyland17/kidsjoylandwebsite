import { sendError } from "../utils/response.js";

/** Only admins can access */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return sendError(res, "Access denied: Admins only.", 403);
  next();
};

/** Teachers and admins can access */
export const isTeacher = (req, res, next) => {
  if (!["teacher", "admin"].includes(req.user?.role))
    return sendError(res, "Access denied: Teachers only.", 403);
  next();
};

/** Students, teachers, and admins can access */
export const isStudent = (req, res, next) => {
  if (!["student", "teacher", "admin"].includes(req.user?.role))
    return sendError(res, "Access denied.", 403);
  next();
};
