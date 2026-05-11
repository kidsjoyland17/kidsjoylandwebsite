import Teacher from "../models/Teacher.model.js";
import Student from "../models/Student.model.js";
import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ─── GET /api/teacher/profile ────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).populate("user", "name email");

    if (!teacher) {
      return sendSuccess(res, {
        user: { name: req.user.name, email: req.user.email },
        phone: null,
        subject: null,
        qualification: null,
        bio: null,
        experience: 0,
        address: null,
        joiningDate: null,
        teacherId: null,
        assignedClasses: [],        // ✅ B-06: was assignedClass (singular)
        profileCompleted: false,
      }, "Profile fetched");
    }

    return sendSuccess(res, {
      ...teacher.toObject(),
      user: {
        name: teacher.user?.name,
        email: teacher.user?.email,
      },
    }, "Profile fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ─── PUT /api/teacher/profile ────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { phone, subject, qualification, bio, experience, address } = req.body;

    let teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      teacher = new Teacher({ user: req.user.id });
    }

    if (phone !== undefined) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (bio !== undefined) teacher.bio = bio;
    if (experience !== undefined) teacher.experience = Number(experience);
    if (address !== undefined) teacher.address = address;

    if (teacher.phone && teacher.subject && teacher.qualification) {
      teacher.profileCompleted = true;
    }

    await teacher.save();

    const populated = await Teacher.findById(teacher._id).populate("user", "name email");

    return sendSuccess(res, {
      ...populated.toObject(),
      user: {
        name: populated.user?.name,
        email: populated.user?.email,
      },
    }, "Profile updated successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ─── GET /api/teacher/classes ─────────────────────────────────────────────────
export const getMyClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });

    // ✅ B-06: was teacher.assignedClass (singular String, no longer exists)
    const classes = teacher?.assignedClasses?.map(a => a.className) || [];
    return sendSuccess(res, [...new Set(classes)].sort(), "Classes fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ─── GET /api/teacher/dashboard ──────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });

    // ✅ B-07: was teacher.assignedClass (singular); now uses assignedClasses array
    const classFilter = teacher?.assignedClasses?.length
      ? { class: { $in: teacher.assignedClasses.map(a => a.className) } }
      : {};

    const totalStudents = await Student.countDocuments(classFilter);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      ...classFilter,
    }).lean();

    const presentToday = todayRecords.filter(r => r.status === "Present").length;
    const absentToday  = todayRecords.filter(r => r.status === "Absent").length;

    const monthStart   = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRecords = await Attendance.find({
      date: { $gte: monthStart, $lt: tomorrow },
      ...classFilter,
    }).lean();

    const attendanceRate = monthRecords.length
      ? Math.round(
          (monthRecords.filter(r => r.status === "Present").length /
            monthRecords.length) * 100
        )
      : null;

    return sendSuccess(res, {
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
    }, "Dashboard data fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// ─── GET /api/teacher/students ────────────────────────────────────────────────
export const getMyStudents = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });

    // ✅ B-07: was teacher.assignedClass (singular); now uses assignedClasses array
    const classFilter = req.query.class
      ? { class: req.query.class }
      : teacher?.assignedClasses?.length
        ? { class: { $in: teacher.assignedClasses.map(a => a.className) } }
        : {};

    const students = await Student.find(classFilter).lean();
    return sendSuccess(res, students, "Students fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};




