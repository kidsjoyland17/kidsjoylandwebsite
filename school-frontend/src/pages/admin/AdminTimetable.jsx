import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { CLASSES } from "@/constants/routes";
import {
  RiCalendarLine,
  RiTimeLine,
  RiSaveLine,
  RiFileCopyLine,
  RiDeleteBinLine,
  RiCheckboxCircleLine,
  RiDraftLine,
  RiAddLine,
  RiCloseLine,
  RiAlertLine,
} from "react-icons/ri";

/* ─── constants ──────────────────────────────────────────── */
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const SLOT_TYPES = [
  { value: "class",    label: "Class",    color: "bg-blue-50 text-blue-700 border-blue-200"      },
  { value: "break",    label: "Break",    color: "bg-amber-50 text-amber-700 border-amber-200"   },
  { value: "assembly", label: "Assembly", color: "bg-purple-50 text-purple-700 border-purple-200"},
  { value: "free",     label: "Free",     color: "bg-gray-50 text-gray-500 border-gray-200"      },
];

const DEFAULT_SLOTS = [
  { period:1, startTime:"08:00", endTime:"08:45", subject:"", teacher:null, type:"class" },
  { period:2, startTime:"08:45", endTime:"09:30", subject:"", teacher:null, type:"class" },
  { period:3, startTime:"09:30", endTime:"10:15", subject:"", teacher:null, type:"class" },
  { period:4, startTime:"10:15", endTime:"10:30", subject:"", teacher:null, type:"break" },
  { period:5, startTime:"10:30", endTime:"11:15", subject:"", teacher:null, type:"class" },
  { period:6, startTime:"11:15", endTime:"12:00", subject:"", teacher:null, type:"class" },
  { period:7, startTime:"12:00", endTime:"12:30", subject:"", teacher:null, type:"break" },
  { period:8, startTime:"12:30", endTime:"13:15", subject:"", teacher:null, type:"class" },
  { period:9, startTime:"13:15", endTime:"14:00", subject:"", teacher:null, type:"class" },
];

/* ─── helpers ────────────────────────────────────────────── */
const slotTypeStyle = (type) =>
  SLOT_TYPES.find((t) => t.value === type)?.color || "bg-blue-50 text-blue-700 border-blue-200";

const timesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;

const classLabel = (cls) =>
  isNaN(Number(cls)) ? cls : `Class ${cls}`;

