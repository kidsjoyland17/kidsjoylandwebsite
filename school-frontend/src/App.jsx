import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Public pages — loaded eagerly, this is what every visitor sees first
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import HomePage from "@/pages/public/HomePage";

// ── Admin & Teacher areas: code-split so a public visitor never
//    downloads the admin/teacher dashboards. Each becomes its own
//    JS chunk, fetched only when someone actually navigates there. ──
const AdminLayout        = lazy(() => import("@/components/layout/AdminLayout"));
const TeacherLayout      = lazy(() => import("@/components/layout/TeacherLayout"));

const AdminDashboard     = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminStudents      = lazy(() => import("@/pages/admin/AdminStudents"));
const AdminTeachers      = lazy(() => import("@/pages/admin/AdminTeachers"));
const AdminAdmissions    = lazy(() => import("@/pages/admin/AdminAdmissions"));
const AdminMessages      = lazy(() => import("@/pages/admin/AdminMessages"));
const ManageBanners      = lazy(() => import("@/pages/admin/ManageBanners"));
const AdminNotice        = lazy(() => import("@/pages/admin/AdminNotice"));
const AdminAttendance    = lazy(() => import("@/pages/admin/AdminAttendance"));
const AdminPassout       = lazy(() => import("@/pages/admin/AdminPassout"));
const ManageGallery      = lazy(() => import("@/pages/admin/ManageGallery"));
const AdminClasses       = lazy(() => import("@/pages/admin/AdminClasses"));
const AdminResults       = lazy(() => import("@/pages/admin/Result/AdminResults"));
const AdminTimetable     = lazy(() => import("@/pages/admin/AdminTimetable"));
const ManageAbout        = lazy(() => import("@/pages/admin/ManageAbout"));
const ManageTestimonials = lazy(() => import("@/pages/admin/ManageTestimonials"));

const TeacherDashboard   = lazy(() => import("@/pages/teacher/TeacherDashboard"));
const TeacherTimetable   = lazy(() => import("@/pages/teacher/TeacherTimetable"));
const TeacherProfile     = lazy(() => import("@/pages/teacher/TeacherProfile"));
const TeacherNotice      = lazy(() => import("@/pages/teacher/TeacherNotice"));
const TeacherClasses     = lazy(() => import("@/pages/teacher/TeacherClasses"));

function RouteLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", fontSize: 16, color: "#1a237e",
    }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteLoader />}>
        <Routes>

          {/* ── Public ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* <Route path="/admission" element={<AdmissionPage />} /> ✅ Bug #13 fixed */}

          {/* ── Admin (protected) ── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="notices" element={<AdminNotice />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="banners" element={<ManageBanners />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="passouts" element={<AdminPassout />} />
            <Route path="about" element={<ManageAbout />} /> {/* ✅ new about management page */}
            <Route path="testimonial" element={<ManageTestimonials />} /> {/* ✅ new testimonial management page */}

          </Route>

          {/* ── Teacher (protected) ── */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="notices" element={<TeacherNotice />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="classes" element={<TeacherClasses />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}