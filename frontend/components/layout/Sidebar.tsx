"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Kanban, BarChart2,
  LogOut, Sparkles, ChevronLeft, Sun, Moon, User,
} from "lucide-react";
import { useAuthStore } from "../../lib/store";
import { cn, getInitials, stringToColor } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/kanban", label: "Kanban Board", icon: Kanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const avatarColor = user ? stringToColor(user.name) : "#3b82f6";

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/5 transition-all duration-300",
        "glass-strong",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors"
      >
        <ChevronLeft
          size={12}
          className={cn("text-white transition-transform duration-300", collapsed && "rotate-180")}
        />
      </button>

      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-5 border-b border-white/5", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-white text-sm whitespace-nowrap">
            InternTrack Pro
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={17}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/60"
                )}
              />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Toggle theme" : undefined}
        >
          {theme === "dark" ? <Sun size={17} className="flex-shrink-0" /> : <Moon size={17} className="flex-shrink-0" />}
          {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User profile */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1 bg-white/3 border border-white/5",
            collapsed && "justify-center px-0"
          )}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: avatarColor }}
          >
            {user ? getInitials(user.name) : <User size={14} />}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white/80 truncate">{user?.name}</div>
              <div className="text-[10px] text-white/30 truncate">{user?.email}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
