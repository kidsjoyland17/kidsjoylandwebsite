import Student from "../models/Student.model.js";
import Attendance from "../models/Attendance.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ── GET /api/student/profile ─────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    // ✅ Bug #9 fixed — JWT has req.user.id (User._id), not studentId
    // If an admin passes ?id=... in params we allow that too (admin viewing a student)
    let student;

    if (req.params.id) {
      // Admin / teacher fetching a specific student by their Student _id
      student = await Student.findById(req.params.id);
    } else {
      // Logged-in student fetching their own profile via the user ref
      student = await Student.findOne({ user: req.user.id });
    }

    if (!student) return sendError(res, "Student not found.", 404);
    sendSuccess(res, student);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/student/attendance/:studentId ───────────────────────
export const getMyAttendance = async (req, res, next) => {
  try {
    // Allow student to fetch own attendance without knowing their Student _id
    // If no param, resolve Student _id from the logged-in user
    let studentId = req.params.studentId;

    if (!studentId) {
      const student = await Student.findOne({ user: req.user.id }).select("_id");
      if (!student) return sendError(res, "Student record not found.", 404);
      studentId = student._id;
    }

    const records = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(60);

    const total   = records.length;
    const present = records.filter(r => r.status === "Present").length;
    const absent  = records.filter(r => r.status === "Absent").length;
    const late    = records.filter(r => r.status === "Late").length;

    sendSuccess(res, { records, summary: { total, present, absent, late } });
  } catch (err) {
    next(err);
  }
};