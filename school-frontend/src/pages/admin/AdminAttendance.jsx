import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const STATUS_OPTIONS = [
  { value: "Present", label: "P", full: "Present" },
  { value: "Absent",  label: "A", full: "Absent"  },
];

const statusStyle = {
  Present: { activeBg: "bg-emerald-500", activeText: "text-white", light: "bg-emerald-50", text: "text-emerald-600" },
  Absent:  { activeBg: "bg-rose-500",    activeText: "text-white", light: "bg-rose-50",    text: "text-rose-600"  },
};

function AttendanceRadio({ studentId, status, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {STATUS_OPTIONS.map(opt => (
        <label
          key={opt.value}
          title={opt.full}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all border-2 select-none ${
            status === opt.value
              ? `${statusStyle[opt.value].activeBg} ${statusStyle[opt.value].activeText} border-transparent shadow-sm`
              : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          <input
            type="radio"
            name={`att-${studentId}`}
            value={opt.value}
            checked={status === opt.value}
            onChange={() => onChange(studentId, opt.value)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function PctRow({ label, pct, color }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 0.4s" }} />
      </div>
      <span className="w-8 text-right font-medium text-slate-600">{pct}%</span>
    </div>
  );
}

export default function AdminAttendance() {
  const [classes, setClasses]             = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents]           = useState([]);
  const [attendance, setAttendance]       = useState({});
  const [markedAt, setMarkedAt]           = useState({});
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [date, setDate]                   = useState(() => new Date().toISOString().slice(0, 10));
  const [saved, setSaved]                 = useState(false);

  // ── Fetch available classes ──────────────────────────────────────────
  useEffect(() => {
    api.get("/admin/classes")
      .then(res => {
        const list = (res.data.data?.classes || []).map(c => c.name);
        setClasses(list);
        if (list.length === 1) setSelectedClass(list[0]);
      })
      .catch(() => toast.error("Failed to load classes"));
  }, []);

  // ── Fetch students when class changes ────────────────────────────────
  useEffect(() => {
    if (!selectedClass) { setStudents([]); setLoading(false); return; }
    setLoading(true);
    api.get(`/admin/classes/${encodeURIComponent(selectedClass)}/students`)
      .then(res => setStudents(res.data.data || []))
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  // ── Fetch existing attendance for date + class ───────────────────────
  const fetchAttendance = useCallback(async () => {
    if (!date || !selectedClass) return;
    setSaved(false);
    try {
      const res = await api.get(`/admin/attendance?date=${date}&class=${encodeURIComponent(selectedClass)}`);
      const existing = res.data.data || [];
      const attMap = {}, dateMap = {};
      existing.forEach(r => {
        const sid    = r.student?._id || r.student;
        attMap[sid]  = r.status;
        dateMap[sid] = r.date;
      });
      setAttendance(attMap);
      setMarkedAt(dateMap);
      if (existing.length > 0) setSaved(true);
    } catch {
      setAttendance({});
      setMarkedAt({});
    }
  }, [date, selectedClass]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setMarkedAt(prev => ({ ...prev, [studentId]: new Date().toISOString() }));
    setSaved(false);
  };

  const markAll = (status) => {
    const attMap = {}, dateMap = {};
    students.forEach(s => {
      attMap[s._id]  = status;
      dateMap[s._id] = new Date().toISOString();
    });
    setAttendance(attMap);
    setMarkedAt(dateMap);
    setSaved(false);
  };

  const handleSubmit = async () => {
    const unmarked = students.filter(s => !attendance[s._id]);
    if (unmarked.length > 0) {
      toast.warning(`${unmarked.length} student(s) not marked yet.`);
      return;
    }
    setSaving(true);
    try {
      const records = students.map(s => ({
        student: s._id,
        status:  attendance[s._id],
        date,
      }));
      await api.post("/admin/attendance", { records, date });
      toast.success("Attendance saved!");
      setSaved(true);
      fetchAttendance();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // ── Counts ────────────────────────────────────────────────────────────
  const counts = {
    Present:  students.filter(s => attendance[s._id] === "Present").length,
    Absent:   students.filter(s => attendance[s._id] === "Absent").length,
    Unmarked: students.filter(s => !attendance[s._id]).length,
  };

  const total = students.length || 1;
  const pcts = {
    Present: Math.round(counts.Present / total * 100),
    Absent:  Math.round(counts.Absent  / total * 100),
  };

  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const fmtMarked = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }) : "—";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-sm text-slate-400 mt-0.5">Mark and track daily student attendance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="text-sm focus:outline-none bg-transparent text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <AcademicCapIcon className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="text-sm focus:outline-none bg-transparent text-slate-700 pr-1"
            >
              <option value="">Select class</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date + class context label */}
      {selectedClass && date && (
        <p className="text-xs text-slate-400">
          Showing attendance for{" "}
          <span className="font-medium text-slate-600">{displayDate}</span>
          {" — "}Class <span className="font-medium text-slate-600">{selectedClass}</span>
        </p>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Present",  count: counts.Present,  icon: CheckCircleIcon,            style: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Absent",   count: counts.Absent,   icon: ExclamationCircleIcon,      style: "text-rose-600 bg-rose-50 border-rose-100"          },
          { label: "Unmarked", count: counts.Unmarked, icon: ClipboardDocumentCheckIcon, style: "text-slate-500 bg-slate-50 border-slate-100"        },
        ].map(({ label, count, icon: Icon, style }) => (
          <div key={label} className={`rounded-2xl border p-3.5 flex items-center gap-3 ${style}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold leading-none">{count}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {students.length > 0 && (
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pcts.Present}%` }} />
          <div className="h-full bg-rose-500   rounded-full transition-all" style={{ width: `${pcts.Absent}%`  }} />
        </div>
      )}

      {/* Mark all */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400">Mark all as:</span>
        <button onClick={() => markAll("Present")} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Present</button>
        <button onClick={() => markAll("Absent")}  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200   bg-rose-50   text-rose-700   hover:bg-rose-100   transition-colors">Absent</button>
      </div>

      {/* No class selected */}
      {!selectedClass ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center">
          <AcademicCapIcon className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">Select a class above to mark attendance</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center">
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-400">No students found in class {selectedClass}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <table className="w-full text-sm hidden sm:table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Marked</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student, idx) => {
                const status = attendance[student._id];
                return (
                  <tr key={student._id} className={`hover:bg-blue-50/20 transition-colors ${!status ? "bg-amber-50/20" : ""}`}>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{String(idx + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{student.class || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{fmtMarked(markedAt[student._id])}</td>
                    <td className="px-5 py-3.5">
                      {status ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[status].light} ${statusStyle[status].text}`}>
                          {status === "Present"
                            ? <CheckCircleIcon className="w-3 h-3" />
                            : <ExclamationCircleIcon className="w-3 h-3" />}
                          {status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">Not marked</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <AttendanceRadio studentId={student._id} status={status} onChange={handleChange} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {students.map((student) => {
              const status = attendance[student._id];
              return (
                <div key={student._id} className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {student.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 text-sm truncate">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.class} · {fmtMarked(markedAt[student._id])}</p>
                      </div>
                    </div>
                    <AttendanceRadio studentId={student._id} status={status} onChange={handleChange} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's breakdown */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 space-y-2.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's breakdown</p>
          <PctRow label="Present" pct={pcts.Present} color="bg-emerald-500" />
          <PctRow label="Absent"  pct={pcts.Absent}  color="bg-rose-500"   />
        </div>
      )}

      {/* Save footer */}
      {students.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
          <p className="text-sm">
            {counts.Unmarked > 0
              ? <span className="text-amber-600 font-medium">{counts.Unmarked} student(s) not marked yet</span>
              : <span className="text-emerald-600 font-medium">All {students.length} students marked ✓</span>
            }
          </p>
          <button
            onClick={handleSubmit}
            disabled={saving || counts.Unmarked > 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
              saving || counts.Unmarked > 0
                ? "bg-slate-300 cursor-not-allowed"
                : saved
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
            }`}
          >
            {saving ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            )}
            {saving ? "Saving…" : saved ? "Update Attendance" : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  );
}