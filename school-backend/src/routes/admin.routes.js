import express from "express";
import {
  getDashboard,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  assignStudentSection,       // ← NEW
  bulkAssignSection,          // ← NEW
  getClassSectionSummary,     // ← NEW
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllAdmissions,
  updateAdmissionStatus,
  deleteAdmission,
  getAllMessages,
  markMessageRead,
  deleteMessage,
  getAllClasses,
  getClassStudents,
  assignTeacherToClass,
  removeTeacherFromClass,
  getClassSubjects,
  updateClassSubjects,
  addSubjectToClass,
  removeSubjectFromClass,
  resetClassSubjects,
  getAdminAttendance,
  markAdminAttendance,
  getMetaClasses 
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect, isAdmin);

/* ─── Dashboard ──────────────────────────────────────────── */
router.get("/dashboard", getDashboard);
/* ─── Meta ───────────────────────────────────────────────── */
router.get("/meta/classes", getMetaClasses);
/* ─── Students ────────────────────────────────────────────── */
router.get   ("/students",                        getAllStudents);
router.post  ("/students",                        createStudent);
router.put   ("/students/:id",                    updateStudent);
router.delete("/students/:id",                    deleteStudent);

// Section assignment (must come BEFORE /:id routes to avoid param conflict)
router.patch ("/students/bulk-assign-section",    bulkAssignSection);      // ← NEW
router.patch ("/students/:id/section",            assignStudentSection);   // ← NEW

/* ─── Teachers ────────────────────────────────────────────── */
router.get   ("/teachers",     getAllTeachers);
router.post  ("/teachers",     createTeacher);
router.put   ("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

/* ─── Classes ─────────────────────────────────────────────── */
router.get   ("/classes",                                     getAllClasses);
router.get   ("/classes/:className/students",                 getClassStudents);       // supports ?section=A
router.get   ("/classes/:className/section-summary",          getClassSectionSummary); // ← NEW
router.post  ("/classes/:className/assign-teacher",           assignTeacherToClass);
router.delete("/classes/:className/teachers/:teacherId",      removeTeacherFromClass);

/* --- Class Subjects ----------------------------------------- */
router.get   ("/classes/:className/subjects",          getClassSubjects);
router.put   ("/classes/:className/subjects",          updateClassSubjects);
router.post  ("/classes/:className/subjects",          addSubjectToClass);
router.delete("/classes/:className/subjects/reset",    resetClassSubjects);
router.delete("/classes/:className/subjects/:subject", removeSubjectFromClass);

/* ─── Admissions ─────────────────────────────────────────── */
router.get   ("/admissions",            getAllAdmissions);
router.patch ("/admissions/:id/status", updateAdmissionStatus);
router.delete("/admissions/:id",        deleteAdmission);

/* ─── Messages ───────────────────────────────────────────── */
router.get   ("/messages",          getAllMessages);
router.patch ("/messages/:id/read", markMessageRead);
router.delete("/messages/:id",      deleteMessage);

/* ─── Attendance ─────────────────────────────────────────── */
router.get ("/attendance", getAdminAttendance);
router.post("/attendance", markAdminAttendance);

export default router;