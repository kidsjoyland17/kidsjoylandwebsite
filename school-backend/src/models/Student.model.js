import mongoose from "mongoose";

export const SECTIONS = ["A", "B", "C", "D"];

const studentSchema = new mongoose.Schema(
  {
    // Link Student to a User account (null = admin-created, no login yet)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    class: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },
    section: {
      type: String,
      enum: [...SECTIONS, ""],
      default: "A",
      trim: true,
    },
    rollNo:      { type: String, trim: true, default: "" },
    gender:      { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    dob:         { type: Date,   default: null },

    // ── Bug #3 fix — fields needed for report card snapshots ──────────────
    
    fatherName:  { type: String, trim: true, default: "" },
    motherName:  { type: String, trim: true, default: "" },
    fatherPhone: { type: String, trim: true, default: "" },
    motherPhone: { type: String, trim: true, default: "" },
    admissionNo: { type: String, trim: true, default: "" },
    aadharNo:    { type: String, trim: true, default: "" },

    // ─────────────────────────────────────────────────────────────────────

    // Legacy fields kept for backward-compat
    parentName:  { type: String, trim: true, default: "" },
    parentPhone: { type: String, trim: true, default: "" },

    address: { type: String, trim: true, default: "" },
    photo:   { type: String, default: "" },
  },
  { timestamps: true }
);

studentSchema.index({ name: "text", parentName: "text", fatherName: "text" });
studentSchema.index({ user: 1 });
studentSchema.index({ class: 1, section: 1 });

const Student = mongoose.model("Student", studentSchema);
export default Student;