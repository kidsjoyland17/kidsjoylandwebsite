import { Router } from "express";
import {
  login, logout, getMe, changePassword,
  forgotPassword, verifyOTP, resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import resetLimiter from "../middleware/resetLimiter.js";

const router = Router();

router.post("/login",            login);
router.post("/logout",           logout);
router.get("/me",                protect, getMe);
router.put("/change-password",   protect, changePassword);

// ── No `protect` here — user is not logged in during password reset ──
router.post("/forgot-password",  resetLimiter, forgotPassword);
router.post("/verify-otp",       resetLimiter, verifyOTP);
router.post("/reset-password",   resetLimiter, resetPassword);

export default router;