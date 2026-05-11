import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Teacher from "../models/Teacher.model.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { sendResetOTPEmail } from "../utils/mailer.js";

// ── POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, "Email and password are required.", 400);

    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendError(res, "Invalid email or password.", 401);

    if (!user.isActive)
      return sendError(res, "Your account has been deactivated. Contact admin.", 403);

    const match = await user.comparePassword(password);
    if (!match) return sendError(res, "Invalid email or password.", 401);

    let profileCompleted = true;
    let teacherId = null;
    if (user.role === "teacher") {
      const profile = await Teacher.findOne({ user: user._id });
      profileCompleted = profile?.profileCompleted || false;
      teacherId = profile?._id?.toString() || null;
    }

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    sendSuccess(res, {
      token, id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, profileCompleted, teacherId,
    }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "User not found.", 404);

    let profileCompleted = true;
    let teacherId = null;
    if (user.role === "teacher") {
      const profile = await Teacher.findOne({ user: user._id });
      profileCompleted = profile?.profileCompleted || false;
      teacherId = profile?._id?.toString() || null;
    }

    sendSuccess(res, {
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, profileCompleted, teacherId,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout
export const logout = (req, res) => {
  clearTokenCookie(res);
  sendSuccess(res, null, "Logged out successfully.");
};

// ── PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return sendError(res, "Both fields are required.", 400);

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return sendError(res, "User not found.", 404);

    const match = await user.comparePassword(currentPassword);
    if (!match) return sendError(res, "Current password is incorrect.", 400);

    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, "Email is required.", 400);

    const user = await User.findOne({ email });

    // Always respond the same — prevents email enumeration
    if (!user || !user.isActive)
      return sendSuccess(res, null, "If this email exists, an OTP has been sent.");

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.passwordResetOTP         = hashedOTP;
    user.passwordResetOTPExpiry   = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.passwordResetToken       = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    await sendResetOTPEmail(user.email, user.name, otp);

    sendSuccess(res, null, "If this email exists, an OTP has been sent.");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return sendError(res, "Email and OTP are required.", 400);

    const user = await User.findOne({
      email,
      passwordResetOTPExpiry: { $gt: new Date() },
    });
    if (!user) return sendError(res, "OTP has expired. Please request a new one.", 400);

    const match = await bcrypt.compare(otp, user.passwordResetOTP);
    if (!match) return sendError(res, "Invalid OTP.", 400);

    // Issue a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetOTP         = undefined;
    user.passwordResetOTPExpiry   = undefined;
    user.passwordResetToken       = hashedToken;
    user.passwordResetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    sendSuccess(res, { resetToken }, "OTP verified.");
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword)
      return sendError(res, "Token and new password are required.", 400);

    if (newPassword.length < 6)
      return sendError(res, "Password must be at least 6 characters.", 400);

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      passwordResetToken:        hashedToken,
      passwordResetTokenExpiry:  { $gt: new Date() },
    });
    if (!user) return sendError(res, "Reset session expired. Please start over.", 400);

    user.password                 = newPassword; // pre-save hook hashes it
    user.passwordResetToken       = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    sendSuccess(res, null, "Password reset successfully. Please log in.");
  } catch (err) {
    next(err);
  }
};