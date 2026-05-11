import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
  RiDashboardLine,
  RiFileListLine,
  RiCalendarLine,
  RiNotification3Line,
  RiUserLine,
  RiLogoutBoxLine,
  RiCloseLine,
  RiBookOpenLine,
} from "react-icons/ri";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/teacher/dashboard", label: "Dashboard", icon: <RiDashboardLine /> },
  { to: "/teacher/profile", label: "My Profile", icon: <RiUserLine /> },
  { to: "/teacher/timetable", label: "Timetable", icon: <RiCalendarLine /> },
  { to: "/teacher/notices", label: "Notices", icon: <RiNotification3Line /> },
  { to: "/teacher/classes", label: "My Classes", icon: <RiBookOpenLine /> },
];

export default function TeacherSidebar({ open, onToggle, mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "T";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Show text if desktop sidebar is open OR mobile drawer is open
  const showText = open || mobileOpen;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-slate-100 shadow-sm
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
        ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo + Close button */}
      <div className="flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-4">
        <img
          src={logo}
          alt="KJS Logo"
          className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
        />
        {showText && (
          <>
            <span className="font-bold text-slate-800 text-base whitespace-nowrap overflow-hidden ml-3 flex-1">
              KJS Teacher
            </span>
            <button
              onClick={mobileOpen ? () => setMobileOpen(false) : onToggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex-shrink-0"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {showText && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Main Menu
          </p>
        )}
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
              ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-lg flex-shrink-0 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {item.icon}
                </span>
                {showText && (
                  <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        {showText && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 whitespace-nowrap truncate">
                {user?.name || "Teacher"}
              </p>
              <p className="text-xs text-slate-400">Educator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors ${
            !showText ? "justify-center" : ""
          }`}
        >
          <RiLogoutBoxLine className="text-lg flex-shrink-0" />
          {showText && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}