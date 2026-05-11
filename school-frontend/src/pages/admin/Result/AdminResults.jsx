import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  MagnifyingGlassIcon, PlusIcon, TrashIcon, XMarkIcon,
  PrinterIcon, PencilSquareIcon, DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { getGrade, totalObtained, totalFM } from "./constants";
import { Spinner, Modal, PrintReportCard } from "./ResultComponents";
import ResultForm from "./ResultForm";

export default function AdminResults() {
  const [records, setRecords] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Meta state (fetched from backend) ──
  const [classes,  setClasses]  = useState([]);
  const [sessions, setSessions] = useState([]);

  const [search,        setSearch]        = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterClass,   setFilterClass]   = useState("");
  const [page,          setPage]          = useState(1);
  const LIMIT = 15;

  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");

  // ── Fetch classes and sessions on mount ──
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [classRes, sessionRes] = await Promise.all([
          api.get("/admin/meta/classes"),
          api.get("/admin/results/sessions"),
        ]);
        setClasses(classRes.data?.data || []);
        setSessions(sessionRes.data?.data || []);
      } catch {
        // non-fatal: filters just won't populate
      }
    };
    fetchMeta();
  }, []);

  // ── Fetch records ──
  const fetchRecords = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search)        params.set("search",    search);
      if (filterSession) params.set("session",   filterSession);
      if (filterClass)   params.set("className", filterClass);
      const { data } = await api.get(`/admin/results?${params}`);
      setRecords(data.data?.records || []);
      setTotal(data.data?.total || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load results.");
    } finally { setLoading(false); }
  }, [search, filterSession, filterClass, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const { data } = await api.get("/admin/students?limit=500");
      setStudents(data.data?.students || []);
    } catch { setStudents([]); }
    finally { setStudentsLoading(false); }
  };

  // ── Save ──
  const handleSave = async (form) => {
    if (!form.studentId) return setFormErr("Please select a student.");
    setSaving(true); setFormErr("");
    try {
      const payload = {
        studentId: form.studentId,
        session:   form.session,
        rollNo:    form.rollNo,
        subjects: form.subjects.map(s => ({
          subject:   s.subject,
          fullMarks: s.fullMarks,
          firstTerm: {
            unitTest: s.firstTerm?.unitTest  !== "" ? Number(s.firstTerm?.unitTest)  : null,
            termExam: s.firstTerm?.termExam  !== "" ? Number(s.firstTerm?.termExam)  : null,
            total:    s.firstTerm?.total     !== "" ? Number(s.firstTerm?.total)     : null,
          },
          secondTerm: {
            unitTest: s.secondTerm?.unitTest !== "" ? Number(s.secondTerm?.unitTest) : null,
            termExam: s.secondTerm?.termExam !== "" ? Number(s.secondTerm?.termExam) : null,
            total:    s.secondTerm?.total    !== "" ? Number(s.secondTerm?.total)    : null,
          },
          final: {
            unitTest: s.final?.unitTest      !== "" ? Number(s.final?.unitTest)      : null,
            termExam: s.final?.termExam      !== "" ? Number(s.final?.termExam)      : null,
            total:    s.final?.total         !== "" ? Number(s.final?.total)         : null,
          },
        })),
        englishSkills:         form.englishSkills,
        hindiSkills:           form.hindiSkills,
        attendance:            form.attendance,
        classParticipation:    form.classParticipation,
        discipline:            form.discipline,
        neatness:              form.neatness,
        courteous:             form.courteous,
        responsibleDependable: form.responsibleDependable,
        attitudeTeachers:      form.attitudeTeachers,
        rank:            form.rank,
        remarks:         form.remarks,
        promoted:        form.promoted === "true" ? true : form.promoted === "false" ? false : null,
        promotedToClass: form.promotedToClass,
      };
      if (selected?._id) {
        await api.put(`/admin/results/${selected._id}`, payload);
      } else {
        await api.post("/admin/results", payload);
      }
      setModal(null);
      fetchRecords();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/results/${selected._id}`);
      setModal(null);
      fetchRecords();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Failed to delete.");
    } finally { setSaving(false); }
  };

  // ── Print ──
  const handlePrint = () => {
    const printContent = document.getElementById("report-card-print");
    if (!printContent) return;
    const clone = printContent.cloneNode(true);
    clone.querySelectorAll("style").forEach(el => el.remove());
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Report Card – ${selected?.studentName || ""}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: #fff; font-family: 'Nunito', sans-serif; }
    .rc-wrapper { display: flex; flex-direction: column; width: 210mm; margin: 0 auto; gap: 0; }
    .rc-page { width: 210mm; height: 297mm; overflow: hidden; flex-shrink: 0; }
    .inner-wrap { width:210mm; height:297mm; background:#fff; padding:3.5mm 4mm 3mm; display:flex; flex-direction:column; gap:1.8mm; overflow:hidden; }
    .inner-header { display:flex; align-items:center; gap:2.5mm; border-bottom:1.5px solid #333; padding-bottom:2mm; }
    .inner-logo { width:13mm; height:13mm; border-radius:50%; border:1.5px solid #1a3a8c; background:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }
    .inner-school-info { flex:1; text-align:center; }
    .inner-school-name { font-family:'Poppins',sans-serif; font-size:11pt; font-weight:900; color:#1a3a8c; text-transform:uppercase; letter-spacing:0.4px; }
    .inner-school-address { font-size:5.5pt; color:#444; line-height:1.4; }
    .inner-report-title { font-family:'Poppins',sans-serif; font-size:7.5pt; font-weight:700; color:#1a3a8c; text-align:center; border:1.5px solid #1a3a8c; padding:1mm 3mm; border-radius:3px; white-space:nowrap; }
    .student-info { display:grid; grid-template-columns:1fr 1fr; gap:1mm 4mm; font-size:6.5pt; border:1px solid #aaa; padding:2mm 3mm; border-radius:3px; }
    .si-row { display:flex; align-items:baseline; gap:1mm; }
    .si-label { font-weight:800; white-space:nowrap; min-width:19mm; }
    .si-value { border-bottom:1px dotted #999; flex:1; font-style:italic; padding-bottom:1px; }
    .marks-table { width:100%; border-collapse:collapse; font-size:5.2pt; }
    .marks-table th, .marks-table td { border:1px solid #555; padding:1.5px 1.5px; text-align:center; }
    .marks-table .th-main { background:#d0d8f0; font-weight:800; font-size:5.8pt; }
    .marks-table .th-sub { background:#e8ecf8; font-weight:700; font-size:5pt; line-height:1.15; }
    .marks-table .td-subject { text-align:left; padding-left:2px; font-weight:600; font-size:5.2pt; }
    .marks-table .td-total { font-weight:800; background:#efefef; }
    .marks-table .td-highlight { font-weight:800; background:#e8f4e8; }
    .bottom-grid { display:grid; grid-template-columns:1fr 1fr; gap:2.5mm; }
    .social-table { width:100%; border-collapse:collapse; font-size:5.2pt; }
    .social-table th, .social-table td { border:1px solid #555; padding:1.5px 2px; text-align:center; }
    .social-table .th-main { background:#d0d8f0; font-weight:800; font-size:5.8pt; }
    .social-table .td-label { text-align:left; padding-left:3px; font-size:5.2pt; }
    .remarks-block { border:1px solid #555; padding:1.5mm 2.5mm; font-size:5.8pt; border-radius:2px; }
    .remarks-label { font-weight:800; font-size:5.8pt; margin-bottom:0.8mm; }
    .remarks-text { min-height:5mm; font-style:italic; }
    .sigs-row { display:flex; justify-content:space-between; align-items:flex-end; margin-top:1.5mm; }
    .sig-block { text-align:center; flex:1; }
    .sig-line { border-bottom:1px solid #333; margin:0 2mm; height:8mm; }
    .sig-label { font-size:5pt; font-weight:700; color:#333; margin-top:0.8mm; }
    .section-title { font-family:'Poppins',sans-serif; font-size:5.8pt; font-weight:800; background:#d0d8f0; border:1px solid #555; text-align:center; padding:1px 2px; letter-spacing:0.3px; }
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { margin: 0; }
      .rc-wrapper { display: block; width: 210mm; }
      .rc-page { width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; break-after: page; }
      .rc-page:last-child { page-break-after: avoid; break-after: avoid; }
    }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 1200);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const getTermTotal = (subjects, term) =>
    (subjects || []).reduce((sum, s) => {
      const v = typeof s[term] === "object" ? s[term]?.total : s[term];
      return sum + (v !== null && v !== undefined && v !== "" ? Number(v) : 0);
    }, 0);

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-indigo-500"/>
            Result Cards
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} result records</p>
        </div>
        <button
          onClick={() => { loadStudents(); setSelected(null); setFormErr(""); setModal("form"); }}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <PlusIcon className="w-4 h-4 flex-shrink-0"/>
          <span className="hidden sm:inline">Add Result</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
            <input
              className="w-full px-3 py-2 pl-9 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400 text-slate-700"
              placeholder="Search by name…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {/* Session filter — from backend */}
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-slate-600"
            value={filterSession} onChange={e => { setFilterSession(e.target.value); setPage(1); }}
          >
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Class filter — from backend */}
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-slate-600"
            value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || filterSession || filterClass) && (
            <button
              onClick={() => { setSearch(""); setFilterSession(""); setFilterClass(""); setPage(1); }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              <XMarkIcon className="w-3.5 h-3.5"/> Clear
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? <Spinner/> : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0"/>{error}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="text-sm min-w-[650px] w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Student","Class","Roll No","Session","1st Term","2nd Term","Final","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <DocumentTextIcon className="w-10 h-10 text-slate-200 mb-3"/>
                      <p className="text-sm font-medium text-slate-400">No results found</p>
                      <p className="text-xs text-slate-300 mt-1">Add a result using the button above.</p>
                    </div>
                  </td></tr>
                ) : records.map(r => {
                  const t1 = getTermTotal(r.subjects, "firstTerm");
                  const t2 = getTermTotal(r.subjects, "secondTerm");
                  const tf = getTermTotal(r.subjects, "final");
                  const fm = totalFM(r.subjects || []);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                            {r.studentName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "?"}
                          </div>
                          <p className="font-medium text-slate-700 whitespace-nowrap">{r.studentName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          Class {r.className}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{r.rollNo || "—"}</td>
                      <td className="px-5 py-3 text-slate-600 font-medium text-xs whitespace-nowrap">{r.session}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{t1 ? `${t1}/${fm}` : "—"}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{t2 ? `${t2}/${fm}` : "—"}</td>
                      <td className="px-5 py-3">
                        {tf ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                            {tf}/{fm} — {getGrade(tf, fm)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(r); setModal("print"); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Print Report Card">
                            <PrinterIcon className="w-4 h-4"/>
                          </button>
                          <button onClick={() => { loadStudents(); setSelected(r); setFormErr(""); setModal("form"); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                            <PencilSquareIcon className="w-4 h-4"/>
                          </button>
                          <button onClick={() => { setSelected(r); setFormErr(""); setModal("delete"); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete">
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {page} of {totalPages} ({total} records)</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FORM MODAL ── */}
      {modal === "form" && (
        <Modal title={selected ? "Edit Result" : "Add Result"} onClose={() => setModal(null)} size="xl">
          {studentsLoading ? <Spinner/> : (
            <ResultForm
              students={students}
              initialData={selected}
              onSave={handleSave}
              onCancel={() => setModal(null)}
              saving={saving}
              formErr={formErr}
            />
          )}
        </Modal>
      )}

      {/* ── PRINT MODAL ── */}
{modal === "print" && selected && (
  <Modal title={`Report Card — ${selected.studentName}`} onClose={() => setModal(null)} size="xl">
    <div className="flex justify-end mb-4">
      <button onClick={handlePrint}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <PrinterIcon className="w-4 h-4"/>
        Print / Save as PDF
      </button>
    </div>
    <div className="overflow-auto rounded-xl bg-slate-200 p-4">
      {/* Outer container sized to the scaled width so it doesn't overflow */}
      <div style={{ width: "calc(210mm * 0.72)", margin: "0 auto" }}>
        {/* Inner: full 210mm, scaled down from top-left */}
        <div style={{
          width: "210mm",
          transformOrigin: "top left",
          transform: "scale(0.72)",
          /* Compensate for height collapse after CSS transform */
          marginBottom: "calc((297mm * 0.72 * 2) - (297mm * 2))",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <PrintReportCard result={selected}/>
        </div>
      </div>
    </div>
  </Modal>
)}

      {/* ── DELETE MODAL ── */}
      {modal === "delete" && selected && (
        <Modal title="Delete Result" onClose={() => setModal(null)} size="sm">
          {formErr && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0"/>{formErr}
            </div>
          )}
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-7 h-7 text-rose-500"/>
            </div>
            <p className="font-semibold text-slate-800 mb-1">Delete this result?</p>
            <p className="text-sm text-slate-500">
              Result for <strong>{selected.studentName}</strong> ({selected.session}) will be permanently removed.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              {saving ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}