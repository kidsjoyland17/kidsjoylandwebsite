import mongoose from "mongoose";

export const SECTIONS = ["A", "B", "C", "D"];

const studentSchema = new mongoose.Schema(
  {
    // ✅ Bug #9 fix — link Student to a User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,   // null = student has no login account yet (admin-created)
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
    // Section A / B / C / D — admin assigns, defaults to "A"
    section: {
      type: String,
      enum: [...SECTIONS, ""],
      default: "A",
      trim: true,
    },
    rollNo:      { type: String, trim: true },
    gender:      { type: String, enum: ["Male", "Female", "Other", ""] },
    dob:         { type: Date },
    parentName:  { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    address:     { type: String, trim: true },
    photo:       { type: String },
  },
  { timestamps: true }
);

studentSchema.index({ name: "text", parentName: "text" });
studentSchema.index({ user: 1 });
studentSchema.index({ class: 1, section: 1 }); // fast class+section queries

const Student = mongoose.model("Student", studentSchema);
export default Student;