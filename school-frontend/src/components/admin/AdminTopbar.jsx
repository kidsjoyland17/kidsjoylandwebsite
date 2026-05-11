import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RiMenuLine, RiNotification3Line } from "react-icons/ri";

export default function AdminTopbar({ onMenuClick, mobileOpen, sidebarOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

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
          onClick={() => navigate("/admin/messages")}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
        >
          <RiNotification3Line className="text-lg" />
        </button>
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}