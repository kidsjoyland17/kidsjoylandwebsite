import ClassSubject from '../models/ClassSubject.model.js';
import { getDefaultSubjects } from '../constants/classSubjects.js';
import Student from "../models/Student.model.js";
import Teacher from "../models/Teacher.model.js";
import User from "../models/User.model.js";
import Admission from "../models/Admission.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
import Message from "../models/Message.model.js";
import Attendance from "../models/Attendance.model.js";
import { CLASS_LIST } from "../constants/classes.js";
/* ─── Dashboard ──────────────────────────────────────────── */
export const getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, pendingAdmissions, newMessages, classCounts, recentAdmissions] =
      await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Admission.countDocuments({ status: "pending" }),
        Message.countDocuments({ read: false }),
        Student.aggregate([{ $group: { _id: "$class", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
        Admission.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    sendSuccess(res, { totalStudents, totalTeachers, pendingAdmissions, newMessages, classCounts, recentAdmissions });
  } catch (err) { next(err); }
};

/* ─── Students ────────────────────────────────────────────── */
export const getAllStudents = async (req, res, next) => {
  try {
    const { class: cls, section, search, page = 1, limit = 100 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const filter = {};

    if (cls) filter.class = cls;
    if (section) filter.section = section;           // ← NEW: section filter
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { parentName: { $regex: search, $options: "i" } },
    ];

    const [students, totalCount] = await Promise.all([
      Student.find(filter)
        .sort({ class: 1, section: 1, name: 1 })     // ← sort by section too
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Student.countDocuments(filter),                 // ← NEW: return total for pagination
    ]);

    sendSuccess(res, {
      students,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      page: pageNum,
    });
  } catch (err) { next(err); }
};

export const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    sendSuccess(res, student, "Student created successfully", 201);
  } catch (err) { next(err); }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!student) return sendError(res, "Student not found", 404);
    sendSuccess(res, student, "Student updated");
  } catch (err) { next(err); }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return sendError(res, "Student not found", 404);
    sendSuccess(res, null, "Student deleted");
  } catch (err) { next(err); }
};

/* ─── Section Assignment ─────────────────────────────────── */

/**
 * PATCH /admin/students/:id/section
 * Body: { section: "A" | "B" | "C" | "D" }
 * Assigns (or changes) the section for a single student.
 */
export const assignStudentSection = async (req, res, next) => {
  try {
    const { section } = req.body;
    const VALID = ["A", "B", "C", "D"];

    if (!section || !VALID.includes(section))
      return sendError(res, `section must be one of: ${VALID.join(", ")}`, 400);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { section },
      { new: true, runValidators: true }
    );
    if (!student) return sendError(res, "Student not found", 404);

    sendSuccess(res, student, `Student assigned to Section ${section}`);
  } catch (err) { next(err); }
};

/**
 * PATCH /admin/students/bulk-assign-section
 * Body: { studentIds: [...], section: "A" | "B" | "C" | "D" }
 * Assigns all listed students to the same section.
 */
export const bulkAssignSection = async (req, res, next) => {
  try {
    const { studentIds, section } = req.body;
    const VALID = ["A", "B", "C", "D"];

    if (!section || !VALID.includes(section))
      return sendError(res, `section must be one of: ${VALID.join(", ")}`, 400);

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return sendError(res, "studentIds must be a non-empty array", 400);

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { section } }
    );

    sendSuccess(
      res,
      { modifiedCount: result.modifiedCount, section },
      `${result.modifiedCount} student(s) assigned to Section ${section}`
    );
  } catch (err) { next(err); }
};

/**
 * GET /admin/classes/:className/section-summary
 * Returns student counts per section for a given class.
 */
export const getClassSectionSummary = async (req, res, next) => {
  try {
    const { className } = req.params;

    const counts = await Student.aggregate([
      { $match: { class: className } },
      { $group: { _id: "$section", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Always return all 4 sections even if empty
    const SECTIONS = ["A", "B", "C", "D"];
    const summary = SECTIONS.map((s) => ({
      section: s,
      count: counts.find((c) => c._id === s)?.count ?? 0,
    }));

    sendSuccess(res, { className, summary });
  } catch (err) { next(err); }
};

/* ─── Teachers ────────────────────────────────────────────── */
export const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find()
      .populate("user", "-password")
      .sort({ createdAt: -1 })
      .lean();
    sendSuccess(res, teachers);
  } catch (err) { next(err); }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, phone, subject, qualification, experience, address } = req.body;

    if (!name || !email || !password)
      return sendError(res, "Name, email and password are required", 400);

    const exists = await User.findOne({ email });
    if (exists) return sendError(res, "Email already registered", 400);

    const user = await User.create({ name, email, password, role: "teacher" });
    const teacher = await Teacher.create({ user: user._id, phone, subject, qualification, experience, address });
    const populated = await teacher.populate("user", "-password");
    sendSuccess(res, populated, "Teacher created successfully", 201);
  } catch (err) { next(err); }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { name, email, password, phone, subject, qualification, experience, address } = req.body;

    const teacher = await Teacher.findById(req.params.id).populate("user");
    if (!teacher) return sendError(res, "Teacher not found", 404);

    if (name) teacher.user.name = name;
    if (email) teacher.user.email = email;
    if (password) teacher.user.password = password;
    await teacher.user.save();

    if (phone !== undefined) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    if (address !== undefined) teacher.address = address;
    await teacher.save();

    const updated = await Teacher.findById(teacher._id).populate("user", "-password");
    sendSuccess(res, updated, "Teacher updated");
  } catch (err) { next(err); }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return sendError(res, "Teacher not found", 404);
    await User.findByIdAndDelete(teacher.user);
    await teacher.deleteOne();
    sendSuccess(res, null, "Teacher deleted");
  } catch (err) { next(err); }
};

