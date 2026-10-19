import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileBarChart2,
  Menu,
  TrendingUp,
  X,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  Database,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePharmacy } from "../context/PharmacyContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

interface MobileNavbarProps {
  onOpenReorder?: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ onOpenReorder }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isFirebaseAvailable } = useAuth();
  const { privacyMode, togglePrivacyMode, medicines, exportDatabaseJSON } = usePharmacy();
  const { isDark, setTheme } = useTheme();

  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;

  const navLinks = [
    { title: "Home", path: "/", icon: LayoutDashboard },
    { title: "Inventory", path: "/inventory", icon: Package },
    { title: "POS Sale", path: "/sales", icon: ShoppingCart, isSpecial: true },
    { title: "Reports", path: "/reports", icon: FileBarChart2 },
  ];

  return (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-2 py-1.5 shadow-lg safe-area-pb">
        <div className="flex items-center justify-around h-14">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.isSpecial) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative -top-3 flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-white shadow-lg shadow-primary/30 transform active:scale-95 transition-all"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-0.5">POS</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.path === "/" && lowStockCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.title}</span>
              </NavLink>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div
            className="absolute inset-0"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative bg-card rounded-t-3xl border-t border-border p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-250">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  SMMC
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    SMMC Pharmacy Pro
                  </h3>
                  <p className="text-xs text-muted-foreground">Quick Menu & Settings</p>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2.5">
              <NavLink
                to="/demand"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/50 text-foreground text-sm font-medium"
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Demand Analysis</span>
              </NavLink>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  if (onOpenReorder) onOpenReorder();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 hover:bg-muted border border-border/50 text-foreground text-sm font-medium"
              >
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                <span>Supplier Orders</span>
              </button>
            </div>

            {/* Preference Controls */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display & Security
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  {privacyMode ? (
                    <EyeOff className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Privacy Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {privacyMode ? "Values are hidden" : "Show all financial figures"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={togglePrivacyMode}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    privacyMode
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {privacyMode ? "Masked" : "Hide Values"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {isDark ? "Dark theme active" : "Light theme active"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
                >
                  Switch to {isDark ? "Light" : "Dark"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Backup JSON</p>
                    <p className="text-xs text-muted-foreground">Export full ERP state</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    exportDatabaseJSON();
                    setDrawerOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Download
                </button>
              </div>
            </div>

            {/* User Profile & Sign Out */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                  {user?.displayName?.slice(0, 2).toUpperCase() || "AD"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.displayName || "Pharmacist"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "admin@smmc.com"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
