import Student from "../models/Student.model.js";
import Passout from "../models/Passout.model.js";
import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ── POST /api/admin/passout/:studentId ──────────────────────────────────────
/**
 * Moves a student to the passout archive.
 * Steps:
 *   1. Snapshot student data → create Passout record
 *   2. Deactivate their User account (if any)
 *   3. Delete all Attendance records for this student
 *   4. Delete the Student document
 *
 * Body: { passoutYear, reason?, remarks? }
 */
export const passoutStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return sendError(res, "Student not found", 404);

    const { passoutYear, reason, remarks } = req.body;

    if (!passoutYear)
      return sendError(res, "passoutYear is required", 400);

    const year = Number(passoutYear);
    if (isNaN(year) || year < 2000 || year > 2100)
      return sendError(res, "passoutYear must be a valid year (2000–2100)", 400);

    // Generate unique certificate number
    let certificateNo = req.body.certificateNo?.trim();
    if (!certificateNo) {
      const suffix = student.rollNo
        ? student.rollNo.toString().padStart(4, "0")
        : student._id.toString().slice(-6).toUpperCase();
      certificateNo = `CERT-${year}-${suffix}`;
    }

    // Create the passout record (snapshot)
    const record = await Passout.create({
      originalStudentId: student._id,
      name: student.name,
      rollNo: student.rollNo || "",
      gender: student.gender || "",
      dob: student.dob || null,
      photo: student.photo || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      finalClass: student.class,
      passoutYear: year,
      reason: reason || "Completed",
      remarks: remarks || "",
      certificateNo,
      passedOutBy: req.user.id,
    });

    // Deactivate linked User account so they can no longer log in
    if (student.user) {
      await User.findByIdAndUpdate(student.user, { isActive: false });
    }

    // Cascade delete attendance records
    await Attendance.deleteMany({ student: student._id });

    // Remove from active student list
    await student.deleteOne();

    sendSuccess(res, record, "Student passed out and archived successfully", 201);
  } catch (err) {
    // Handle duplicate certificate number (very rare)
    if (err.code === 11000) {
      return sendError(
        res,
        "A passout record with this certificate number already exists. Check if the student was already passed out.",
        409
      );
    }
    next(err);
  }
};

// ── GET /api/admin/passout ──────────────────────────────────────────────────
/**
 * List all passout records.
 * Query params:
 *   - year        : filter by passoutYear (number)
 *   - finalClass  : filter by class
 *   - reason      : filter by reason (Completed/Transfer/Dropout/Other)
 *   - search      : full-text search on name / parentName
 *   - page        : page number (default 1)
 *   - limit       : results per page (default 20, max 100)
 */
export const getAllPassouts = async (req, res, next) => {
  try {
    const {
      year, finalClass, reason, search,
      page = 1, limit = 20,
    } = req.query;

    const filter = {};
    if (year) filter.passoutYear = Number(year);
    if (finalClass) filter.finalClass = finalClass;
    if (reason) filter.reason = reason;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { parentName: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [total, records] = await Promise.all([
      Passout.countDocuments(filter),
      Passout.find(filter)
        .sort({ passoutYear: -1, name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("passedOutBy", "name email")
        .lean(),
    ]);

    sendSuccess(res, {
      records,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/passout/years ────────────────────────────────────────────
/**
 * Returns the distinct passout years available — useful for the year filter
 * dropdown in the frontend.
 */
export const getPassoutYears = async (req, res, next) => {
  try {
    const years = await Passout.distinct("passoutYear");
    years.sort((a, b) => b - a); // newest first
    sendSuccess(res, years);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/passout/:id ──────────────────────────────────────────────
/**
 * Get a single passout record by its _id.
 */
export const getPassoutById = async (req, res, next) => {
  try {
    const record = await Passout.findById(req.params.id)
      .populate("passedOutBy", "name email")
      .lean();

    if (!record) return sendError(res, "Passout record not found", 404);

    sendSuccess(res, record);
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/passout/:id ────────────────────────────────────────────
/**
 * Update a passout record.
 * Allowed fields: remarks, certificateIssued
 * (Core data like name/year is intentionally locked after creation.)
 */
export const updatePassout = async (req, res, next) => {
  try {
    const { remarks, certificateIssued } = req.body;

    const update = {};
    if (remarks !== undefined) update.remarks = remarks;
    if (certificateIssued !== undefined) {
      update.certificateIssued = Boolean(certificateIssued);
      if (certificateIssued) update.certificateIssuedAt = new Date();
    }

    if (!Object.keys(update).length)
      return sendError(res, "Nothing to update. Provide remarks or certificateIssued.", 400);

    const record = await Passout.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate("passedOutBy", "name email");

    if (!record) return sendError(res, "Passout record not found", 404);

    sendSuccess(res, record, "Passout record updated");
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/passout/:id ───────────────────────────────────────────
/**
 * Permanently delete a passout record.
 * Use with caution — this removes the archive entry.
 */
export const deletePassout = async (req, res, next) => {
  try {
    const record = await Passout.findByIdAndDelete(req.params.id);
    if (!record) return sendError(res, "Passout record not found", 404);
    sendSuccess(res, null, "Passout record permanently deleted");
  } catch (err) {
    next(err);
  }
};