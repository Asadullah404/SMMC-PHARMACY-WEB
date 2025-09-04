import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Demand", url: "/demand", icon: TrendingUp },
];

export function MedicalSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-sidebar-foreground bg-sidebar-accent/50 hover:bg-sidebar-accent"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-smooth fixed md:static inset-y-0 left-0 z-50 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          // mobile open/close
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">MedStore</h1>
                <p className="text-xs text-sidebar-foreground/60">
                  Management System
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            return (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={() => setIsMobileOpen(false)} // auto-close on mobile
                className={cn(
                  "nav-item",
                  active && "active",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
              >
                <Icon className={cn("w-5 h-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="medical-card p-3 bg-primary/5 border-primary/20">
              <p className="text-xs text-sidebar-foreground/70 mb-1">
                System Status
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-sidebar-foreground">Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
