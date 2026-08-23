import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";   // ← add
import {
  RiCalendarLine, RiTimeLine,
  RiBookOpenLine, RiInformationLine, RiLoader4Line,
} from "react-icons/ri";

/* ─── constants ───────────────────────────────────────────── */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TYPE_CONFIG = {
  class:    { label: "Class",    pill: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500"   },
  break:    { label: "Break",    pill: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400"  },
  assembly: { label: "Assembly", pill: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  free:     { label: "Free",     pill: "bg-gray-50 text-gray-400 border-gray-200",       dot: "bg-gray-300"   },
};

/* ─── helpers ─────────────────────────────────────────────── */
const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
};

/* ─── component ───────────────────────────────────────────── */
export default function TeacherTimetable() {
  const { user } = useAuth();                              // ← get logged-in user
  const [timetables,  setTimetables]  = useState([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [status,      setStatus]      = useState("loading");
  const [errorMsg,    setErrorMsg]    = useState("");

  /* ── fetch only THIS teacher's published timetables ─────── */
  useEffect(() => {
    if (!user?.teacherId) {
      setErrorMsg("Teacher profile not found. Please complete your profile.");
      setStatus("error");
      return;
    }

    let cancelled = false;
    api
      .get(`/timetable/teacher/${user.teacherId}`)         // ← teacher-specific endpoint
      .then((r) => {
        if (!cancelled) {
          setTimetables(r.data.data || []);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMsg("Could not load timetables. Please try again later.");
          setStatus("error");
        }
      });
    return () => { cancelled = true; };
  }, [user?.teacherId]);                                   // ← re-fetch if teacherId changes

  /* ── derived: periods for selected day ──────────────────── *
   * Same logic as before — works unchanged because the API
   * returns the same timetable shape, just filtered to this teacher.
   */
  const periodRows = useMemo(() => {
    const dayTTs = timetables.filter((tt) => tt.day === selectedDay);
    const slotMap = new Map();

    for (const tt of dayTTs) {
      for (const slot of tt.slots) {
        // Only show slots where THIS teacher is assigned
        if (slot.type === "class") {
          const slotTeacherId =
            slot.teacher?._id?.toString() || slot.teacher?.toString();
          if (slotTeacherId !== user?.teacherId) continue;  // ← filter to own slots only
        }

        const key = `${slot.startTime}|${slot.endTime}`;
        if (!slotMap.has(key)) {
          slotMap.set(key, {
            startTime:   slot.startTime,
            endTime:     slot.endTime,
            type:        slot.type,
            period:      slot.period,
            assignments: [],
          });
        }

        if (slot.type === "class") {
          slotMap.get(key).assignments.push({
            subject: slot.subject || "—",
            class:   tt.class,
          });
        }
      }
    }

    return [...slotMap.values()].sort((a, b) =>
      a.startTime > b.startTime ? 1 : -1
    );
  }, [timetables, selectedDay, user?.teacherId]);

  /* ── derived: class count per day for week grid ─────────── */
  const weekCounts = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        count: timetables
          .filter((tt) => tt.day === day)
          .reduce((n, tt) =>
            n + tt.slots.filter((s) => {
              if (s.type !== "class") return false;
              const tid = s.teacher?._id?.toString() || s.teacher?.toString();
              return tid === user?.teacherId;               // ← count only own classes
            }).length,
          0),
      })),
    [timetables, user?.teacherId]
  );

  /* ── loading / error states ─────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <RiLoader4Line className="text-4xl mx-auto mb-3 animate-spin" />
          <p className="text-sm font-medium">Loading your timetable…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 max-w-sm text-center text-sm">
          <RiInformationLine className="text-2xl mx-auto mb-2" />
          {errorMsg}
        </div>
      </div>
    );
  }

  /* ── main render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <RiCalendarLine className="text-blue-600" />
          My Timetable
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your assigned periods for the week
        </p>
      </div>

      {/* ── Week Overview Grid ──────────────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Select Day
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {weekCounts.map(({ day, count }) => {
            const active = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center rounded-xl border p-3 transition-all ${
                  active
                    ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
                    : "bg-gray-50 border-gray-100 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <span className={`text-[10px] font-bold tracking-widest mb-1 ${active ? "text-blue-200" : "text-gray-400"}`}>
                  {day.slice(0, 3).toUpperCase()}
                </span>
                <span className={`text-2xl font-bold leading-none ${active ? "text-white" : "text-gray-700"}`}>
                  {count}
                </span>
                <span className={`text-[10px] mt-1 ${active ? "text-blue-200" : "text-gray-400"}`}>
                  {count === 1 ? "class" : "classes"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Period Table ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/60">
          <div className="flex items-center gap-2">
            <RiTimeLine className="text-blue-500" />
            <h2 className="font-bold text-gray-800">{selectedDay}</h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {periodRows.length} periods
          </span>
        </div>

        {periodRows.length > 0 && (
          <div className="grid grid-cols-[44px_150px_1fr] gap-4 px-5 py-2.5 bg-gray-50 border-b text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            <span>#</span>
            <span>Time</span>
            <span>Subject &amp; Class</span>
          </div>
        )}

        {periodRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <RiBookOpenLine className="text-3xl" />
            <p className="text-sm font-medium">No classes assigned for {selectedDay}</p>
          </div>
        ) : (
          <div className="divide-y">
            {periodRows.map((row, idx) => {
              const cfg     = TYPE_CONFIG[row.type] || TYPE_CONFIG.class;
              const isClass = row.type === "class";

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-[44px_150px_1fr] gap-4 px-5 py-4 items-start transition-colors ${
                    isClass ? "hover:bg-blue-50/20" : "bg-gray-50/50"
                  }`}
                >
                  {/* Period number + type dot */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span className="text-sm font-bold text-gray-300">{idx + 1}</span>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </div>

                  {/* Time + type badge */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-mono text-gray-700 whitespace-nowrap">
                      {fmtTime(row.startTime)}
                    </span>
                    <span className="text-xs font-mono text-gray-400 whitespace-nowrap">
                      — {fmtTime(row.endTime)}
                    </span>
                    <span className={`inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${cfg.pill}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Subject + class cards (no teacher name needed — it's always you) */}
                  <div className="flex flex-wrap gap-2">
                    {!isClass ? (
                      <span className="text-sm text-gray-400 italic self-center">{cfg.label}</span>
                    ) : row.assignments.length === 0 ? (
                      <span className="text-sm text-gray-300 italic self-center">No details</span>
                    ) : (
                      row.assignments.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-gray-800 truncate leading-tight">
                              {a.subject}
                            </span>
                            <span className="text-[10px] text-gray-500 truncate leading-tight">
                              <span className="font-medium text-indigo-600">Class {a.class}</span>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legend ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <span
            key={type}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}