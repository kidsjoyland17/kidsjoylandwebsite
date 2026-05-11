import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function NoticeTicker() {
  const [notices, setNotices] = useState([]);
  const [paused, setPaused]   = useState(false);
  const [popup, setPopup]     = useState(null);

  useEffect(() => {
    api.get("/notices/public")
      .then((r) => {
        const list = r.data?.data || [];
        setNotices(list);
      })
      .catch(() => {});
  }, []);

  if (notices.length === 0) return null;

  const items = [...notices, ...notices];

  return (
    <>
      <div
        className="w-full overflow-hidden relative z-10"
        style={{
          background: "linear-gradient(90deg, #0d1f3c 0%, #0f2a50 50%, #0d1f3c 100%)",
          borderTop:    "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Scrolling track */}
        <div
          className="flex items-center py-2.5"
          style={{
            animation: paused
              ? "noticescroll 60s linear infinite paused"
              : "noticescroll 60s linear infinite",
            willChange: "transform",
            width: "max-content",
          }}
        >
          {items.map((notice, i) => (
            <span
              key={`${notice._id}-${i}`}
              className="inline-flex items-center gap-2 mx-8 cursor-pointer select-none"
              onClick={() => {
                setPopup(notice);
                setPaused(true);
              }}
            >
              {/* Title in yellow */}
              <span
                className="text-sm font-semibold whitespace-nowrap hover:underline"
                style={{ color: "#fde68a" }}
              >
                {notice.title}
              </span>

              {/* Dash separator */}
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>-</span>

              {/* Message in white */}
              {notice.message && (
                <span
                  className="text-sm whitespace-nowrap max-w-[300px] truncate"
                  style={{ color: "rgba(255,255,255,0.90)" }}
                >
                  {notice.message}
                </span>
              )}

              {/* Bullet separator */}
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", marginLeft: "8px" }}>✦</span>
            </span>
          ))}
        </div>

        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: "linear-gradient(90deg, #0d1f3c 60%, transparent 100%)" }}
        />

        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: "linear-gradient(270deg, #0d1f3c 60%, transparent 100%)" }}
        />

        <style>{`
          @keyframes noticescroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Popup Modal */}
      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => {
            setPopup(null);
            setPaused(false);
          }}
        >
          <div
            className="relative rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setPopup(null);
                setPaused(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{
                background: "rgba(0,0,0,0.06)",
                color: "rgba(0,0,0,0.5)",
                fontSize: "16px",
              }}
            >
              ✕
            </button>

            {/* Notice label */}
            <div className="mb-4">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                style={{
                  background: "#fffff",
                  color: "#ebd122",
                  border: "1px solid rgba(253,230,138,0.6)",
                  letterSpacing: "0.15em",
                }}
              >
                Notice
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold mb-3 pr-6"
              style={{ color: "#ebd122" }}
            >
              {popup.title}
            </h2>

            {/* Divider */}
            <div
              className="mb-4"
              style={{ height: "1px", background: "rgba(0,0,0,0.08)" }}
            />

            {/* Full message */}
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#1f2937" }}
            >
              {popup.message}
            </p>

            {/* Date & Class row */}
            <div
              className="flex items-center justify-between mt-5 pt-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              {popup.targetClass && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(56,189,248,0.1)",
                    color: "#0369a1",
                    border: "1px solid rgba(56,189,248,0.3)",
                  }}
                >
                  {popup.targetClass}
                </span>
              )}
              {popup.date && (
                <span className="text-xs" style={{ color: "#9ca3af" }}>
                  {formatDate(popup.date)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}