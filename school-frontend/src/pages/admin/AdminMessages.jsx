import { useEffect, useState } from "react";
import api from "@/lib/api";
import { RiSearchLine, RiMessageLine, RiDeleteBinLine, RiCloseLine, RiMailLine, RiPhoneLine, RiCheckDoubleLine, RiEyeLine, RiAlertLine } from "react-icons/ri";

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
        Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of{" "}
        {filtered.length}
      </p>
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
        <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PageBtn>
        {pages.map((p, i, arr) => (
          <>
            {i > 0 && arr[i - 1] !== p - 1 && (
              <span key={`e${p}`} className="text-xs text-slate-300 px-1">…</span>
            )}
            <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
          </>
        ))}
        <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, small }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${small ? "max-w-sm" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminMessages() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [filterRead, setFilterRead]   = useState("");
  const [viewModal, setViewModal]     = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  const fetchMessages = () => {
    setLoading(true);
    api
      .get("/admin/messages")
      .then((r) => setMessages(r.data.data || []))
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/admin/messages/${id}/read`);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
    } catch (err) {
      console.error("Failed to mark message as read:", err);
      setError("Failed to mark message as read.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/messages/${deleteModal._id}`);
      setMessages((prev) => prev.filter((m) => m._id !== deleteModal._id));
      setDeleteModal(null);
    } catch {
      alert("Failed to delete message.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q);
    const matchRead =
      filterRead === "" ? true : filterRead === "unread" ? !m.read : m.read;
    return matchQ && matchRead;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const unreadCount = messages.filter((m) => !m.read).length;

  const openView = (m) => {
    if (!m.read) markRead(m._id);
    setViewModal(m);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {messages.length} total — {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            {unreadCount} new messages
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 min-w-0 sm:flex-none sm:w-64">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-slate-400"
              placeholder="Search by name, email, subject…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="flex-shrink-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-slate-600"
            value={filterRead}
            onChange={(e) => { setFilterRead(e.target.value); setPage(1); }}
          >
            <option value="">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Body */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="flex items-center gap-3 m-5 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            <RiAlertLine className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["From", "Subject", "Phone", "Date", "Status", "Actions"].map((h) => (
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
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <RiMessageLine className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No messages found</p>
                        <p className="text-xs text-slate-300 mt-1">
                          Visitor contact messages will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((m) => (
                    <tr
                      key={m._id}
                      className={`hover:bg-slate-50 transition-colors ${m.read ? "opacity-60" : ""}`}
                    >
                      <td className="px-5 py-3">
                        <p className={`text-slate-700 ${m.read ? "font-normal" : "font-semibold"}`}>
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <RiMailLine className="w-3 h-3" />
                          {m.email}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">
                        {m.subject || "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {m.phone ? (
                          <span className="flex items-center gap-1">
                            <RiPhoneLine className="w-3 h-3" />
                            {m.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            m.read ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {m.read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openView(m)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <RiEyeLine className="w-4 h-4" />
                          </button>
                          {!m.read && (
                            <button
                              onClick={() => markRead(m._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              title="Mark read"
                            >
                              <RiCheckDoubleLine className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal(m)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
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
        <Modal title={`Message from ${viewModal.name}`} onClose={() => setViewModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</p>
                <p className="text-sm text-slate-700">{viewModal.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                <p className="text-sm text-slate-700">{viewModal.email}</p>
              </div>
              {viewModal.phone && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                  <p className="text-sm text-slate-700">{viewModal.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Received</p>
                <p className="text-sm text-slate-500">
                  {viewModal.createdAt
                    ? new Date(viewModal.createdAt).toLocaleString("en-IN")
                    : "—"}
                </p>
              </div>
            </div>
            {viewModal.subject && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Subject</p>
                <p className="text-sm text-slate-700">{viewModal.subject}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Message</p>
              <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                {viewModal.message || "No message content."}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setViewModal(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <a
  href={`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(viewModal.email)}&su=${encodeURIComponent(`Re: ${viewModal.subject || "Your message"}`)}`}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
>
  <RiMailLine className="w-4 h-4" /> Reply by Email
</a>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <Modal title="Delete Message" onClose={() => setDeleteModal(null)} small>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <RiDeleteBinLine className="w-7 h-7 text-rose-500" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Delete this message?</p>
            <p className="text-sm text-slate-500">
              Message from <strong>{deleteModal.name}</strong> will be permanently deleted.
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