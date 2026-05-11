import express from "express";
const router = express.Router();

import {
  getProfile,
  updateProfile,
  getMyStudents,
  getDashboard,
  getMyClasses,
} from "../controllers/teacher.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isTeacher } from "../middleware/role.middleware.js";

// ✅ B-18: isTeacher middleware allows both 'teacher' AND 'admin' roles.
// When an admin hits these routes their req.user.id has no linked Teacher
// document, so every controller that does Teacher.findOne({ user: req.user.id })
// returns null — producing empty dashboards, empty class lists, etc.
//
// Fix: add a guard that intercepts admin users before they reach the teacher
// controllers and returns a clear 403 with an explanation, rather than silently
// returning empty data. Admins should use /api/admin/* routes instead.
//
// If you later want admins to have a teacher-view, the right fix is to ensure
// an admin user has a linked Teacher document, then remove this guard.
const teacherOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins do not have a teacher profile. Use /api/admin routes instead.",
    });
  }
  next();
};

// All routes: must be authenticated + pass isTeacher (role check) + teacherOnly (admin guard)
router.use(protect, isTeacher, teacherOnly);

// Profile
router.get("/profile",  getProfile);
router.put("/profile",  updateProfile);

// Dashboard
router.get("/dashboard", getDashboard);

// Students
router.get("/students", getMyStudents);
router.get("/classes",  getMyClasses);

export default router;