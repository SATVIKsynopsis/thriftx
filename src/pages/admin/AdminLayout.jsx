"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  ShoppingBag,
  Package,
  BarChart3,
  Home,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  User,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children, title, description, breadcrumb }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop
  const { currentUser, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navItems = useMemo(
    () => [
      { path: "/admin", label: "Dashboard", icon: Home },
      { path: "/admin/vendors", label: "Vendors", icon: Users },
      { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { path: "/admin/products", label: "Products", icon: Package },
      { path: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
    []
  );

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname?.startsWith(path);
  };

  const goToMainSite = () => router.push("/");
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const toggleCollapse = () => setSidebarCollapsed((c) => !c);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // widths: collapsed=80px (~w-20), expanded=280px (~w-72/18rem)
  const sidebarWidthDesktop = sidebarCollapsed ? "md:w-20" : "md:w-72";
  const headerLeftOffset = sidebarCollapsed ? "md:ml-20" : "md:ml-72";
  const mainLeftOffset = headerLeftOffset;

  return (
 

    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay (mobile) */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50",
          // desktop width
          sidebarWidthDesktop,
          // desktop transform static
          "md:translate-x-0",
          // mobile width and slide
          "w-72 md:w-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "transition-all duration-300 ease-in-out",
          "overflow-y-auto",
          "pt-4",
        ].join(" ")}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute top-3 right-3 items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 transition"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Sidebar header */}
        <div
          className={[
            "border-b border-gray-200",
            sidebarCollapsed ? "px-4 pb-4 pt-10" : "px-6 pb-6 pt-6",
            "transition-all",
          ].join(" ")}
        >
          <h2
            className={[
              "font-bold text-gray-900",
              sidebarCollapsed ? "text-base text-center" : "text-2xl",
              "transition-all",
            ].join(" ")}
          >
            {sidebarCollapsed ? "TX" : "Admin Panel"}
          </h2>
          {!sidebarCollapsed && (
            <p className="text-sm text-gray-500 mt-1">ThriftX Management</p>
          )}
        </div>

        {/* Nav */}
        <nav className="py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={closeSidebar}
                className={[
                  "group relative flex items-center",
                  sidebarCollapsed ? "px-4 py-2.5 justify-center" : "px-6 py-2.5",
                  active
                    ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100",
                  "transition-all",
                ].join(" ")}
              >
                <Icon className={["w-5 h-5", sidebarCollapsed ? "" : "mr-3"].join(" ")} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}

                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <span className="pointer-events-none absolute left-16 z-50 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile-only extra actions */}
          <div className="md:hidden mt-6 border-t border-gray-200 pt-3">
            <button
              onClick={() => {
                goToMainSite();
                closeSidebar();
              }}
              className="w-full flex items-center px-6 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition"
            >
              <ExternalLink className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Main Site</span>
            </button>
            <button
              onClick={() => {
                handleLogout();
                closeSidebar();
              }}
              className="w-full flex items-center px-6 py-2.5 text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Header */}
      <header
        className={[
          "fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30",
          "flex items-center",
          "px-4 md:px-8",
          "transition-all duration-300",
          headerLeftOffset, // push by sidebar on desktop
        ].join(" ")}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>

          <h1 className="text-gray-800 font-semibold text-lg md:text-xl">{title}</h1>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={goToMainSite}
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Main Site</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {userProfile?.name || currentUser?.displayName || "Admin"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>




      {/* Main */}
      <main
        className={[
          "flex-1 w-full",
          "pt-16", // header height
          "px-4 md:px-8",
          "pb-8",
          "transition-all duration-300",
          mainLeftOffset, // push by sidebar on desktop
        ].join(" ")}
      >
        
        <div className="max-w-7xl mx-auto">
          {/* Content header */}
          <div className="mb-8">
            {breadcrumb && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>Admin</span>
                <ChevronRight className="w-4 h-4 mx-1.5" />
                <span>{breadcrumb}</span>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
