import React from "react";
import {
  Search,
  Eye,
  EyeOff,
  Sun,
  Moon,
  RefreshCw,
  PhoneCall,
  PlayCircle,
  Bell,
  Command,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenCommand: () => void;
  onOpenReorder: () => void;
  onOpenVideo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenCommand,
  onOpenReorder,
  onOpenVideo,
}) => {
  const { privacyMode, togglePrivacyMode, medicines, loading, refreshData } = usePharmacy();
  const { isDark, setTheme } = useTheme();

  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;

  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-3.5 flex items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center Search Input Trigger */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-card border border-border/80 text-muted-foreground text-xs shadow-xs hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span>Search medicines, sales, actions...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground bg-muted border border-border rounded-md">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommand}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card border border-border/60 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Video Tour Button */}
        {onOpenVideo && (
          <button
            onClick={onOpenVideo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-colors"
            title="Watch System Introduction"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Intro Tour</span>
          </button>
        )}

        {/* Wholesale Reorder Shortcut */}
        <button
          onClick={onOpenReorder}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all shadow-xs"
          title="Wholesale Reorder WhatsApp Dispatch"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Supplier Reorder</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-destructive text-white text-[10px] font-bold">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* Privacy Toggle Button */}
        <button
          onClick={togglePrivacyMode}
          className={`p-2 rounded-xl border transition-colors ${
            privacyMode
              ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
              : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title={privacyMode ? "Values are Hidden (Click to Reveal)" : "Privacy Mode (Hide Values)"}
        >
          {privacyMode ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>

        {/* Refresh Data Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2 rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Refresh Data from Database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>
    </header>
  );
};
