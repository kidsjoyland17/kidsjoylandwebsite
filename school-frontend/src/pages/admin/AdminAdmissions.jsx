import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "waitlisted"];

const STATUS_STYLES = {
  pending:    "bg-amber-50 text-amber-600",
  approved:   "bg-emerald-50 text-emerald-600",
  rejected:   "bg-rose-50 text-rose-600",
  waitlisted: "bg-sky-50 text-sky-600",
};

const STATUS_COUNT_STYLES = {
  pending:    "bg-amber-50 text-amber-600 border border-amber-100",
  approved:   "bg-emerald-50 text-emerald-600 border border-emerald-100",
  rejected:   "bg-rose-50 text-rose-600 border border-rose-100",
  waitlisted: "bg-sky-50 text-sky-600 border border-sky-100",
};

const StatusIcon = ({ status, className = "w-3 h-3" }) => {
  if (status === "approved")   return <CheckCircleIcon className={className} />;
  if (status === "rejected")   return <ExclamationCircleIcon className={className} />;
  return <ClockIcon className={className} />;
};

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
      ${active ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

function Pagination({ page, totalPages, filtered, PER_PAGE, setPage }) {
  if (filtered.length <= PER_PAGE) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-wrap gap-3">
      <p className="text-xs text-slate-400">
        Showing {(page - 1) * PER_PAGE + 1}–
        {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
      </p>
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
        <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PageBtn>
        {pages.map((p, i, arr) => (
          <span key={p} className="inline-flex items-center gap-1">
            {i > 0 && arr[i - 1] !== p - 1 && (
              <span className="text-xs text-slate-300 px-1">…</span>
            )}
            <PageBtn active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
          </span>
        ))}
        <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
      </div>
    </div>
  );
}

export default function AdminAdmissions() {
  const [admissions,    setAdmissions]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [page,          setPage]          = useState(1);
  const [viewModal,     setViewModal]     = useState(null);
  const [deleteModal,   setDeleteModal]   = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const PER_PAGE = 10;

  useEffect(() => {
    api
      .get("/admin/admissions")
      .then((r) => setAdmissions(r.data.data || []))
      .catch(() => setError("Failed to load admissions."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/admissions/${id}/status`, { status });
      setAdmissions((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/admissions/${deleteModal._id}`);
      setAdmissions((prev) =>
        prev.filter((a) => a._id !== deleteModal._id)
      );
      setDeleteModal(null);
    } catch {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = admissions.filter((a) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      a.childName?.toLowerCase().includes(q) ||
      a.fatherName?.toLowerCase().includes(q) ||
      a.motherName?.toLowerCase().includes(q) ||
      a.parentEmail?.toLowerCase().includes(q) ||
a.parentPhone?.toLowerCase().includes(q);
    return matchQ && (!filterStatus || a.status === filterStatus);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admissions</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {admissions.length} total applications
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_OPTIONS.map((s) => (
            <span key={s} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COUNT_STYLES[s]}`}>
              <StatusIcon status={s} />
              {admissions.filter((a) => a.status === s).length} {s}
            </span>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex gap-3">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600 flex-shrink-0"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Body */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Child Name", "Class", "Father", "Phone", "Date", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardDocumentListIcon className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No admissions found</p>
                        <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                      {/* Child Name */}
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-700">{a.childName}</p>
                        <p className="text-xs text-slate-400">
                          {a.childDob ? new Date(a.childDob).getFullYear() : ""}
                        </p>
                      </td>
                      {/* Class */}
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          {a.applyingFor}
                        </span>
                      </td>
                      {/* Father Name */}
                      <td className="px-5 py-3 text-slate-500">
                        {a.fatherName || "—"}
                      </td>
                      {/* Phone */}
                      <td className="px-5 py-3 text-slate-500">
                        {a.parentPhone || "—"}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap text-xs">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3">
                        <select
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border-0 outline-none cursor-pointer ${STATUS_STYLES[a.status]}`}
                          value={a.status}
                          onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-white text-slate-700">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewModal(a)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(a)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          filtered={filtered}
          PER_PAGE={PER_PAGE}
          setPage={setPage}
        />
      </div>

      {/* View Modal */}
      {viewModal && (
        <Modal title="Admission Details" onClose={() => setViewModal(null)}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              ["Child Name",     viewModal.childName      || "—"],
              ["Applying For",   viewModal.applyingFor    || "—"],
            ["Date of Birth",  viewModal.childDob ? new Date(viewModal.childDob).toLocaleDateString("en-IN") : "—"],
              ["Gender",         viewModal.childGender             || "—"],
              ["Father's Name",  viewModal.fatherName     || "—"],
              ["Mother's Name",  viewModal.motherName     || "—"],
              ["Phone",          viewModal.parentPhone    || "—"],
              ["Email",          viewModal.parentEmail          || "—"],
              ["Admission Type", viewModal.admissionType  || "—"],
              ["Year",           viewModal.year           || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {label}
                </p>
                <p className="text-sm text-slate-700">{value}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Address
              </p>
              <p className="text-sm text-slate-700">{viewModal.address || "—"}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Status
                </p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[viewModal.status]}`}>
                  <StatusIcon status={viewModal.status} />
                  {viewModal.status}
                </span>
              </div>
              <select
                className="text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-slate-700"
                value={viewModal.status}
                onChange={(e) => {
                  handleStatusChange(viewModal._id, e.target.value);
                  setViewModal((p) => ({ ...p, status: e.target.value }));
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setViewModal(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal title="Delete Admission" onClose={() => setDeleteModal(null)} small>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-7 h-7 text-rose-500" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Delete Application?</p>
            <p className="text-sm text-slate-500">
              Permanently delete <strong>{deleteModal.childName}</strong>'s admission application?
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setDeleteModal(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, small }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${small ? "max-w-sm" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
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