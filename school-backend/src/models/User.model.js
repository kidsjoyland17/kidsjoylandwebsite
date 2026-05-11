import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true },
    email:    { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role:     { type: String, enum: ["admin", "teacher", "student"], default: "student" },
    avatar:   { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // ── Forgot password fields ──
    passwordResetOTP:         { type: String },   // bcrypt-hashed OTP
    passwordResetOTPExpiry:   { type: Date },
    passwordResetToken:       { type: String },   // sha256-hashed token (issued after OTP verified)
    passwordResetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password helper
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);