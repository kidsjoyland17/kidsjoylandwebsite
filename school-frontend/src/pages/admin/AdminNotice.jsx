import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCalendarLine,
  RiGraduationCapLine,
  RiFileListLine,
} from "react-icons/ri";

const CLASSES = [
  "All Classes",
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  
];

export default function AdminNotice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [editNotice, setEditNotice] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    date: new Date().toISOString().split("T")[0],
    targetClass: "All Classes",
  });

  const fetchNotices = () => {
    setLoading(true);
    api
      .get("/notices")
      .then((r) => setNotices(r.data.data || []))
      .catch(() => showToast("Failed to load notices.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
      targetClass: "All Classes",
    });
    setEditNotice(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      showToast("Title and message are required.", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (editNotice) {
        await api.put(`/notices/${editNotice._id}`, form);
        showToast("Notice updated!");
      } else {
        await api.post("/notices", form);
        showToast("Notice created!");
      }

      resetForm();
      fetchNotices();
    } catch (err) {
      showToast(err?.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      showToast("Notice deleted.");
      setDeleteId(null);
      fetchNotices();
    } catch (err) {
      console.error(err);
      showToast("Delete failed.", "error");
    }
  };

  const handleEdit = (notice) => {
    setForm({
      title: notice.title,
      message: notice.message,
      date:
        notice.date?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      targetClass: notice.targetClass,
    });

    setEditNotice(notice);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-lg z-50 ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Notice Board
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage notices
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm((p) => !p);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <RiAddLine />
          {showForm ? "Cancel" : "New Notice"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border mb-6">
          <h2 className="font-bold mb-4">
            {editNotice ? "Edit Notice" : "Create Notice"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <select
                name="targetClass"
                value={form.targetClass}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="border px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <RiFileListLine className="text-4xl mx-auto mb-2" />
          No notices yet
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2"
            >
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <RiGraduationCapLine />
                  {notice.targetClass}
                </span>

                <span className="flex items-center gap-1">
                  <RiCalendarLine />
                  {new Date(notice.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-semibold text-gray-800">
                {notice.title}
              </h3>

              <p className="text-sm text-gray-600">
                {notice.message}
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(notice)}
                  className="flex-1 flex items-center justify-center gap-1 border rounded-lg py-1 text-sm"
                >
                  <RiEditLine /> Edit
                </button>

                <button
                  onClick={() => setDeleteId(notice._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 rounded-lg py-1 text-sm"
                >
                  <RiDeleteBinLine /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Delete Confirmation Modal — THIS WAS MISSING */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Delete Notice?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="border px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}