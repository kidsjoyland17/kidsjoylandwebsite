import Result  from "../models/Result.model.js";
import Student from "../models/Student.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

import { DEFAULT_SUBJECTS } from "../constants/classSubjects.js"; // add at top

// Full populate string used everywhere
const STUDENT_POPULATE =
  "name rollNo class section photo fatherName motherName dob admissionNo admNo aadharNo";

// ── POST /api/admin/results  →  Create or update result ─────────────────────
export const upsertResult = async (req, res, next) => {
  try {
    const { studentId, session, ...rest } = req.body;

    if (!studentId || !session)
      return sendError(res, "studentId and session are required", 400);

    const student = await Student.findById(studentId).lean();
    if (!student) return sendError(res, "Student not found", 404);

    const resultData = {
      student:     studentId,
      session,

      // ── Snapshot fields ──────────────────────────────────────────────────
      studentName: student.name,
      rollNo:      rest.rollNo || student.rollNo || "",
      className:   student.class,
      section:     student.section || "A",
      fatherName:  student.fatherName  || "",
      motherName:  student.motherName  || "",
      dob:         student.dob         || null,
      admNo:       student.admissionNo || student.admNo || "",
      aadharNo:    student.aadharNo    || "",

      // ── Academic data ────────────────────────────────────────────────────
      subjects: rest.subjects || DEFAULT_SUBJECTS.map(s => ({ ...s })),
      englishSkills:      rest.englishSkills      || {},
      hindiSkills:        rest.hindiSkills        || {},
      attendance:         rest.attendance         || {},

      // ── Social / personality ─────────────────────────────────────────────
      classParticipation:    rest.classParticipation    || {},
      discipline:            rest.discipline            || {},
      neatness:              rest.neatness              || {},
      courteous:             rest.courteous             || {},
      responsibleDependable: rest.responsibleDependable || {},
      attitudeTeachers:      rest.attitudeTeachers      || {},

      // ── Rank ────────────────────────────────────────────────────────────
      rank: rest.rank || {},

      // ── Remarks / promotion ──────────────────────────────────────────────
      remarks:         rest.remarks         || {},
      promoted:        rest.promoted        ?? null,
      promotedToClass: rest.promotedToClass || "",
      updatedBy:       req.user.id,
    };

    const result = await Result.findOneAndUpdate(
      { student: studentId, session },
      { $set: resultData, $setOnInsert: { createdBy: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    ).populate("student", STUDENT_POPULATE);

    sendSuccess(res, result, "Result saved successfully", 201);
  } catch (err) {
    if (err.code === 11000)
      return sendError(res, "Result for this student and session already exists", 409);
    next(err);
  }
};

// ── GET /api/admin/results  →  List results with filters ────────────────────
export const getAllResults = async (req, res, next) => {
  try {
    const { session, className, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (session)   filter.session   = session;
    if (className) filter.className = className;
    if (search)    filter.studentName = { $regex: search, $options: "i" };

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [total, records] = await Promise.all([
      Result.countDocuments(filter),
      Result.find(filter)
        .sort({ className: 1, rollNo: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("student", STUDENT_POPULATE)
        .lean(),
    ]);

    sendSuccess(res, { records, total, page: pageNum, limit: limitNum });
  } catch (err) { next(err); }
};

// ── GET /api/admin/results/sessions  →  Distinct sessions ───────────────────
export const getSessions = async (req, res, next) => {
  try {
    const dbSessions = await Result.distinct("session");

    // Always include current year and next year even if no results exist yet
    const now = new Date();
    // Academic year: if month >= April, current session is this year, else last year
    const baseYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const guaranteed = [
      `${baseYear}-${baseYear + 1}`,
      `${baseYear + 1}-${baseYear + 2}`,
    ];

    const merged = Array.from(new Set([...guaranteed, ...dbSessions]));
    merged.sort((a, b) => b.localeCompare(a)); // newest first
    sendSuccess(res, merged);
  } catch (err) { next(err); }
};

// ── GET /api/admin/results/:id  →  Single result ────────────────────────────
export const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("student",              STUDENT_POPULATE)
      .populate("createdBy updatedBy",  "name")
      .lean();
    if (!result) return sendError(res, "Result not found", 404);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

// ── GET /api/admin/results/student/:studentId?session=  ─────────────────────
export const getResultByStudent = async (req, res, next) => {
  try {
    const { session } = req.query;
    const filter = { student: req.params.studentId };
    if (session) filter.session = session;

    const results = await Result.find(filter)
      .sort({ session: -1 })
      .populate("student", STUDENT_POPULATE)
      .lean();

    sendSuccess(res, results);
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/results/:id ───────────────────────────────────────────
export const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return sendError(res, "Result not found", 404);
    sendSuccess(res, null, "Result deleted successfully");
  } catch (err) { next(err); }
};


// ── GET /api/admin/results/subjects/:className ──────────────────────────────
export const getSubjectsByClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const subjectNames = DEFAULT_SUBJECTS[className];
    if (!subjectNames)
      return sendError(res, `No subjects configured for class "${className}"`, 404);

    const FM_OVERRIDES = { "Drawing": 50, "EVS/Science+S.St": 200, "EVS": 200 };
    const subjects = subjectNames.map(name => ({
      subject:   name,
      fullMarks: FM_OVERRIDES[name] ?? 100,
    }));

    sendSuccess(res, subjects);
  } catch (err) { next(err); }
};