/* ─── component ──────────────────────────────────────────── */
export default function AdminTimetable() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0] ?? "1");
  const [selectedDay,   setSelectedDay]   = useState("Monday");
  const [slots,         setSlots]         = useState(DEFAULT_SLOTS.map((s) => ({ ...s })));
  const [status,        setStatus]        = useState("draft");
  const [savedId,       setSavedId]       = useState(null);

  /* allDayTimetables: every timetable for the selected day across ALL classes.
     Used for client-side conflict detection.                                  */
  const [allDayTimetables, setAllDayTimetables] = useState([]);

  const [teachers,  setTeachers]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [conflict,  setConflict]  = useState(null);

  const [copyModal,   setCopyModal]   = useState(false);
  const [copyTarget,  setCopyTarget]  = useState("");
  const [deleteModal, setDeleteModal] = useState(false);

  /* ── toast ─────────────────────────────────────────────── */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch teachers list ────────────────────────────────── */
  useEffect(() => {
    api.get("/admin/teachers")
      .then((r) => setTeachers(r.data.data || []))
      .catch(() => {});
  }, []);

  /* ── fetch ALL timetables for the selected day (conflict map) ── */
  useEffect(() => {
    api.get("/timetable", { params: { day: selectedDay, status: "published" } })
      .then((r) => setAllDayTimetables(r.data.data || []))
      .catch(() => setAllDayTimetables([]));
  }, [selectedDay]);

  /* ── fetch timetable when class or day changes ──────────── */
  const fetchTimetable = useCallback(() => {
    setLoading(true);
    setConflict(null);
    api.get(`/timetable/${selectedClass}/${selectedDay}`)
      .then((r) => {
        const tt = r.data.data;
        if (tt._id) {
          setSavedId(tt._id);
          setStatus(tt.status);
          setSlots(
            tt.slots.map((s) => ({
              ...s,
              teacher: s.teacher?._id || s.teacher || null,
            }))
          );
        } else {
          setSavedId(null);
          setStatus("draft");
          setSlots(DEFAULT_SLOTS.map((s) => ({ ...s })));
        }
      })
      .catch(() => {
        setSavedId(null);
        setStatus("draft");
        setSlots(DEFAULT_SLOTS.map((s) => ({ ...s })));
      })
      .finally(() => setLoading(false));
  }, [selectedClass, selectedDay]);

  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  /* ── conflict map: teacherId → list of occupied time ranges
     built from allDayTimetables, excluding the current class  ── */
  const teacherBusyMap = useMemo(() => {
    const map = {}; // { teacherId: [{startTime, endTime, class}] }
    for (const tt of allDayTimetables) {
      if (tt.class === selectedClass) continue; // skip current class
      for (const slot of tt.slots) {
        if (slot.type !== "class" || !slot.teacher) continue;
        const tid = slot.teacher?._id?.toString() || slot.teacher?.toString();
        if (!tid) continue;
        if (!map[tid]) map[tid] = [];
        map[tid].push({
          startTime: slot.startTime,
          endTime:   slot.endTime,
          class:     tt.class,
        });
      }
    }
    return map;
  }, [allDayTimetables, selectedClass]);

  /* ── for a given slot index, return Set of conflicting teacherIds ── */
  const getConflictingTeacherIds = useCallback(
    (slotIdx) => {
      const slot = slots[slotIdx];
      if (!slot?.startTime || !slot?.endTime || slot.type !== "class")
        return new Set();

      const conflicting = new Set();
      for (const [tid, ranges] of Object.entries(teacherBusyMap)) {
        for (const range of ranges) {
          if (timesOverlap(slot.startTime, slot.endTime, range.startTime, range.endTime)) {
            conflicting.add(tid);
            break;
          }
        }
      }
      return conflicting;
    },
    [slots, teacherBusyMap]
  );

  /* ── also check conflicts within the CURRENT class's own slots ── */
  const getSameClassConflictingIds = useCallback(
    (slotIdx) => {
      const slot = slots[slotIdx];
      if (!slot?.startTime || !slot?.endTime || slot.type !== "class")
        return new Set();

      const conflicting = new Set();
      slots.forEach((other, i) => {
        if (i === slotIdx || other.type !== "class" || !other.teacher) return;
        if (timesOverlap(slot.startTime, slot.endTime, other.startTime, other.endTime)) {
          conflicting.add(other.teacher.toString());
        }
      });
      return conflicting;
    },
    [slots]
  );

  /* ── slot field change ──────────────────────────────────── */
  const handleSlotChange = (idx, field, value) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "type" && value !== "class") {
        next[idx].subject = "";
        next[idx].teacher = null;
      }
      return next;
    });
    setConflict(null);
  };

  /* ── add / remove slot ──────────────────────────────────── */
  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { period: prev.length + 1, startTime: "", endTime: "", subject: "", teacher: null, type: "class" },
    ]);
  };

  const removeSlot = (idx) => {
    setSlots((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, period: i + 1 }))
    );
  };

  /* ── save ───────────────────────────────────────────────── */
  const handleSave = async (publishOverride) => {
    setSaving(true);
    setConflict(null);
    try {
      await api.post("/timetable", {
        class:  selectedClass,
        day:    selectedDay,
        slots:  slots.map((s) => ({ ...s, teacher: s.teacher || null })),
        status: publishOverride ?? status,
      });
      if (publishOverride) setStatus(publishOverride);
      showToast(publishOverride === "published" ? "Timetable published!" : "Timetable saved.");
      fetchTimetable();
      /* refresh the day-wide conflict map after saving */
      api.get("/timetable", { params: { day: selectedDay, status: "published" } })
        .then((r) => setAllDayTimetables(r.data.data || []))
        .catch(() => {});
    } catch (e) {
      const msg = e?.response?.data?.message || "Save failed.";
      if (e?.response?.status === 409) setConflict(msg);
      else showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── copy day ───────────────────────────────────────────── */
  const handleCopy = async () => {
    if (!copyTarget) return;
    try {
      await api.post(`/timetable/${selectedClass}/${selectedDay}/copy`, { targetDay: copyTarget });
      showToast(`Copied to ${copyTarget}!`);
      setCopyModal(false);
      setCopyTarget("");
    } catch (e) {
      showToast(e?.response?.data?.message || "Copy failed.", "error");
    }
  };

  /* ── delete ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    try {
      await api.delete(`/timetable/${selectedClass}/${selectedDay}`);
      showToast("Timetable cleared.");
      setDeleteModal(false);
      fetchTimetable();
    } catch (e) {
      showToast(e?.response?.data?.message || "Delete failed.", "error");
    }
  };

  const isPublished = status === "published";

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-lg ${
          toast.type === "error" ? "bg-red-600" : "bg-green-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <RiCalendarLine className="text-blue-600" />
            Timetable Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Schedule classes, periods and breaks for each class
          </p>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          isPublished
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {isPublished ? <RiCheckboxCircleLine /> : <RiDraftLine />}
          {isPublished ? "Published" : "Draft"}
        </div>
      </div>

      {/* ── Selectors — dropdowns ───────────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Class dropdown */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>{classLabel(cls)}</option>
              ))}
            </select>
          </div>

          {/* Day dropdown */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Conflict warning ────────────────────────────────── */}
      {conflict && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
          <RiAlertLine className="mt-0.5 shrink-0 text-base" />
          <span>{conflict}</span>
        </div>
      )}

      {/* ── Action bar (Save / Publish / Unpublish / Copy / Clear / Add Period) ── */}
      <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">

        {/* Left: save actions */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            <RiSaveLine />
            {saving ? "Saving…" : "Save Draft"}
          </button>

          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            <RiCheckboxCircleLine />
            Publish
          </button>

          {isPublished && (
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="flex items-center gap-1.5 border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <RiDraftLine />
              Unpublish
            </button>
          )}

          {/* divider */}
          <span className="h-6 w-px bg-gray-200 hidden sm:block" />

          <button
            onClick={() => { setCopyTarget(""); setCopyModal(true); }}
            className="flex items-center gap-1.5 border px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <RiFileCopyLine />
            Copy Day
          </button>

          {savedId && (
            <button
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg text-sm"
            >
              <RiDeleteBinLine />
              Clear
            </button>
          )}
        </div>

        {/* Right: Add Period */}
        <button
          onClick={addSlot}
          className="flex items-center gap-1.5 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RiAddLine />
          Add Period
        </button>
      </div>

      {/* ── Slots table ────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading timetable…</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-4">

          {/* Table header */}
          <div className="grid grid-cols-[40px_110px_110px_1fr_1fr_140px_36px] gap-3 px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>#</span>
            <span>Start</span>
            <span>End</span>
            <span>Subject</span>
            <span>Teacher</span>
            <span>Type</span>
            <span />
          </div>

          {/* Rows */}
          {slots.map((slot, idx) => {
            const externalConflicts = getConflictingTeacherIds(idx);
            const internalConflicts = getSameClassConflictingIds(idx);
            const allConflicts = new Set([...externalConflicts, ...internalConflicts]);

            return (
              <div
                key={idx}
                className={`grid grid-cols-[40px_110px_110px_1fr_1fr_140px_36px] gap-3 px-4 py-3 border-b last:border-b-0 items-center transition-colors ${
                  slot.type !== "class" ? "bg-gray-50/60" : "hover:bg-blue-50/30"
                }`}
              >
                {/* Period number */}
                <span className="text-sm font-bold text-gray-400">{idx + 1}</span>

                {/* Start time */}
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full"
                />

                {/* End time */}
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full"
                />

                {/* Subject */}
                <input
                  type="text"
                  value={slot.subject}
                  onChange={(e) => handleSlotChange(idx, "subject", e.target.value)}
                  placeholder={slot.type === "class" ? "e.g. Mathematics" : "—"}
                  disabled={slot.type !== "class"}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full disabled:bg-gray-100 disabled:text-gray-400"
                />

                {/* Teacher — conflicting teachers are disabled with a tooltip */}
                <select
                  value={slot.teacher || ""}
                  onChange={(e) => handleSlotChange(idx, "teacher", e.target.value || null)}
                  disabled={slot.type !== "class"}
                  className="border rounded-lg px-2 py-1.5 text-sm w-full disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">— None —</option>
                  {teachers.map((t) => {
                    const tid = t._id?.toString();
                    const busy = allConflicts.has(tid);
                    return (
                      <option
                        key={tid}
                        value={tid}
                        disabled={busy}
                        style={busy ? { color: "#9ca3af" } : {}}
                      >
                        {t.user?.name || "Unknown"}{busy ? " (busy)" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Type */}
                <select
                  value={slot.type}
                  onChange={(e) => handleSlotChange(idx, "type", e.target.value)}
                  className={`border rounded-lg px-2 py-1.5 text-sm w-full font-medium ${slotTypeStyle(slot.type)}`}
                >
                  {SLOT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Remove */}
                <button
                  onClick={() => removeSlot(idx)}
                  className="flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                >
                  <RiCloseLine className="text-base" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Summary strip ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mt-2">
        {SLOT_TYPES.map((t) => {
          const count = slots.filter((s) => s.type === t.value).length;
          if (!count) return null;
          return (
            <span key={t.value} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${t.color}`}>
              {t.label}: {count}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200">
          <RiTimeLine className="text-xs" />
          {slots.length} total periods
        </span>
      </div>

      {/* ── Copy Day Modal ──────────────────────────────────── */}
      {copyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Copy Day</h3>
            <p className="text-sm text-gray-500 mb-4">
              Copy <strong>{selectedDay}</strong>'s timetable ({classLabel(selectedClass)}) to:
            </p>
            <select
              value={copyTarget}
              onChange={(e) => setCopyTarget(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-5"
            >
              <option value="">Select target day…</option>
              {DAYS.filter((d) => d !== selectedDay).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCopyModal(false)} className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCopy} disabled={!copyTarget} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                <RiFileCopyLine className="inline mr-1" />
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ────────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Clear Timetable?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the timetable for{" "}
              <strong>{classLabel(selectedClass)} — {selectedDay}</strong>. Cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(false)} className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                <RiDeleteBinLine className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}