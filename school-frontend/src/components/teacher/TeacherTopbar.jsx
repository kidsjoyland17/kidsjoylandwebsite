import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { RiMenuLine, RiNotification3Line } from "react-icons/ri";
import api from "@/lib/api";

const isNew = (dateStr) =>
  (Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24) <= 3;

const STORAGE_KEY = "teacher_read_notices";

export default function TeacherTopbar({ onMenuClick, mobileOpen, sidebarOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  useEffect(() => {
    const fetchUnread = () => {
      api.get("/notices").then((r) => {
        const notices = r.data.data || [];
        const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        const count = notices.filter(
          (n) => isNew(n.date) && !readIds.includes(n._id)
        ).length;
        setUnreadCount(count);
      }).catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    navigate("/teacher/notices");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 gap-3 sticky top-0 z-10 w-full">

      {/* Mobile: show hamburger only when sidebar is closed */}
      {!mobileOpen && (
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <RiMenuLine className="text-xl" />
        </button>
      )}

      {/* Desktop: show hamburger only when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={onMenuClick}
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <RiMenuLine className="text-xl" />
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleNotificationClick}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
        >
          <RiNotification3Line className="text-lg" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-[3px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}