/* ─── Admissions ─────────────────────────────────────────── */
export const getAllAdmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const admissions = await Admission.find(filter).sort({ createdAt: -1 }).lean();
    sendSuccess(res, admissions);
  } catch (err) { next(err); }
};

export const updateAdmissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "approved", "rejected", "waitlisted"];
    if (!allowed.includes(status)) return sendError(res, "Invalid status", 400);
    const admission = await Admission.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
    if (!admission) return sendError(res, "Admission not found", 404);
    sendSuccess(res, admission, "Status updated");
  } catch (err) { next(err); }
};

export const deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return sendError(res, "Admission not found", 404);
    sendSuccess(res, null, "Admission deleted");
  } catch (err) { next(err); }
};

/* ─── Messages ───────────────────────────────────────────── */
export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    sendSuccess(res, messages);
  } catch (err) { next(err); }
};

export const markMessageRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { returnDocument: "after" });
    if (!message) return sendError(res, "Message not found", 404);
    sendSuccess(res, message, "Marked as read");
  } catch (err) { next(err); }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return sendError(res, "Message not found", 404);
    sendSuccess(res, null, "Message deleted");
  } catch (err) { next(err); }
};

/* ─── Classes ────────────────────────────────────────────── */
export const getAllClasses = async (req, res, next) => {
  try {
    const [classCounts, teachers] = await Promise.all([
      Student.aggregate([
        { $group: { _id: "$class", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Teacher.find({ "assignedClasses.0": { $exists: true } })
        .populate("user", "name email")
        .lean(),
    ]);

    const classTeacherMap = {};
    teachers.forEach((t) => {
      t.assignedClasses.forEach(({ className, subject }) => {
        if (!classTeacherMap[className]) classTeacherMap[className] = [];
        classTeacherMap[className].push({
          _id: t._id,
          name: t.user?.name,
          email: t.user?.email,
          subject,
        });
      });
    });

    const classSet = new Set(classCounts.map((c) => c._id));
    const classes = classCounts.map((c) => ({
      name: c._id,
      studentCount: c.count,
      teachers: classTeacherMap[c._id] || [],
    }));

    Object.keys(classTeacherMap).forEach((className) => {
      if (!classSet.has(className)) {
        classes.push({
          name: className,
          studentCount: 0,
          teachers: classTeacherMap[className],
        });
      }
    });

    classes.sort((a, b) => {
      const aNum = parseInt(a.name);
      const bNum = parseInt(b.name);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return String(a.name).localeCompare(String(b.name));
    });

    sendSuccess(res, { classes, totalClasses: classes.length });
  } catch (err) { next(err); }
};

export const assignTeacherToClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { teacherId, subject } = req.body;

    if (!teacherId || !subject)
      return sendError(res, "teacherId and subject are required", 400);

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return sendError(res, "Teacher not found", 404);

    const conflict = await Teacher.findOne({
      _id: { $ne: teacher._id },
      assignedClasses: { $elemMatch: { className, subject } },
    });
    if (conflict) {
      return sendError(
        res,
        `Another teacher already teaches ${subject} in Class ${className}`,
        409
      );
    }

    const existing = teacher.assignedClasses.find((a) => a.className === className);
    if (existing) {
      existing.subject = subject;
    } else {
      teacher.assignedClasses.push({ className, subject });
    }

    await teacher.save();
    const updated = await Teacher.findById(teacher._id).populate("user", "-password");
    sendSuccess(res, updated, "Teacher assigned to class");
  } catch (err) { next(err); }
};

export const removeTeacherFromClass = async (req, res, next) => {
  try {
    const { className, teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return sendError(res, "Teacher not found", 404);

    teacher.assignedClasses = teacher.assignedClasses.filter(
      (a) => a.className !== className
    );
    await teacher.save();

    sendSuccess(res, null, "Teacher removed from class");
  } catch (err) { next(err); }
};

export const getClassStudents = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { section } = req.query;                 // ← optional section filter
    const filter = { class: className };
    if (section) filter.section = section;

    const students = await Student.find(filter).sort({ section: 1, name: 1 }).lean();
    sendSuccess(res, students);
  } catch (err) { next(err); }
};

// ── Legacy shim ───────────────────────────────────────────────────────────────
export const assignClassToTeacher = assignTeacherToClass;

/* ─── Class Subjects ──────────────────────────────────────────────────────── */
export const getClassSubjects = async (req, res, next) => {
  try {
    const { className } = req.params;
    const doc = await ClassSubject.findOne({ className }).lean();
    const subjects = doc?.subjects?.length ? doc.subjects : getDefaultSubjects(className);
    const isCustom = !!(doc?.subjects?.length);
    sendSuccess(res, { className, subjects, isCustom });
  } catch (err) { next(err); }
};

export const updateClassSubjects = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { subjects } = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0)
      return sendError(res, "subjects must be a non-empty array", 400);
    const doc = await ClassSubject.findOneAndUpdate(
      { className },
      { subjects, lastUpdatedBy: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    sendSuccess(res, { className, subjects: doc.subjects, isCustom: true }, "Subjects updated");
  } catch (err) { next(err); }
};

