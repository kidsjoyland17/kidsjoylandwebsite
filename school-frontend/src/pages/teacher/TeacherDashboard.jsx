import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  UsersIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  BellAlertIcon,
  BookOpenIcon,
  AcademicCapIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

/* ─── Helpers ─────────────────────────────────────────────── */
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const todayName = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" });

const fmt12 = (t = "") => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const timeToMins = (t = "") => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/* ─── Sub-components ──────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, bg, sub }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} mb-4`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-2xl font-bold text-slate-800">
      {value ?? <span className="text-slate-300">—</span>}
    </p>
    <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-blue-500 mt-1 font-medium">{sub}</p>}
  </div>
);

const QuickLink = ({ to, icon: Icon, label, desc, bg }) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
    <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
  </Link>
);

/* ─── Today's Timetable Panel ─────────────────────────────── */
const TodayTimetable = ({ timetables }) => {
  const day = todayName();
  const entry = timetables.find((t) => t.day === day);
  const classSlots = entry?.slots?.filter((s) => s.type === "class") || [];

  // find current/next period
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const current = classSlots.find(
    (s) => timeToMins(s.startTime) <= nowMins && timeToMins(s.endTime) > nowMins
  );
  const upcoming = classSlots.find((s) => timeToMins(s.startTime) > nowMins);

  if (!entry || classSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
        <CalendarDaysIcon className="w-10 h-10 text-slate-200 mb-3" />
        <p className="text-sm font-medium text-slate-400">No classes scheduled for today</p>
        <Link to="/teacher/timetable" className="text-xs text-blue-500 mt-2 hover:underline">
          View full timetable →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* current / next banner */}
      {(current || upcoming) && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 ${
          current ? "bg-emerald-50 border border-emerald-100" : "bg-blue-50 border border-blue-100"
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${current ? "bg-emerald-400" : "bg-blue-400"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${current ? "text-emerald-700" : "text-blue-700"}`}>
              {current ? "Now in session" : "Up next"}
            </p>
            <p className="text-sm font-bold text-slate-700 truncate">
              {(current || upcoming).subject || "Free period"}
            </p>
          </div>
          <span className={`text-xs font-medium flex-shrink-0 ${current ? "text-emerald-600" : "text-blue-600"}`}>
            {fmt12((current || upcoming).startTime)} – {fmt12((current || upcoming).endTime)}
          </span>
        </div>
      )}

      {/* all class slots */}
      <div className="divide-y divide-slate-50">
        {classSlots.map((slot) => {
          const isCurrent =
            timeToMins(slot.startTime) <= nowMins &&
            timeToMins(slot.endTime) > nowMins;
          const isPast = timeToMins(slot.endTime) <= nowMins;
          return (
            <div
              key={slot.period}
              className={`flex items-center gap-3 py-2.5 px-1 transition-colors ${
                isCurrent ? "opacity-100" : isPast ? "opacity-40" : "opacity-100"
              }`}
            >
              <span className="w-6 text-xs font-bold text-slate-400 text-center flex-shrink-0">
                P{slot.period}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {slot.subject || <span className="text-slate-400 font-normal italic">No subject</span>}
                </p>
                <p className="text-xs text-slate-400">
                  {fmt12(slot.startTime)} – {fmt12(slot.endTime)}
                </p>
              </div>
              {isCurrent && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full flex-shrink-0">
                  Now
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Notices Panel ───────────────────────────────────────── */
const NoticeItem = ({ notice }) => {
  const date = notice.date
    ? new Date(notice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MegaphoneIcon className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{notice.title}</p>
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{notice.message}</p>
        <div className="flex items-center gap-2 mt-1">
          {notice.targetClass && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              <AcademicCapIcon className="w-3 h-3" />
              {notice.targetClass}
            </span>
          )}
          {date && <span className="text-xs text-slate-400">{date}</span>}
        </div>
      </div>
    </div>
  );
};

/* ─── Classes Summary ─────────────────────────────────────── */
const ClassesSummary = ({ classes, loading }) => {
  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (!classes.length) {
    return <p className="text-sm text-slate-400 italic">No classes assigned yet.</p>;
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {classes.map((cls) => (
        <span
          key={cls}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100"
        >
          <BookOpenIcon className="w-3.5 h-3.5" />
          Class {cls}
        </span>
      ))}
    </div>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────── */
export default function TeacherDashboard() {
  const { user } = useAuth();

  const [stats,      setStats]      = useState(null);
  const [classes,    setClasses]    = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [notices,    setNotices]    = useState([]);
  const [teacherId,  setTeacherId]  = useState(null);

  const [loadingStats,     setLoadingStats]     = useState(true);
  const [loadingClasses,   setLoadingClasses]   = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [loadingNotices,   setLoadingNotices]   = useState(true);

  /* ── 1. Stats + classes (fast, parallel) ── */
  useEffect(() => {
    Promise.all([
      api.get("/teacher/dashboard"),
      api.get("/teacher/classes"),
    ])
      .then(([statsRes, classRes]) => {
        setStats(statsRes.data.data);
        setClasses(classRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => {
        setLoadingStats(false);
        setLoadingClasses(false);
      });
  }, []);

  /* ── 2. Profile → get teacher _id → fetch timetable ── */
  useEffect(() => {
    api.get("/teacher/profile")
      .then((r) => {
        const id = r.data.data?._id;
        setTeacherId(id);
        if (id) return api.get(`/timetable/teacher/${id}`);
        return { data: { data: [] } };
      })
      .then((r) => setTimetables(r?.data?.data || []))
      .catch(console.error)
      .finally(() => setLoadingTimetable(false));
  }, []);

  /* ── 3. Notices ── */
  useEffect(() => {
    api.get("/notices")
      .then((r) => setNotices(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoadingNotices(false));
  }, []);

  /* ── Derived ── */
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "Teacher";

  // sort timetables by day order for display
  const sortedTimetables = [...timetables].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{today}</p>
        </div>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          <AcademicCapIcon className="w-4 h-4" />
          My Classes
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-32 animate-pulse">
              <div className="w-11 h-11 bg-slate-100 rounded-xl mb-4" />
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          <StatCard
            icon={CheckCircleIcon}
            label="Present Today"
            value={stats?.presentToday}
            bg="bg-emerald-500"
            sub={stats?.totalStudents ? `of ${stats.totalStudents} students` : null}
          />
          <StatCard
            icon={ExclamationCircleIcon}
            label="Absent Today"
            value={stats?.absentToday}
            bg="bg-rose-500"
          />
          <StatCard
            icon={ClockIcon}
            label="Attendance Rate"
            value={stats?.attendanceRate != null ? `${stats.attendanceRate}%` : null}
            bg="bg-amber-500"
            sub="This month"
          />
        </div>
      )}

      {/* ── My Classes strip ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-slate-400" />
            Assigned Classes
          </h2>
          <Link to="/teacher/classes" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>
        <ClassesSummary classes={classes} loading={loadingClasses} />
      </div>

      {/* ── Main two-column body ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left col: Quick Actions + Notices */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </h2>
            <QuickLink
              to="/teacher/classes"
              icon={AcademicCapIcon}
              label="My Classes"
              desc="View students in your classes"
              bg="bg-blue-500"
            />
            <QuickLink
              to="/teacher/timetable"
              icon={CalendarDaysIcon}
              label="My Timetable"
              desc="View your full weekly schedule"
              bg="bg-sky-500"
            />
            <QuickLink
              to="/teacher/notices"
              icon={BellAlertIcon}
              label="Notices"
              desc="School announcements & alerts"
              bg="bg-amber-500"
            />
            <QuickLink
              to="/teacher/profile"
              icon={UserCircleIcon}
              label="My Profile"
              desc="Update your details"
              bg="bg-slate-500"
            />
          </div>
        </div>

        {/* Right col: Today's Timetable + Notices */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's timetable */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Today's Schedule</h2>
                <p className="text-xs text-slate-400 mt-0.5">{todayName()}</p>
              </div>
              <Link
                to="/teacher/timetable"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Full timetable →
              </Link>
            </div>
            <div className="px-5 py-4">
              {loadingTimetable ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-6 h-3 bg-slate-100 rounded" />
                      <div className="flex-1 h-8 bg-slate-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <TodayTimetable timetables={sortedTimetables} />
              )}
            </div>
          </div>

          {/* Recent Notices */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BellAlertIcon className="w-4 h-4 text-amber-500" />
                Recent Notices
              </h2>
              <Link
                to="/teacher/notices"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="px-5 py-2">
              {loadingNotices ? (
                <div className="space-y-3 py-3 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BellAlertIcon className="w-10 h-10 text-slate-200 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No notices yet</p>
                </div>
              ) : (
                <div>
                  {notices.slice(0, 5).map((n) => (
                    <NoticeItem key={n._id} notice={n} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}