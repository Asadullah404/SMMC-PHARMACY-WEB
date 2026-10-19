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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Demand", url: "/demand", icon: TrendingUp },
];

export function MedicalSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();

  const isActive = (path: string) => currentPath === path;

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-smooth hidden md:flex flex-col h-screen sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="MedStore Logo"
              className="w-10 h-10 rounded-xl object-contain"
            />
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
          className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto"
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
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={logout}
        >
          <LogOut className={cn("w-5 h-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </Button>

        {!isCollapsed && (
          <div className="medical-card p-3 bg-primary/5 border-primary/20">
            <p className="text-xs text-sidebar-foreground/70 mb-1">
              System Status
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-sidebar-foreground">Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

