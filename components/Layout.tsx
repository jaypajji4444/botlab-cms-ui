import {
  BookOpen,
  Briefcase,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  X,
  Zap,
} from "lucide-react";
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { label: "Pages", path: "/pages", icon: <FileText size={20} /> },
    { label: "Blogs", path: "/blogs", icon: <BookOpen size={20} /> },
    { label: "Sections", path: "/sections", icon: <Layers size={20} /> },
    { label: "Contacts", path: "/contacts", icon: <Mail size={20} /> },
    { label: "Portfolios", path: "/portfolios", icon: <Briefcase size={20} /> },
    { label: "Reports", path: "/reports", icon: <FileText size={20} /> },
    { label: "Careers", path: "/careers", icon: <Zap size={20} /> },
    {
      label: "Case Studies",
      path: "/case-studies",
      icon: <Briefcase size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight">BotLab CMS</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <div className="flex items-center space-x-3 text-slate-400 px-4 py-2 hover:text-white cursor-pointer">
            <Settings size={20} />
            <span>Settings</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 text-red-400 px-4 py-2 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center ml-auto space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">super@botlab.io</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
