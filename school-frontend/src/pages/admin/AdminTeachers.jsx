import { useState } from "react";
import { useTeachers } from "@/hooks/useTeachers";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const SUBJECTS = [
  "Mathematics","Science","English","Hindi","Social Studies",
  "Computer Science","Physical Education","Art","Music","Other",
];

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", subject: "", qualification: "", experience: "", address: "" };

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

export default function AdminTeachers() {
  const { teachers, loading, error, createTeacher, updateTeacher, deleteTeacher } = useTeachers();
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState("");
  const [page, setPage]         = useState(1);
  const PER_PAGE = 10;

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return !q || t.user?.name?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm(EMPTY_FORM); setFormErr(""); setSelected(null); setModal("add"); };
  const openEdit = (t) => {
    setSelected(t);
    setForm({ name: t.user?.name||"", email: t.user?.email||"", password: "", phone: t.phone||"", subject: t.subject||"", qualification: t.qualification||"", experience: t.experience||"", address: t.address||"" });
    setFormErr(""); setModal("edit");
  };
  const closeModal = () => { setModal(null); setSelected(null); setFormErr(""); };
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setFormErr("Name and email are required."); return; }
    if (modal === "add" && !form.password) { setFormErr("Password is required for new teachers."); return; }
    setSaving(true); setFormErr("");
    try {
      if (modal === "add") {
        await createTeacher(form);
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateTeacher(selected._id, payload);
      }
      closeModal();
    } catch (e) {
      setFormErr(e?.response?.data?.message || "Something went wrong.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteTeacher(selected._id); closeModal(); }
    catch { setFormErr("Failed to delete teacher."); }
    finally { setSaving(false); }
  };

  const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center justify-between sm:block">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
            <p className="text-sm text-slate-400 mt-0.5">{teachers.length} teachers on staff</p>
          </div>
          {/* Add button + badge — visible only on mobile, right-aligned */}
          <div className="sm:hidden flex flex-col items-end gap-1.5">
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
              <PlusIcon className="w-4 h-4" /> Add
            </button>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
              {filtered.length} records
            </span>
          </div>
        </div>

        {/* Add button — visible only on desktop */}
        <button onClick={openAdd} className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200">
          <PlusIcon className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input className={`${inputCls} pl-9`} placeholder="Search by name, email, subject…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          {/* Record badge — visible only on desktop, inside the detail box */}
          <span className="hidden sm:inline-flex ml-auto items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
            {filtered.length} records
          </span>
        </div>

        {loading ? <Spinner /> : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Teacher","Subject","Phone","Qualification","Experience","Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <UsersIcon className="w-10 h-10 text-slate-200 mb-3" />
                      <p className="text-sm font-medium text-slate-400">No teachers found</p>
                      <p className="text-xs text-slate-300 mt-1">Add teachers or adjust your search.</p>
                    </div>
                  </td></tr>
                ) : paginated.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                          {initials(t.user?.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{t.user?.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <EnvelopeIcon className="w-3 h-3" />{t.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600">
                        {t.subject || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {t.phone ? <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" />{t.phone}</span> : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{t.qualification || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{t.experience ? `${t.experience} yrs` : "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(t)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelected(t); setModal("delete"); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
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

        {!loading && !error && filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-wrap gap-3">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
              <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PageBtn>
              {pages.map((p, i, arr) => (
                <>
                  {i > 0 && arr[i-1] !== p-1 && <span key={`e${p}`} className="text-xs text-slate-300 px-1">…</span>}
                  <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
                </>
              ))}
              <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PageBtn>
              <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add New Teacher" : "Edit Teacher"} onClose={closeModal}>
          {formErr && (
            <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{formErr}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input className={inputCls} name="name" value={form.name} onChange={handleChange} placeholder="Teacher name" />
            </FormField>
            <FormField label="Email" required>
              <input className={inputCls} type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@school.com" />
            </FormField>
            <FormField label={modal === "add" ? "Password" : "New Password"} required={modal === "add"}>
              <input className={inputCls} type="password" name="password" value={form.password} onChange={handleChange}
                placeholder={modal === "edit" ? "Leave blank to keep current" : "Min. 6 characters"} />
            </FormField>
            <FormField label="Phone">
              <input className={inputCls} name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" />
            </FormField>
            <FormField label="Subject">
              <select className={inputCls} name="subject" value={form.subject} onChange={handleChange}>
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Qualification">
              <input className={inputCls} name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. B.Ed, M.Sc" />
            </FormField>
            <FormField label="Experience (years)">
              <input className={inputCls} type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="Years of experience" min={0} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Address">
                <textarea className={`${inputCls} resize-none`} name="address" value={form.address} onChange={handleChange} placeholder="Full address" rows={2} />
              </FormField>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : modal === "add" ? "Add Teacher" : "Save Changes"}
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
            <p className="font-semibold text-slate-800 mb-1">Delete Teacher?</p>
            <p className="text-sm text-slate-500">
              Permanently delete <strong>{selected?.user?.name}</strong> and their login account? This cannot be undone.
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
    </div>
  );
}