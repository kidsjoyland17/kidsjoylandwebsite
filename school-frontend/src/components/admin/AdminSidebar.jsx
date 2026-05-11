import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/constants/routes";
import logo from "@/assets/logo.png";
import { useState } from "react";

import {
  RiDashboardLine,
  RiUserLine,
  RiTeamLine,
  RiFileListLine,
  RiMessageLine,
  RiLogoutBoxLine,
  RiBookOpenLine,
  RiCalendarScheduleLine,
  RiTaskLine,
  RiGraduationCapLine,
  RiGalleryLine,
  RiMegaphoneLine,
  RiInformationLine,
  RiChatQuoteLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiFilePdf2Line,
  RiLayoutGridLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

const ICON_MAP = {
  dashboard:    <RiDashboardLine />,
  students:     <RiUserLine />,
  teachers:     <RiTeamLine />,
  admissions:   <RiFileListLine />,
  messages:     <RiMessageLine />,
  banners:      <RiMegaphoneLine />,
  gallery:      <RiGalleryLine />,
  classes:      <RiBookOpenLine />,
  timetable:    <RiCalendarScheduleLine />,
  attendance:   <RiTaskLine />,
  passouts:     <RiGraduationCapLine />,
  about:        <RiInformationLine />,
  testimonials: <RiChatQuoteLine />,
  result:       <RiFilePdf2Line />,
};

export default function AdminSidebar({ open, onToggle, mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [componentsOpen, setComponentsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const COMPONENT_KEYS = ["banners", "gallery", "about", "testimonials"];

  const mainNavItems = ADMIN_NAV.filter(
    (item) => !COMPONENT_KEYS.includes(item.key)
  );

  const componentItems = ADMIN_NAV.filter((item) =>
    COMPONENT_KEYS.includes(item.key)
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-slate-100 shadow-sm
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
        ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo + Close */}
      <div className="flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-4">
        <img
          src={logo}
          alt="KJS Logo"
          className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
        />
        {(open || mobileOpen) && (
          <>
            <span className="font-bold text-slate-800 text-base ml-3 flex-1">
              KJS Admin
            </span>
            <button
              onClick={onToggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {(open || mobileOpen) && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Main Menu
          </p>
        )}

        {/* MAIN NAV ITEMS */}
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
                  className={`text-lg flex-shrink-0 ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {ICON_MAP[item.key] || <RiDashboardLine />}
                </span>
                {(open || mobileOpen) && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* COMPONENTS DROPDOWN */}
        <div className="mx-2 mt-2">
          <button
            onClick={() => setComponentsOpen(!componentsOpen)}
            className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <RiLayoutGridLine className="text-lg flex-shrink-0" />
              {(open || mobileOpen) && <span>Components</span>}
            </div>
            {(open || mobileOpen) &&
              (componentsOpen ? <RiArrowDownSLine /> : <RiArrowRightSLine />)}
          </button>

          {/* Collapsed: icon-only */}
          {componentsOpen && !open && !mobileOpen && (
            <div className="mt-1 space-y-1">
              {componentItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center justify-center mx-auto px-3 py-2 rounded-lg text-sm
                    ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50"
                    }`
                  }
                >
                  <span className="text-base">{ICON_MAP[item.key]}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Expanded: icon + label */}
          {componentsOpen && (open || mobileOpen) && (
            <div className="ml-6 mt-1 space-y-1">
              {componentItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50"
                    }`
                  }
                >
                  <span className="text-base">{ICON_MAP[item.key]}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        {(open || mobileOpen) && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors ${
            !open && !mobileOpen ? "justify-center" : ""
          }`}
        >
          <RiLogoutBoxLine className="text-lg flex-shrink-0" />
          {(open || mobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}