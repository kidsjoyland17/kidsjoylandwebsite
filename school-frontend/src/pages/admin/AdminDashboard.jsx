import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  UsersIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// ✅ B-17: STAT_CONFIG no longer contains hardcoded sub-labels like
// "+12% this month" / "+4% this month". Those were development placeholders
// that were never replaced with real computed values — they showed up for
// every user regardless of actual data. Now only the two static labels
// ("Awaiting review", "Unread") that are genuinely static remain.
const STAT_CONFIG = [
  {
    key: "students",
    label: "Total Students",
    icon: UsersIcon,
    bgColor: "bg-blue-500",
  },
  {
    key: "teachers",
    label: "Total Teachers",
    icon: AcademicCapIcon,
    bgColor: "bg-emerald-500",
  },
  {
    key: "admissions",
    label: "Pending Admissions",
    icon: ClipboardDocumentListIcon,
    bgColor: "bg-amber-500",
    sub: "Awaiting review",
  },
  {
    key: "messages",
    label: "New Messages",
    icon: ChatBubbleLeftRightIcon,
    bgColor: "bg-rose-500",
    sub: "Unread",
  },
];

// ✅ B-21: CLASS_BAR_COLORS was an exact duplicate of CLASS_COLORS — dead code.
// Removed CLASS_BAR_COLORS entirely. One array is enough.
const CLASS_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-teal-400",
  "bg-pink-400",
];

// ✅ B-17: StatCard no longer renders trend badges for students/teachers since
// we have no real computed trend data. The sub prop is now only used for the
// static "Awaiting review" / "Unread" labels.
const StatCard = ({ icon: Icon, label, value, bgColor, sub }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
    <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    {sub && (
      <p className="text-xs text-amber-500 mt-1 font-medium">{sub}</p>
    )}
  </div>
);

const QuickSummaryItem = ({ label, value, colorClass }) => (
  <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 ${colorClass}`}>
    <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((r) => setStats(r.data.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statValues = {
    students:   stats?.totalStudents   ?? 0,
    teachers:   stats?.totalTeachers   ?? 0,
    admissions: stats?.pendingAdmissions ?? 0,
    messages:   stats?.newMessages     ?? 0,
  };

  if (error)
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">{today}</p>
        </div>
        <Link
          to="/admin/admissions"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          <ClipboardDocumentListIcon className="w-4 h-4" />
          View Admissions
        </Link>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 h-28 animate-pulse">
              <div className="w-11 h-11 bg-slate-100 rounded-xl mb-4" />
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map((s) => (
            <StatCard
              key={s.key}
              icon={s.icon}
              label={s.label}
              value={statValues[s.key]}
              bgColor={s.bgColor}
              sub={s.sub}
            />
          ))}
        </div>
      )}

      {/* Body Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-slate-400" />
              Class Distribution
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-3 bg-slate-100 rounded w-16" />
                  <div className="h-2 bg-slate-100 rounded flex-1" />
                  <div className="h-3 bg-slate-100 rounded w-6" />
                </div>
              ))
            ) : stats?.classCounts?.length > 0 ? (
              stats.classCounts.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-16 flex-shrink-0">
                    Class {c._id}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      // ✅ B-21: was CLASS_BAR_COLORS — now correctly uses CLASS_COLORS
                      className={`h-full rounded-full ${CLASS_COLORS[i % CLASS_COLORS.length]}`}
                      style={{
                        width: `${Math.min(
                          (c.count / (statValues.students || 1)) * 100,
                          100
                        )}%`,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-6 text-right flex-shrink-0">
                    {c.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ChartBarIcon className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No class data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-slate-400" />
              Recent Admissions
            </h2>
            <Link
              to="/admin/admissions"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full w-16" />
                </div>
              ))}
            </div>
          ) : stats?.recentAdmissions?.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {stats.recentAdmissions.slice(0, 6).map((a) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                      {a.childName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{a.childName}</p>
                      <p className="text-xs text-slate-400">
                        {a.parentName} &bull; Class {a.applyingFor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        a.status === "approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : a.status === "rejected"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {a.status === "approved" ? (
                        <CheckCircleIcon className="w-3 h-3" />
                      ) : a.status === "rejected" ? (
                        <ExclamationCircleIcon className="w-3 h-3" />
                      ) : (
                        <ClockIcon className="w-3 h-3" />
                      )}
                      {a.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <ClipboardDocumentCheckIcon className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-400">No recent admissions</p>
              <p className="text-xs text-slate-300 mt-1">New applications will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickSummaryItem label="Active Students"     value={statValues.students}   colorClass="border-l-blue-400" />
          <QuickSummaryItem label="Active Teachers"     value={statValues.teachers}   colorClass="border-l-emerald-400" />
          <QuickSummaryItem label="Pending Admissions"  value={statValues.admissions} colorClass="border-l-amber-400" />
          <QuickSummaryItem label="Total Classes"       value={stats?.classCounts?.length ?? 0} colorClass="border-l-violet-400" />
        </div>
      </div>
    </div>
  );
}