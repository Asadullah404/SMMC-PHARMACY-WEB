import { NavLink, useLocation } from "react-router-dom";
import {
    BarChart3,
    Package,
    ShoppingCart,
    FileText,
    TrendingUp,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
    { title: "Dashboard", url: "/", icon: BarChart3 },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "Sales", url: "/sales", icon: ShoppingCart },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Demand", url: "/demand", icon: TrendingUp },
];

export function MobileNav() {
    const location = useLocation();
    const currentPath = location.pathname;
    const { logout } = useAuth();

    const isActive = (path: string) => currentPath === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden pb-safe">
            <nav className="flex items-center justify-around h-16 px-2">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);

                    return (
                        <NavLink
                            key={item.title}
                            to={item.url}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors",
                                active
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px]">{item.title}</span>
                        </NavLink>
                    );
                })}
                <button
                    onClick={logout}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px]">Logout</span>
                </button>
            </nav>
        </div>
    );
}
