import Admission from "../models/Admission.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// GET /api/admin/admissions
export const getAllAdmissions = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;

    if (search) {
      filter.$or = [
        { childName:   { $regex: search, $options: "i" } },
        { fatherName:  { $regex: search, $options: "i" } },
        { motherName:  { $regex: search, $options: "i" } },
        { parentEmail: { $regex: search, $options: "i" } },
        { parentPhone: { $regex: search, $options: "i" } },
      ];
    }

    const admissions = await Admission.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, admissions);
  } catch (err) { next(err); }
};

// GET /api/admission/:id
export const getAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return sendError(res, "Admission not found.", 404);
    sendSuccess(res, admission);
  } catch (err) { next(err); }
};

// PATCH /api/admin/admissions/:id/status
export const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const VALID = ["pending", "approved", "rejected", "waitlisted"];
    if (!VALID.includes(status))
      return sendError(res, `Status must be one of: ${VALID.join(", ")}`, 400);

    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );
    if (!admission) return sendError(res, "Admission not found.", 404);
    sendSuccess(res, admission, `Status updated to ${status}.`);
  } catch (err) { next(err); }
};

// POST /api/admin/admissions  (manual entry by admin)
export const submitAdmission = async (req, res, next) => {
  try {
    const {
      childName, applyingFor, childDob, childGender,
      parentPhone, parentEmail, address, year,
      admissionType, fatherName, motherName,
    } = req.body;

    const missing = [];
    if (!childName)     missing.push("Child Name");
    if (!applyingFor)   missing.push("Class Applying For");
    if (!childDob)      missing.push("Date of Birth");
    if (!childGender)   missing.push("Gender");
    if (!parentPhone)   missing.push("Phone Number");
    if (!parentEmail)   missing.push("Email");
    if (!address)       missing.push("Address");
    if (!year)          missing.push("Academic Year");
    if (!admissionType) missing.push("Admission Type");
    if (!fatherName)    missing.push("Father's Name");
    if (!motherName)    missing.push("Mother's Name");

    if (missing.length > 0)
      return sendError(res, `Please fill required fields: ${missing.join(", ")}`, 400);

    if (!/^\d{10}$/.test(parentPhone))
      return sendError(res, "Phone number must be exactly 10 digits.", 400);

    const exists = await Admission.findOne({ parentEmail, applyingFor });
    if (exists)
      return sendError(res, "An application for this class already exists with this email.", 409);

    const admission = await Admission.create({
      childName, applyingFor, childDob, childGender,
      parentPhone, parentEmail, address, year,
      admissionType, fatherName, motherName,
    });

    sendSuccess(res, admission, "Application submitted successfully.", 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return sendError(res, msg, 400);
    }
    next(err);
  }
};

// DELETE /api/admin/admissions/:id
export const deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return sendError(res, "Admission not found.", 404);
    sendSuccess(res, null, "Admission deleted.");
  } catch (err) { next(err); }
};