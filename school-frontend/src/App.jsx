import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import TeacherLayout from "@/components/layout/TeacherLayout";

// Public pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import HomePage from "@/pages/public/HomePage";


// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminAdmissions from "@/pages/admin/AdminAdmissions";
import AdminMessages from "@/pages/admin/AdminMessages";
import ManageBanners from "@/pages/admin/ManageBanners";
import AdminNotice from "./pages/admin/AdminNotice";
import AdminAttendance from "@/pages/admin/AdminAttendance";
import AdminPassout from "@/pages/admin/AdminPassout";
import ManageGallery from "@/pages/admin/ManageGallery"; // ✅ new gallery page
import AdminClasses from "@/pages/admin/AdminClasses";
import AdminResults from "@/pages/admin/Result/AdminResults";
import AdminTimetable from "./pages/admin/AdminTimetable";
import ManageAbout from "@/pages/admin/ManageAbout"; // ✅ new about management page
import ManageTestimonials from "@/pages/admin/ManageTestimonials"; // ✅ new testimonial management page

// Teacher pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherTimetable from "@/pages/teacher/TeacherTimetable";
import TeacherProfile from "@/pages/teacher/TeacherProfile";
import TeacherNotice from "@/pages/teacher/TeacherNotice";
import TeacherClasses from "@/pages/teacher/TeacherClasses";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}