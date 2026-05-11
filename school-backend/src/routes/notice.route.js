import express from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getPublicNotices,
} from "../controllers/notice.controller.js";
import { protect } from "../middleware/auth.middleware.js";
// ✅ B-14: was re-defining adminOnly and adminOrTeacher inline here AND in
//    timetable.routes.js — three separate copies of the same logic that could
//    silently drift out of sync. Now imported from the single source of truth.
import { isAdmin, isTeacher } from "../middleware/role.middleware.js";

const router = express.Router();

// Public route — no auth needed, used by landing page notice ticker
router.get("/public", getPublicNotices);

router
  .route("/")
  .get(protect, isTeacher, getAllNotices)   // admin + teacher can read
  .post(protect, isAdmin, createNotice);   // admin only can create

router
  .route("/:id")
  .get(protect, isTeacher, getNoticeById)
  .put(protect, isAdmin, updateNotice)
  .delete(protect, isAdmin, deleteNotice);

export default router;