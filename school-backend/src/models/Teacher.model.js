import mongoose from "mongoose";

const classAssignmentSchema = new mongoose.Schema(
  {
    className: { type: String, trim: true, required: true },
    subject: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    teacherId: { type: String, unique: true, sparse: true },

    // ✅ Replaced assignedClass (String) → assignedClasses (array)
    // Each entry = { className, subject } so one teacher can cover
    // multiple classes and multiple teachers can share the same class.
    assignedClasses: { type: [classAssignmentSchema], default: [] },

    phone: { type: String, trim: true },
    subject: { type: String, trim: true },   // primary / default subject
    qualification: { type: String, trim: true },
    experience: { type: Number, default: 0 },
    address: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    bio: { type: String, trim: true },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Handy virtual: is the teacher assigned to at least one class?
teacherSchema.virtual("isAssigned").get(function () {
  return this.assignedClasses.length > 0;
});

export default mongoose.model("Teacher", teacherSchema);