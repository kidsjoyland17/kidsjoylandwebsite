import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { CLASSES } from "@/constants/routes";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ClockIcon,
  AcademicCapIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid";

// ─── Helpers ────────────────────────────────────────────────────────────────

const REASONS = ["Completed", "Transfer", "Dropout", "Other"];

const REASON_STYLE = {
  Completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Transfer: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Dropout: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  Other: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
};

const inputCls =
  "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl " +
  "focus:outline-none focus:border-blue-400 focus:bg-white transition-colors " +
  "placeholder:text-slate-400 text-slate-700";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i); // last 15 years

// ─── Sub-components ──────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

function Modal({ title, onClose, children, size = "md" }) {
  const widths = { sm: "max-w-sm", md: "max-w-xl", lg: "max-w-2xl" };
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReasonBadge({ reason }) {
  const s = REASON_STYLE[reason] || REASON_STYLE.Other;
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {reason}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminPassout() {
  // ── Passout list state ──
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // ── Active students (for passout modal) ──
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ── Modals ──
  const [modal, setModal] = useState(null); // "passout" | "delete" | "detail"
  const [selected, setSelected] = useState(null); // passout record
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // ── Passout form ──
  const [form, setForm] = useState({
    studentId: "",
    passoutYear: String(currentYear),
    reason: "Completed",
    remarks: "",
  });

  // ── Fetch passout records ──
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (filterYear) params.set("year", filterYear);
      if (filterClass) params.set("finalClass", filterClass);
      if (filterReason) params.set("reason", filterReason);

      const { data } = await api.get(`/admin/passout?${params}`);
      setRecords(data.data?.records || []);
      setTotal(data.data?.total || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load passout records.");
    } finally {
      setLoading(false);
    }
  }, [search, filterYear, filterClass, filterReason, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Fetch active students for the passout modal ──


  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const { data } = await api.get("/admin/students?limit=500");
      const raw = data.data ?? data;
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.students)
          ? raw.students
          : Array.isArray(raw?.records)
            ? raw.records
            : [];
      setStudents(arr);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const openPassoutModal = () => {
    setForm({ studentId: "", passoutYear: String(currentYear), reason: "Completed", remarks: "", certificateNo: "" });
    setFormErr("");
    setStudentSearch("");
    loadStudents();
    setModal("passout");
  };

  // ── Submit passout ──
  const handlePassout = async () => {
    if (!form.studentId) return setFormErr("Please select a student.");
    if (!form.passoutYear) return setFormErr("Passout year is required.");
    setSaving(true);
    setFormErr("");
    try {
      await api.post(`/admin/passout/${form.studentId}`, {
        passoutYear: Number(form.passoutYear),
        reason: form.reason,
        remarks: form.remarks,
        ...(form.certificateNo?.trim() && { certificateNo: form.certificateNo.trim() }),
      });
      setModal(null);
      fetchRecords();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle certificate issued ──
  const toggleCertificate = async (record) => {
    try {
      const { data } = await api.patch(`/admin/passout/${record._id}`, {
        certificateIssued: !record.certificateIssued,
      });
      setRecords((prev) =>
        prev.map((r) => (r._id === record._id ? data.data : r))
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update certificate.");
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/passout/${selected._id}`);
      setModal(null);
      fetchRecords();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Failed to delete.");
    } finally {
      setSaving(false);
    }
  };

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-row items-start justify-between gap-2 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
            Passout Records
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} alumni records</p>
        </div>
        <button
          onClick={openPassoutModal}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <PlusIcon className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Pass Out Student</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Search by name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Year filter */}
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterYear}
            onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
          >
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Class filter */}
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
          >
            <option value="">All Classes</option>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Reason filter */}
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterReason}
            onChange={(e) => { setFilterReason(e.target.value); setPage(1); }}
          >
            <option value="">All Reasons</option>
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Clear filters */}
          {(search || filterYear || filterClass || filterReason) && (
            <button
              onClick={() => { setSearch(""); setFilterYear(""); setFilterClass(""); setFilterReason(""); setPage(1); }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-flex">
            {total} records
          </span>
        </div>

        {/* ── Table ── */}
        {loading ? <Spinner /> : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="text-sm min-w-[700px] w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Student", "Final Class", "Year", "Reason", "Certificate", "Passed Out On", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <AcademicCapIcon className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium text-slate-400">No passout records found</p>
                      <p className="text-xs text-slate-300 mt-1">Records will appear here after students are passed out.</p>
                    </div>
                  </td></tr>
                ) : records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    {/* Student */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                          {r.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 whitespace-nowrap">{r.name}</p>
                          {r.rollNo && <p className="text-xs text-slate-400">Roll: {r.rollNo}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Class */}
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 whitespace-nowrap">
                        Class {r.finalClass}
                      </span>
                    </td>
                    {/* Year */}
                    <td className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">
                      {r.passoutYear}
                    </td>
                    {/* Reason */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <ReasonBadge reason={r.reason} />
                    </td>
                    {/* Certificate */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleCertificate(r)}
                        title={r.certificateIssued ? "Mark as NOT issued" : "Mark as Issued"}
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                      >
                        {r.certificateIssued ? (
                          <>
                            <CheckBadgeSolid className="w-5 h-5 text-green-500" />
                            <span className="text-green-600">Issued</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">Pending</span>
                          </>
                        )}
                      </button>
                      {r.certificateNo && (
                        <p className="text-xs text-slate-300 mt-0.5">{r.certificateNo}</p>
                      )}
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {/* View detail */}
                        <button
                          onClick={() => { setSelected(r); setModal("detail"); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => { setSelected(r); setFormErr(""); setModal("delete"); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete record"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} ({total} records)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PASSOUT MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {modal === "passout" && (
        <Modal title="Pass Out Student" onClose={() => setModal(null)} size="md">
          {formErr && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{formErr}
            </div>
          )}

          {/* Warning box */}
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-5">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>This will permanently remove the student from active records and move them to the alumni archive. This <strong>cannot be undone</strong>.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select student */}
            {/* Select student */}
            <div className="col-span-1 sm:col-span-2">
              <FormField label="Select Student" required>
                {studentsLoading ? (
                  <div className="text-sm text-slate-400 py-2">Loading students…</div>
                ) : (
                  <div className="flex flex-col gap-2">

                    {/* ── Selected student pill (shown after selection) ── */}
                    {form.studentId ? (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                            {students.find((s) => s._id === form.studentId)?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-indigo-700">
                              {students.find((s) => s._id === form.studentId)?.name}
                            </p>
                            <p className="text-xs text-indigo-400">
                              Class {students.find((s) => s._id === form.studentId)?.class}
                              {students.find((s) => s._id === form.studentId)?.rollNo
                                ? ` · Roll ${students.find((s) => s._id === form.studentId)?.rollNo}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((p) => ({ ...p, studentId: "" }));
                            setStudentSearch("");
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                          title="Remove selection"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* ── Search + Select (shown when no student selected) ── */
                      <>
                        {/* Search bar */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            className={`${inputCls} pl-9`}
                            placeholder="Search by name or roll no…"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                          />
                          {studentSearch && (
                            <button
                              type="button"
                              onClick={() => setStudentSearch("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                       
                        {/* Native select dropdown — filtered by search, always visible */}
                        {(() => {
                          const filtered = students.filter((s) =>
                            !studentSearch ||
                            s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            String(s.rollNo ?? "").toLowerCase().includes(studentSearch.toLowerCase())
                          );
                          return (
                            <select
                              className={inputCls}
                              size={Math.min(6, Math.max(2, filtered.length + 1))}
                              value={form.studentId}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                setForm((p) => ({ ...p, studentId: e.target.value }));
                                setStudentSearch("");
                              }}
                            >
                              <option value="">— Choose a student —</option>
                              {filtered.length === 0 ? (
                                <option disabled>No students match "{studentSearch}"</option>
                              ) : (
                                filtered.map((s) => (
                                  <option key={s._id} value={s._id}>
                                    {s.name} — Class {s.class}{s.rollNo ? ` (Roll ${s.rollNo})` : ""}
                                  </option>
                                ))
                              )}
                            </select>
                          );
                        })()}

                        {/* Count hint */}
                        <p className="text-xs text-slate-400 px-1">
                          {studentSearch
                            ? `${students.filter((s) =>
                                s.name?.toLowerCase().startsWith(studentSearch.toLowerCase()) ||
                                String(s.rollNo ?? "").toLowerCase().startsWith(studentSearch.toLowerCase())
                              ).length} student(s) found`
                            : `${students.length} students available`}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </FormField>
            </div>

            {/* Certificate No */}
            <div className="col-span-1 sm:col-span-2">
              <FormField label="Certificate No (optional)">
                <input
                  className={inputCls}
                  placeholder="Auto-generated if left blank e.g. CERT-2026-0017"
                  value={form.certificateNo || ""}
                  onChange={(e) => setForm((p) => ({ ...p, certificateNo: e.target.value }))}
                />
              </FormField>
            </div>

            {/* Passout Year */}
            <FormField label="Year of Passout" required>
              <select
                className={inputCls}
                value={form.passoutYear}
                onChange={(e) => setForm((p) => ({ ...p, passoutYear: e.target.value }))}
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </FormField>

            {/* Reason */}
            <FormField label="Reason">
              <select
                className={inputCls}
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              >
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>

            {/* Remarks */}
            <div className="col-span-1 sm:col-span-2">
              <FormField label="Remarks (optional)">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="e.g. Passed Class 12 with distinction"
                  value={form.remarks}
                  onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePassout}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Processing…" : "Confirm Passout"}
            </button>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {modal === "detail" && selected && (
        <Modal title="Passout Record Details" onClose={() => setModal(null)} size="md">
          <div className="space-y-4">
            {/* Student avatar row */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold flex-shrink-0">
                {selected.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">{selected.name}</p>
                <p className="text-sm text-slate-500">Roll No: {selected.rollNo || "—"}</p>
              </div>
              <div className="ml-auto">
                <ReasonBadge reason={selected.reason} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Final Class", `Class ${selected.finalClass}`],
                ["Passout Year", selected.passoutYear],
                ["Gender", selected.gender || "—"],
                ["Date of Birth", selected.dob ? new Date(selected.dob).toLocaleDateString("en-IN") : "—"],
                ["Parent Name", selected.parentName || "—"],
                ["Parent Phone", selected.parentPhone || "—"],
                ["Certificate No", selected.certificateNo || "—"],
                ["Cert. Issued", selected.certificateIssued ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="font-medium text-slate-700">{value}</p>
                </div>
              ))}
            </div>

            {selected.address && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Address</p>
                <p className="text-slate-700">{selected.address}</p>
              </div>
            )}

            {selected.remarks && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Remarks</p>
                <p className="text-slate-700">{selected.remarks}</p>
              </div>
            )}

            <div className="text-xs text-slate-400 pt-1">
              Passed out on {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              {selected.passedOutBy?.name && ` by ${selected.passedOutBy.name}`}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DELETE MODAL                                                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {modal === "delete" && selected && (
        <Modal title="Delete Passout Record" onClose={() => setModal(null)} size="sm">
          {formErr && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{formErr}
            </div>
          )}
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-7 h-7 text-rose-500" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Delete this record?</p>
            <p className="text-sm text-slate-500">
              The passout record for <strong>{selected?.name}</strong> ({selected?.passoutYear}) will be permanently removed. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}