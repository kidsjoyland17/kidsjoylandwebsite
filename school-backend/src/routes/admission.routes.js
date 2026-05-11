import express from "express";
import multer from "multer";
import Admission from "../models/Admission.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/admission
router.post("/", upload.any(), async (req, res) => {
  try {
    const {
      childName,
      applyingFor,
      childDob,
      childGender,
      parentPhone,
      parentEmail,
      address,
      year,
      admissionType,
      fatherName,
      motherName,
    } = req.body;

    // Validate all required fields
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

    // Phone: exactly 10 digits
    if (!/^\d{10}$/.test(parentPhone))
      return sendError(res, "Phone number must be exactly 10 digits.", 400);

    // Duplicate check using correct field names
    const exists = await Admission.findOne({ parentEmail, applyingFor });
    if (exists)
      return sendError(
        res,
        "An application for this class already exists with this email.",
        409
      );

    const doc = await Admission.create({
      childName,
      applyingFor,
      childDob,
      childGender,
      parentPhone,
      parentEmail,
      address,
      year,
      admissionType,
      fatherName,
      motherName,
    });

    sendSuccess(res, doc, "Application submitted successfully.", 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(", ");
      return sendError(res, msg, 400);
    }
    sendError(res, "Server error", 500);
  }
});

export default router;