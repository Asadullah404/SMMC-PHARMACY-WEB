import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileBarChart2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePharmacy } from "../context/PharmacyContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout, isFirebaseAvailable } = useAuth();
  const { medicines, prescriptions, privacyMode, togglePrivacyMode } = usePharmacy();
  const { isDark, setTheme, theme } = useTheme();
  const location = useLocation();

  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;
  const pendingRxCount = prescriptions.filter((p) => !p.processed).length;

  const navItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeVariant: "destructive" as const,
    },
    {
      title: "Inventory",
      path: "/inventory",
      icon: Package,
      badge: `${medicines.length}`,
      badgeVariant: "neutral" as const,
    },
    {
      title: "Sales & POS",
      path: "/sales",
      icon: ShoppingCart,
      badge: pendingRxCount > 0 ? `${pendingRxCount} Rx` : null,
      badgeVariant: "warning" as const,
    },
    {
      title: "Reports",
      path: "/reports",
      icon: FileBarChart2,
    },
    {
      title: "Demand Analytics",
      path: "/demand",
      icon: TrendingUp,
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 select-none shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/80 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 p-0.5 shadow-md shadow-primary/20 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SMMC"
                className="w-full h-full object-contain rounded-[10px] bg-card p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground truncate">
                  SMMC Pharmacy
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                  Pro
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                Healthcare ERP
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar (Ctrl+[)" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Management
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                )}
              />

              {!isCollapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeVariant === "destructive"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : item.badgeVariant === "warning"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {item.title}
                  {item.badge && ` (${item.badge})`}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status & Utility Controls */}
      <div className="p-3 border-t border-border/80 space-y-2">
        {/* Quick Toggles */}
        <div
          className={cn(
            "flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50",
            isCollapsed ? "flex-col" : "justify-between"
          )}
        >
          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacyMode}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-card text-muted-foreground hover:text-foreground",
              privacyMode && "text-amber-500 bg-card font-semibold shadow-sm"
            )}
            title={privacyMode ? "Privacy Mode Active (Amounts hidden)" : "Hide Numbers (Privacy Mode)"}
          >
            {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
            {!isCollapsed && <span>{privacyMode ? "Masked" : "Privacy"}</span>}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-card text-muted-foreground hover:text-foreground"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
            {!isCollapsed && <span>{isDark ? "Light" : "Dark"}</span>}
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "AD"}
            </div>
            {!isCollapsed && (
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-foreground truncate leading-tight">
                  {user?.displayName || "Admin Pharmacist"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isFirebaseAvailable ? "bg-emerald-500" : "bg-sky-500")} />
                  <span>{isFirebaseAvailable ? "Cloud Synced" : "Local Fast DB"}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
