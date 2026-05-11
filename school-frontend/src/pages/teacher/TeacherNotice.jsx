import { useState, useEffect } from "react";
import api from "@/lib/api";

const CLASSES = [
  "All Classes", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
];

const STORAGE_KEY = "teacher_read_notices";

const isNew = (dateStr) =>
  (Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24) <= 3;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const getReadIds = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const markAsRead = (id) => {
  const readIds = getReadIds();
  if (!readIds.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds, id]));
  }
};

export default function TeacherNotice() {
  const [notices, setNotices]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [search, setSearch]                 = useState("");
  const [filterClass, setFilterClass]       = useState("All Classes");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [readIds, setReadIds]               = useState(getReadIds);

  const fetchNotices = () => {
    setLoading(true);
    setError("");
    api
      .get("/notices")
      .then((r) => setNotices(r.data.data || []))
      .catch(() => setError("Failed to load notices. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleOpenNotice = (notice) => {
    setSelectedNotice(notice);
    markAsRead(notice._id);
    setReadIds(getReadIds());
  };

  const handleCloseNotice = () => setSelectedNotice(null);

  const filtered = notices.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q);
    const matchClass =
      filterClass === "All Classes" ||
      n.targetClass === filterClass ||
      n.targetClass === "All Classes";
    return matchSearch && matchClass;
  });

  const unreadCount = notices.filter((n) => isNew(n.date) && !readIds.includes(n._id)).length;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>📋 Notice Board</h1>
          <p style={styles.subheading}>
            {notices.length} total — {unreadCount} unread
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchNotices}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        {[
          { label: "Total Notices",   value: notices.length,      color: "#2563EB" },
          { label: "Unread",          value: unreadCount,          color: "#16A34A" },
          { label: "For All Classes", value: notices.filter((n) => n.targetClass === "All Classes").length, color: "#9333EA" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter — left aligned, same row always */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <span style={{ fontSize: 16, marginRight: 8, flexShrink: 0 }}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={styles.select}
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {/* List */}
      {loading ? (
        <div style={styles.emptyState}>
          <div style={styles.spinner} />
          <p style={{ color: "#6B7280", marginTop: 16 }}>Loading notices...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48 }}>🔔</div>
          <p style={{ color: "#6B7280", marginTop: 8 }}>No notices found.</p>
        </div>
      ) : (
        <div style={styles.noticeList}>
          {filtered.map((notice) => {
            const isUnread = isNew(notice.date) && !readIds.includes(notice._id);
            return (
              <div
                key={notice._id}
                style={{
                  ...styles.noticeCard,
                  border: isUnread ? "1.5px solid #BFDBFE" : "1px solid #E5E7EB",
                  background: isUnread ? "#F0F7FF" : "#fff",
                }}
                onClick={() => handleOpenNotice(notice)}
              >
                <div style={styles.accentBar} />
                <div style={styles.noticeContent}>
                  <div style={styles.noticeMeta}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={styles.classBadge}>🎓 {notice.targetClass}</span>
                      {isUnread && <span style={styles.newBadge}>UNREAD</span>}
                    </div>
                    <span style={styles.dateText}>📅 {formatDate(notice.date)}</span>
                  </div>
                  <h3 style={styles.noticeTitle}>{notice.title}</h3>
                  <p style={styles.noticePreview}>
                    {notice.message?.length > 120
                      ? notice.message.slice(0, 120) + "..."
                      : notice.message}
                  </p>
                  <span style={styles.readMore}>Read more →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup */}
      {selectedNotice && (
        <div style={styles.modalOverlay} onClick={handleCloseNotice}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {/* Top row: NOTICE badge + close button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={styles.noticeLabelBadge}>NOTICE</span>
              <button style={styles.closeBtn} onClick={handleCloseNotice}>✕</button>
            </div>

            {/* Yellow title */}
            <h2 style={styles.modalTitle}>{selectedNotice.title}</h2>

            {/* Divider */}
            <hr style={styles.divider} />

            {/* Full message */}
            <p style={styles.modalMessage}>{selectedNotice.message}</p>

            {/* Divider */}
            <hr style={styles.divider} />

            {/* Bottom row: class badge + date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={styles.modalClassBadge}>{selectedNotice.targetClass}</span>
              <span style={styles.modalDate}>{formatDate(selectedNotice.date)}</span>
            </div>

          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .notice-filter-bar {
            flex-wrap: nowrap !important;
          }
          .notice-search-wrap {
            min-width: 0 !important;
            flex: 1 !important;
          }
          .notice-select {
            flex-shrink: 0 !important;
            width: auto !important;
            min-width: 110px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page:             { minHeight: "100vh", background: "#F9FAFB", padding: "32px 24px", fontFamily: "'Segoe UI', sans-serif", width: "100%", boxSizing: "border-box" },
  header:           { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  heading:          { fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 },
  subheading:       { fontSize: 14, color: "#6B7280", marginTop: 4 },
  refreshBtn:       { background: "#fff", border: "1.5px solid #D1D5DB", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#374151" },
  statsBar:         { display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" },
  statCard:         { flex: 1, minWidth: 120, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 20px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  statValue:        { fontSize: 24, fontWeight: 700 },
  statLabel:        { fontSize: 12, color: "#6B7280", marginTop: 2, fontWeight: 500 },

  /* Filter bar — left aligned, never wraps, same row on all screens */
  filterBar:        { display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 10, marginBottom: 24, justifyContent: "flex-start", alignItems: "center", width: "100%", boxSizing: "border-box" },
  searchWrap:       { display: "flex", alignItems: "center", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "0 12px", flex: 1, minWidth: 0, maxWidth: 360 },
  searchInput:      { flex: 1, border: "none", outline: "none", fontSize: 14, padding: "10px 0", fontFamily: "inherit", background: "transparent", color: "#111827", minWidth: 0 },
  select:           { padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, background: "#fff", color: "#374151", fontFamily: "inherit", cursor: "pointer", outline: "none", flexShrink: 0, width: 140 },

  errorBox:         { background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14 },
  noticeList:       { display: "flex", flexDirection: "column", gap: 14, width: "100%" },
  noticeCard:       { borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", overflow: "hidden", cursor: "pointer", width: "100%", boxSizing: "border-box" },
  accentBar:        { width: 5, background: "linear-gradient(180deg, #2563EB, #60A5FA)", flexShrink: 0 },
  noticeContent:    { padding: "18px 20px", flex: 1 },
  noticeMeta:       { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  classBadge:       { background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  newBadge:         { background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5 },
  dateText:         { fontSize: 12, color: "#9CA3AF", fontWeight: 500 },
  noticeTitle:      { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px", textAlign: "left" },
  noticePreview:    { fontSize: 14, color: "#4B5563", margin: 0, lineHeight: 1.6, textAlign: "left" },
  readMore:         { fontSize: 13, color: "#2563EB", fontWeight: 600, marginTop: 10, display: "inline-block" },
  emptyState:       { textAlign: "center", padding: "60px 20px" },
  spinner:          { width: 36, height: 36, border: "3px solid #E5E7EB", borderTop: "3px solid #2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" },
  modalOverlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.50)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 24 },
  modal:            { background: "#ffffff", borderRadius: 16, padding: "28px 28px 24px", width: "100%", maxWidth: 520, boxShadow: "0 12px 40px rgba(0,0,0,0.20)", maxHeight: "85vh", overflowY: "auto", position: "relative" },
  noticeLabelBadge: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#92400E", background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: 20, padding: "4px 12px" },
  closeBtn:         { width: 34, height: 34, borderRadius: "50%", border: "none", background: "#F3F4F6", color: "#6B7280", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 },
  modalTitle:       { fontSize: 20, fontWeight: 700, color: "#D97706", margin: "0 0 16px", textAlign: "left", lineHeight: 1.4 },
  divider:          { border: "none", borderTop: "1px solid #F3F4F6", margin: "0 0 16px" },
  modalMessage:     { fontSize: 15, color: "#374151", lineHeight: 1.8, margin: "0 0 16px", textAlign: "left", whiteSpace: "pre-wrap" },
  modalClassBadge:  { fontSize: 12, fontWeight: 600, color: "#2563EB", background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 20, padding: "4px 12px" },
  modalDate:        { fontSize: 13, color: "#9CA3AF", fontWeight: 500 },
};