import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    targetClass: {
      type: String,
      required: [true, "Target class is required"],
      enum: [
        "All Classes","Nursery", "LKG", "UKG",
        "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
        
      ],
      default: "All Classes",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);