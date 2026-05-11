import React, { useState, useCallback } from "react";
import { useStudents } from "@/hooks/useStudents";
import api from "@/lib/api";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { CLASSES } from "@/constants/routes";
import { toast } from "react-toastify";

const SECTIONS = ["A", "B", "C", "D"];
const SECTION_COLORS = {
  A: "bg-blue-50 text-blue-600",
  B: "bg-violet-50 text-violet-600",
  C: "bg-emerald-50 text-emerald-600",
  D: "bg-amber-50 text-amber-600",
};

// ── CHANGE 1: added admissionNo, aadharNo, fatherName, motherName ──
const EMPTY_FORM = {
  name: "", class: "", section: "A", rollNo: "",
  admissionNo: "", aadharNo: "",
  fatherName: "", motherName: "",
  parentName: "", parentPhone: "", address: "", gender: "", dob: "",
};

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
      ${active ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}
      disabled:opacity-40 disabled:cursor-not-allowed`}>
    {children}
  </button>
);

function Modal({ title, onClose, children, small }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${small ? "max-w-sm" : "max-w-xl"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
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
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400 text-slate-700";

// ── Section pill ─────────────────────────────────────────────────
function SectionBadge({ section }) {
  const cls = SECTION_COLORS[section] || "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {section || "—"}
    </span>
  );
}

// ── Section assign modal ─────────────────────────────────────────
function AssignSectionModal({ student, onClose, onSaved }) {
  const [section, setSection] = useState(student.section || "A");
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/students/${student._id}/section`, { section });
      toast.success(`${student.name} moved to Section ${section}`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign section.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Assign Section" onClose={onClose} small>
      <p className="text-sm text-slate-500 mb-4">
        Assigning section for <strong className="text-slate-700">{student.name}</strong>
        {" "}(Class {student.class})
      </p>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {SECTIONS.map((s) => (
          <button key={s} onClick={() => setSection(s)}
            className={`py-3 rounded-xl text-sm font-bold transition-all border-2
              ${section === s
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
              }`}>
            Section {s}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving…" : "Assign"}
        </button>
      </div>
    </Modal>
  );
}

// ── Bulk assign modal ────────────────────────────────────────────
function BulkAssignModal({ selectedIds, onClose, onSaved }) {
  const [section, setSection] = useState("A");
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/admin/students/bulk-assign-section", {
        studentIds: selectedIds,
        section,
      });
      toast.success(data.message || `${selectedIds.length} students assigned to Section ${section}`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk assign failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Bulk Assign Section" onClose={onClose} small>
      <p className="text-sm text-slate-500 mb-4">
        Assigning section for <strong className="text-slate-700">{selectedIds.length} selected students</strong>
      </p>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {SECTIONS.map((s) => (
          <button key={s} onClick={() => setSection(s)}
            className={`py-3 rounded-xl text-sm font-bold transition-all border-2
              ${section === s
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
              }`}>
            Section {s}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving…" : `Assign Section ${section}`}
        </button>
      </div>
    </Modal>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function AdminStudents() {
  const [search,        setSearch]        = useState("");
  const [filterClass,   setFilterClass]   = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [page,          setPage]          = useState(1);
  const PER_PAGE = 20;

  const { students, totalCount, totalPages, loading, error, refetch,
          createStudent, updateStudent, deleteStudent } = useStudents({
    page, limit: PER_PAGE, cls: filterClass, section: filterSection, search,
  });

  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");

  // Multi-select state
  const [checkedIds, setCheckedIds] = useState(new Set());
  const allChecked = students.length > 0 && students.every((s) => checkedIds.has(s._id));

  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(students.map((s) => s._id)));
  };
  const toggleOne = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openAdd = () => { setForm(EMPTY_FORM); setFormErr(""); setSelected(null); setModal("add"); };

  // ── CHANGE 2: openEdit now includes all new fields ──
  const openEdit = (s) => {
    setSelected(s);
    setForm({
      name:        s.name        || "",
      class:       s.class       || "",
      section:     s.section     || "A",
      rollNo:      s.rollNo      || "",
      admissionNo: s.admissionNo || "",
      aadharNo:    s.aadharNo    || "",
      fatherName:  s.fatherName  || "",
      motherName:  s.motherName  || "",
      parentName:  s.parentName  || "",
      parentPhone: s.parentPhone || "",
      address:     s.address     || "",
      gender:      s.gender      || "",
      dob:         s.dob ? s.dob.slice(0, 10) : "",
    });
    setFormErr(""); setModal("edit");
  };

  const closeModal   = () => { setModal(null); setSelected(null); setFormErr(""); };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.class) { setFormErr("Name and class are required."); return; }
    setSaving(true); setFormErr("");
    try {
      modal === "add" ? await createStudent(form) : await updateStudent(selected._id, form);
      closeModal();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteStudent(selected._id); closeModal(); }
    catch { setFormErr("Failed to delete student."); }
    finally { setSaving(false); }
  };

  const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-2 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Students</h1>
          <p className="text-sm text-slate-400 mt-0.5">{totalCount} students enrolled</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
            <PlusIcon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
          <span className="sm:hidden inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            {totalCount} records
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col w-full">

        {/* Filter bar */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center flex-shrink-0">
          <div className="relative flex-1 min-w-[130px] max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input className={`${inputCls} pl-9`} placeholder="Search…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setCheckedIds(new Set()); }} />
          </div>
          <select className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setPage(1); setCheckedIds(new Set()); }}>
            <option value="">All Classes</option>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterSection}
            onChange={(e) => { setFilterSection(e.target.value); setPage(1); setCheckedIds(new Set()); }}>
            <option value="">All Sections</option>
            {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
          {checkedIds.size > 0 && (
            <button onClick={() => setModal("bulk")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
              <Squares2X2Icon className="w-4 h-4" />
              Assign Section ({checkedIds.size})
            </button>
          )}
          <span className="hidden sm:inline-flex ml-auto items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            {totalCount} records
          </span>
        </div>

        {/* Table */}
        {loading ? <Spinner /> : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="text-sm min-w-[720px] w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
                  </th>
                  {["Student", "Class", "Section", "Roll No", "Parent", "Phone", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <UserIcon className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium text-slate-400">No students found</p>
                      <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td></tr>
                ) : students.map((s) => (
                  <tr key={s._id} className={`hover:bg-slate-50 transition-colors ${checkedIds.has(s._id) ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={checkedIds.has(s._id)} onChange={() => toggleOne(s._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          {initials(s.name)}
                        </div>
                        <p className="font-medium text-slate-700 whitespace-nowrap">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 whitespace-nowrap">
                        Class {s.class}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setSelected(s); setModal("assign"); }}
                        title="Click to change section"
                        className="group flex items-center gap-1.5 hover:opacity-75 transition-opacity">
                        <SectionBadge section={s.section || "A"} />
                        <span className="text-slate-300 group-hover:text-slate-400 text-xs transition-colors">✎</span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{s.rollNo || "—"}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{s.parentName || "—"}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{s.parentPhone || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelected(s); setModal("delete"); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
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

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-100 flex-wrap gap-3 flex-shrink-0">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
              <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PageBtn>
              {pages.map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="text-xs text-slate-300 px-1">…</span>}
                  <PageBtn active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
                </React.Fragment>
              ))}
              <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PageBtn>
              <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── CHANGE 3: Add / Edit Modal with new fields ── */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add New Student" : "Edit Student"} onClose={closeModal}>
          {formErr && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{formErr}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* ── Identity ── */}
            <FormField label="Full Name" required>
              <input className={inputCls} name="name" value={form.name} onChange={handleChange} placeholder="Student name" />
            </FormField>
            <FormField label="Class" required>
              <select className={inputCls} name="class" value={form.class} onChange={handleChange}>
                <option value="">Select Class</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Section" required>
              <div className="grid grid-cols-4 gap-2">
                {SECTIONS.map((s) => (
                  <button key={s} type="button"
                    onClick={() => setForm((p) => ({ ...p, section: s }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border-2
                      ${form.section === s
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                      }`}>
                    {s}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Roll Number">
              <input className={inputCls} name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 101" />
            </FormField>

            {/* ── NEW: Admission & Aadhar ── */}
            <FormField label="Admission No.">
              <input className={inputCls} name="admissionNo" value={form.admissionNo} onChange={handleChange} placeholder="e.g. ADM-2024-001" />
            </FormField>
            <FormField label="Aadhar No.">
              <input className={inputCls} name="aadharNo" value={form.aadharNo} onChange={handleChange} placeholder="12-digit Aadhar number" />
            </FormField>

            {/* ── NEW: Father & Mother ── */}
            <FormField label="Father's Name">
              <input className={inputCls} name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name" />
            </FormField>
            <FormField label="Mother's Name">
              <input className={inputCls} name="motherName" value={form.motherName} onChange={handleChange} placeholder="Mother's full name" />
            </FormField>

            {/* ── Personal ── */}
            <FormField label="Gender">
              <select className={inputCls} name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input className={inputCls} type="date" name="dob" value={form.dob} onChange={handleChange} />
            </FormField>

            {/* ── Contact ── */}
            <FormField label="Parent Name">
              <input className={inputCls} name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent / guardian name" />
            </FormField>
            <FormField label="Parent Phone">
              <input className={inputCls} name="parentPhone" value={form.parentPhone} onChange={handleChange} placeholder="10-digit number" />
            </FormField>

            <div className="col-span-1 sm:col-span-2">
              <FormField label="Address">
                <textarea className={`${inputCls} resize-none`} name="address" value={form.address} onChange={handleChange} placeholder="Full address" rows={2} />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : modal === "add" ? "Add Student" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <Modal title="Confirm Delete" onClose={closeModal} small>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-7 h-7 text-rose-500" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Delete Student?</p>
            <p className="text-sm text-slate-500">
              Permanently delete <strong>{selected?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}

      {/* Assign Section Modal (single student) */}
      {modal === "assign" && selected && (
        <AssignSectionModal student={selected} onClose={closeModal} onSaved={refetch} />
      )}

      {/* Bulk Assign Section Modal */}
      {modal === "bulk" && (
        <BulkAssignModal
          selectedIds={[...checkedIds]}
          onClose={closeModal}
          onSaved={() => { refetch(); setCheckedIds(new Set()); }}
        />
      )}
    </div>
  );
}