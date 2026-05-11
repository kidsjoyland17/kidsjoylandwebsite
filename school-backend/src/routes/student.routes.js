import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
// ✅ B-05: import role guards — needed to protect /profile/:id
import { isAdmin, isTeacher } from "../middleware/role.middleware.js";
import { getProfile, getMyAttendance } from "../controllers/student.controller.js";

const router = Router();
router.use(protect);

// Own profile — any authenticated student (or admin/teacher) can hit this
router.get("/profile", getProfile);

// ✅ B-05: /profile/:id had NO role check. Any logged-in user (including
//    another student) could pass any Student ObjectId and read another
//    student's full profile (phone, address, parent details).
//    Fixed: only admins or teachers can look up a student by ID.
router.get("/profile/:id", isAdmin || isTeacher, getProfile);

router.get("/attendance/:studentId", getMyAttendance);
router.get("/attendance", getMyAttendance);

export default router;