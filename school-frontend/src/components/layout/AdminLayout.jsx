import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMenuClick = () => {
    if (isMobile) setMobileOpen((p) => !p);
    else setSidebarOpen((p) => !p);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <AdminSidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onToggle={handleMenuClick}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <AdminTopbar
          onMenuClick={handleMenuClick}
          mobileOpen={mobileOpen}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full">
          <Outlet />
        </main>
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}