import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./src/routes/auth.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import teacherRoutes from "./src/routes/teacher.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import { loginLimiter, contactLimiter, generalLimiter } from "./src/middleware/rateLimiter.middleware.js";
import admissionRoutes from "./src/routes/admission.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import bannerRoutes from "./src/routes/banner.routes.js";
import galleryRoutes from "./src/routes/gallery.routes.js";
import noticeRoutes from "./src/routes/notice.route.js";
import timetableRoutes from "./src/routes/timetable.routes.js";
import passoutRoutes from "./src/routes/passout.routes.js";
import resultRoutes from "./src/routes/result.routes.js";
import aboutRoutes from './src/routes/about.routes.js'
import testimonialRoutes from './src/routes/testimonial.routes.js'
const app = express();

// ── Security headers ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allows Cloudinary images to load
}));
// ────────────────────────────────────────────────────────────────

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
.split(",")
.map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
// ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiting ────────────────────────────────────────────────
app.use("/api",            generalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/messages",   contactLimiter);
// ────────────────────────────────────────────────────────────────

app.use("/api/auth",          authRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/teacher",       teacherRoutes);
app.use("/api/student",       studentRoutes);
app.use("/api/admission",     admissionRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/banners",       bannerRoutes);
app.use("/api/gallery",       galleryRoutes);
app.use("/api/notices",       noticeRoutes);
app.use("/api/timetable",     timetableRoutes);
app.use("/api/admin/passout", passoutRoutes);
app.use("/api/admin/results", resultRoutes);
app.use("/api/about", aboutRoutes);
app.use('/api/testimonials', testimonialRoutes)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorMiddleware);

export default app;