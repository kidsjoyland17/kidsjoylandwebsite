import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({
  childName:    { type: String, required: [true, "Child name is required"] },
  applyingFor:  { type: String, required: [true, "Class is required"] },
  childDob:     { type: String, required: [true, "Date of birth is required"] },
  childGender:  {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  parentPhone:  {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
  },
  parentEmail:  { type: String, required: [true, "Email is required"] },
  address:      { type: String, required: [true, "Address is required"] },
  year:         { type: String, required: [true, "Academic year is required"] },
  admissionType:{ type: String, required: [true, "Admission type is required"] },
  fatherName:   { type: String, required: [true, "Father's name is required"] },
  motherName:   { type: String, required: [true, "Mother's name is required"] },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "waitlisted"],
    default: "pending",
  },
  notes: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Admission", admissionSchema);