export const addSubjectToClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { subject } = req.body;
    if (!subject?.trim()) return sendError(res, "subject is required", 400);
    const subjectName = subject.trim();
    let doc = await ClassSubject.findOne({ className });
    const currentSubjects = doc?.subjects?.length ? doc.subjects : getDefaultSubjects(className);
    if (currentSubjects.some((s) => s.toLowerCase() === subjectName.toLowerCase()))
      return sendError(res, `"${subjectName}" already exists in Class ${className}`, 409);
    const newList = [...currentSubjects, subjectName];
    doc = await ClassSubject.findOneAndUpdate(
      { className },
      { subjects: newList, lastUpdatedBy: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    sendSuccess(res, { className, subjects: doc.subjects, isCustom: true }, `"${subjectName}" added`);
  } catch (err) { next(err); }
};

export const removeSubjectFromClass = async (req, res, next) => {
  try {
    const { className, subject } = req.params;
    const subjectName = decodeURIComponent(subject).trim();
    let doc = await ClassSubject.findOne({ className });
    const currentSubjects = doc?.subjects?.length ? doc.subjects : getDefaultSubjects(className);
    if (!currentSubjects.some((s) => s.toLowerCase() === subjectName.toLowerCase()))
      return sendError(res, `"${subjectName}" not found in Class ${className}`, 404);
    const newList = currentSubjects.filter((s) => s.toLowerCase() !== subjectName.toLowerCase());
    doc = await ClassSubject.findOneAndUpdate(
      { className },
      { subjects: newList, lastUpdatedBy: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    sendSuccess(res, { className, subjects: doc.subjects, isCustom: true }, `"${subjectName}" removed`);
  } catch (err) { next(err); }
};

export const resetClassSubjects = async (req, res, next) => {
  try {
    const { className } = req.params;
    await ClassSubject.findOneAndDelete({ className });
    const subjects = getDefaultSubjects(className);
    sendSuccess(res, { className, subjects, isCustom: false }, "Subjects reset to defaults");
  } catch (err) { next(err); }
};

/* ─── Attendance ─────────────────────────────────────────── */
export const getAdminAttendance = async (req, res, next) => {
  try {
    const { date, class: cls } = req.query;
    const query = {};

    if (cls) query.class = cls;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate("student", "name class")
      .lean();

    sendSuccess(res, records, "Attendance fetched");
  } catch (err) { next(err); }
};

export const markAdminAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0)
      return sendError(res, "Date and records array are required", 400);

    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const studentIds = records.map(r => r.student);
    const students = await Student.find({ _id: { $in: studentIds } })
      .select("_id class").lean();

    const classMap = {};
    students.forEach(s => { classMap[s._id.toString()] = s.class; });

    const upsertOps = records.map(({ student, status }) => ({
      updateOne: {
        filter: { student, date: { $gte: start, $lte: end } },
        update: {
          $set: {
            student,
            status,
            date: start,
            teacher: req.user.id,
            class: classMap[student] || "",
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(upsertOps);
    sendSuccess(res, null, "Attendance saved successfully");
  } catch (err) { next(err); }
};


/* ─── Meta ───────────────────────────────────────────────── */
export const getMetaClasses = async (req, res, next) => {
  try {
    sendSuccess(res, CLASS_LIST);
  } catch (err) { next(err); }
};