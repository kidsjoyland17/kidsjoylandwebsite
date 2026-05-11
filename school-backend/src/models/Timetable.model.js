import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    period: { type: Number, required: true },          // 1, 2, 3 …
    startTime: { type: String, required: true },        // "08:00"
    endTime:   { type: String, required: true },        // "08:45"
    subject:   { type: String, default: "" },
    teacher:   { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    type: {
      type: String,
      enum: ["class", "break", "assembly", "free"],
      default: "class",
    },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: [true, "Class is required"],
      enum: [
       "Pre-Nursery", "Nursery", "LKG", "UKG",
        "1","2","3","4","5","6","7","8","9","10",
      ],
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    },
    slots: [slotSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One timetable document per class+day
timetableSchema.index({ class: 1, day: 1 }, { unique: true });

export default mongoose.model("Timetable", timetableSchema);