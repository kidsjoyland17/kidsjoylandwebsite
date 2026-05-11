import mongoose from "mongoose";
import { CLASS_LIST } from "../constants/classes.js";

const passoutSchema = new mongoose.Schema(
  {
    // ─── Link to original Student doc (preserved even after student is removed) ───
    originalStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    // ─── Snapshot of student data at time of passout ─────────────────────────────
    name:         { type: String, required: true, trim: true },
    rollNo:       { type: String, trim: true, default: "" },
    gender:       { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    dob:          { type: Date },
    photo:        { type: String, default: "" },
    address:      { type: String, trim: true, default: "" },
    parentName:   { type: String, trim: true, default: "" },
    parentPhone:  { type: String, trim: true, default: "" },

    // ─── Academic details ─────────────────────────────────────────────────────────
    finalClass: {
      type: String,
      enum: CLASS_LIST,
      required: [true, "Final class is required"],
    },
    passoutYear: {
      type: Number,
      required: [true, "Passout year is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [2100, "Year too far in the future"],
    },
    reason: {
      type: String,
      enum: ["Completed", "Transfer", "Dropout", "Other"],
      default: "Completed",
    },
    remarks: { type: String, trim: true, default: "" },

    // ─── Certificate ──────────────────────────────────────────────────────────────
    certificateNo: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple null values
      trim: true,
    },
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: { type: Date },

    // ─── Audit trail ─────────────────────────────────────────────────────────────
    passedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
passoutSchema.index({ name: "text", parentName: "text" }); // full-text search
passoutSchema.index({ passoutYear: -1, finalClass: 1 });    // filter by year + class
                 // certificate lookup

const Passout = mongoose.model("Passout", passoutSchema);
export default Passout;