import mongoose from "mongoose";
import { CLASS_LIST } from "../constants/classes.js";

/**
 * Stores admin-customized subject lists per class.
 * If no document exists for a class, the backend falls back
 * to DEFAULT_SUBJECTS from constants/classSubjects.js
 */
const classSubjectSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, "Class name is required"],
      enum: CLASS_LIST,
      unique: true,       // one doc per class only
    },
    subjects: {
      type: [String],
      default: [],
      // Each subject name is trimmed and stored as-is
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Clean subject names before saving (trim whitespace, remove empty strings)
classSubjectSchema.pre("save", function () {
  this.subjects = [
    ...new Set(
      this.subjects
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    ),
  ];
});

export default mongoose.model("ClassSubject", classSubjectSchema);