import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";
import {
  passoutStudent,
  getAllPassouts,
  getPassoutYears,
  getPassoutById,
  updatePassout,
  deletePassout,
} from "../controllers/passout.controller.js";

const router = express.Router();

// All passout routes are admin-only
router.use(protect, isAdmin);

// ── GET  /api/admin/passout/years       → distinct year list for filter dropdown
// NOTE: This MUST be before /:id so "years" is not matched as an ObjectId
router.get("/years", getPassoutYears);

// ── GET  /api/admin/passout             → list all with pagination + filters
// ── POST /api/admin/passout/:studentId  → pass out an active student
router.get("/",              getAllPassouts);
router.post("/:studentId",   passoutStudent);

// ── GET    /api/admin/passout/:id   → single record
// ── PATCH  /api/admin/passout/:id   → update remarks / certificate status
// ── DELETE /api/admin/passout/:id   → permanently remove record
router.get    ("/:id", getPassoutById);
router.patch  ("/:id", updatePassout);
router.delete ("/:id", deletePassout);

export default router;