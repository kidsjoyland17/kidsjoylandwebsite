import express from "express";
import {
  getTimetable,
  getTimetableByClassDay,
  upsertTimetable,
  updateStatus,
  deleteTimetable,
  copyDay,
  getTeacherTimetable,
} from "../controllers/timetable.controller.js";
import { protect } from "../middleware/auth.middleware.js";
// ✅ B-14: was re-defining adminOnly and adminOrTeacher inline — three separate
//    copies across this file, notice.route.js, and role.middleware.js.
//    Removed all inline guards. Now imports from the single source of truth.
import { isAdmin, isTeacher } from "../middleware/role.middleware.js";

const router = express.Router();

// GET  /api/timetable?class=5&day=Monday
router.get("/", protect, isTeacher, getTimetable);

// GET  /api/timetable/teacher/:teacherId
router.get("/teacher/:teacherId", protect, isTeacher, getTeacherTimetable);

// GET  /api/timetable/:class/:day
router.get("/:class/:day", protect, isTeacher, getTimetableByClassDay);

// POST /api/timetable
router.post("/", protect, isAdmin, upsertTimetable);

// PATCH /api/timetable/:class/:day/status
router.patch("/:class/:day/status", protect, isAdmin, updateStatus);

// POST /api/timetable/:class/:day/copy
router.post("/:class/:day/copy", protect, isAdmin, copyDay);

// DELETE /api/timetable/:class/:day
router.delete("/:class/:day", protect, isAdmin, deleteTimetable);

export default router;