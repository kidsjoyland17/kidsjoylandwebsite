export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_TEACHERS: "/admin/teachers",
  ADMIN_ADMISSIONS: "/admin/admissions",
  ADMIN_MESSAGES: "/admin/messages",
  ADMIN_BANNERS: "/admin/banners",
  ADMIN_GALLERY: "/admin/gallery",
  ADMIN_NOTICES: "/admin/notices",
  ADMIN_CLASSES: "/admin/classes",
  ADMIN_ATTENDANCE: "/admin/attendance",
  ADMIN_TIMETABLE: "/admin/timetable",   // ← ADD
  ADMIN_PASSOUTS: "/admin/passouts",     // ← ADD
  ADMIN_RESULTS: "/admin/results",
  ADMIN_ABOUT: "/admin/about", // ← ADD
  ADMIN_TESTIMONIALS: "/admin/testimonial", // ← ADD
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_TIMETABLE: "/teacher/timetable",
  TEACHER_PROFILE: "/teacher/profile",
  TEACHER_NOTICES: "/teacher/notices",
  TEACHER_CLASSES: "/teacher/classes",
};

export const ADMIN_NAV = [

  { key: "dashboard", label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
  { key: "students", label: "Students", path: ROUTES.ADMIN_STUDENTS },
  { key: "teachers", label: "Teachers", path: ROUTES.ADMIN_TEACHERS },
  { key: "admissions", label: "Admissions", path: ROUTES.ADMIN_ADMISSIONS },
  { key: "notices", label: "Notices", path: ROUTES.ADMIN_NOTICES },
  { key: "timetable", label: "Timetable", path: ROUTES.ADMIN_TIMETABLE }, // ← ADD
  { key: "messages", label: "Messages", path: ROUTES.ADMIN_MESSAGES },
  { key: "banners", label: "Banners", path: ROUTES.ADMIN_BANNERS },
  { key: "gallery", label: "Gallery", path: ROUTES.ADMIN_GALLERY },
  { key: "classes", label: "Classes", path: ROUTES.ADMIN_CLASSES },
  { key: "attendance", label: "Attendance", path: ROUTES.ADMIN_ATTENDANCE },
  { key: "passouts", label: "Passouts", path: ROUTES.ADMIN_PASSOUTS },
  { key: "results", label: "Results", path: ROUTES.ADMIN_RESULTS },
  { key: "about", label: "About", path: ROUTES.ADMIN_ABOUT }, // ← ADD
  { key: "testimonials", label: "Testimonials", path: ROUTES.ADMIN_TESTIMONIALS }, // ← ADD
];

export const TEACHER_NAV = [

  { key: "dashboard", label: "Dashboard", path: ROUTES.TEACHER_DASHBOARD },
  { key: "timetable", label: "Timetable", path: ROUTES.TEACHER_TIMETABLE },
  { key: "notices", label: "Notices", path: ROUTES.TEACHER_NOTICES },
  { key: "profile", label: "My Profile", path: ROUTES.TEACHER_PROFILE },
  { key: "classes", label: "My Classes", path: ROUTES.TEACHER_CLASSES },

];

export const CLASSES = [
  "Pre-Nursery",
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10",

];