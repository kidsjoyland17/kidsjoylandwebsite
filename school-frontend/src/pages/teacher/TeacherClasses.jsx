import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
  PhoneIcon,
  UserIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

// ─── Sub-components ───────────────────────────────────────────────────────────

const StudentCard = ({ student }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-4 flex items-start gap-4">
    {/* Avatar */}
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-sm shadow-blue-200">
      {student.name?.[0]?.toUpperCase() || "S"}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
        {student.rollNumber && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold flex-shrink-0">
            #{student.rollNumber}
          </span>
        )}
      </div>

      <div className="mt-1.5 space-y-1">
        {student.parentName && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{student.parentName}</span>
          </div>
        )}
        {student.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <PhoneIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{student.phone}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const EmptyState = ({ search, className }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
      <UsersIcon className="w-8 h-8 text-slate-300" />
    </div>
    <p className="text-sm font-medium text-slate-500">
      {search
        ? "No students match your search"
        : `No students enrolled in Class ${className}`}
    </p>
    <p className="text-xs text-slate-400 mt-1">
      {search ? "Try a different name or parent name" : "Students will appear here once enrolled"}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherClasses() {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState("name"); // "name" | "roll"

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, studentsRes] = await Promise.all([
        api.get("/teacher/profile"),
        api.get("/teacher/students"),
      ]);
      setProfile(profileRes.data.data);
      setStudents(studentsRes.data.data || []);
    } catch {
      toast.error("Failed to load class data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const assignedClass = profile?.assignedClass;

  // Filter + sort
  const filtered = students
    .filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.parentName?.toLowerCase().includes(q) ||
        String(s.rollNumber || "").includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "roll") {
        return (a.rollNumber || Infinity) - (b.rollNumber || Infinity);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const presentCount = students.length; // you can hook into attendance if needed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Class</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {assignedClass
              ? `You are assigned to Class ${assignedClass}`
              : "No class assigned yet"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors border border-slate-200"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {assignedClass && (
            <Link
              to="/teacher/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              Mark Attendance
            </Link>
          )}
        </div>
      </div>

      {/* No class assigned */}
      {!loading && !assignedClass && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <ExclamationCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">No Class Assigned</p>
            <p className="text-sm text-amber-600 mt-1">
              You haven't been assigned to a class yet. Please contact the admin to get a class assigned.
            </p>
          </div>
        </div>
      )}

      {/* Class + summary cards */}
      {(loading || assignedClass) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "My Class",
              value: loading ? null : assignedClass ? `Class ${assignedClass}` : "—",
              icon: AcademicCapIcon,
              bg: "bg-blue-500",
            },
            {
              label: "Total Students",
              value: loading ? null : students.length,
              icon: UsersIcon,
              bg: "bg-emerald-500",
            },
            {
              label: "My Subject",
              value: loading ? null : profile?.subject || "—",
              icon: AcademicCapIcon,
              bg: "bg-violet-500",
            },
            {
              label: "Experience",
              value: loading ? null : profile?.experience ? `${profile.experience} yr${profile.experience !== 1 ? "s" : ""}` : "—",
              icon: UserIcon,
              bg: "bg-amber-500",
            },
          ].map(({ label, value, icon: Icon, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {loading ? (
                <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-bold text-slate-800">{value}</p>
              )}
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Students section */}
      {(loading || assignedClass) && (
        <div className="space-y-4">
          {/* Section header + controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {loading ? (
                <span className="inline-block w-32 h-4 bg-slate-100 rounded animate-pulse" />
              ) : (
                `Students in Class ${assignedClass} (${filtered.length})`
              )}
            </h2>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students…"
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
                >
                  <option value="name">Sort: Name</option>
                  <option value="roll">Sort: Roll No.</option>
                </select>
                <FunnelIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Cards grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-4 animate-pulse">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.length === 0 ? (
                <EmptyState search={search} className={assignedClass} />
              ) : (
                filtered.map((s) => <StudentCard key={s._id} student={s} />)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}