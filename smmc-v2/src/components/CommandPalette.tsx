import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  ShoppingCart,
  FileBarChart2,
  TrendingUp,
  LayoutDashboard,
  Plus,
  PhoneCall,
  Download,
  X,
  ArrowRight,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR } from "../lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddMed?: () => void;
  onOpenReorder?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenAddMed,
  onOpenReorder,
}) => {
  const [query, setQuery] = useState("");
  const { medicines, exportDatabaseJSON } = usePharmacy();
  const navigate = useNavigate();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open handled by parent
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMedicines = medicines
    .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const navigationActions = [
    { title: "Dashboard Overview", path: "/", icon: LayoutDashboard },
    { title: "Inventory Catalog", path: "/inventory", icon: Package },
    { title: "Point of Sale (POS)", path: "/sales", icon: ShoppingCart },
    { title: "Financial Reports", path: "/reports", icon: FileBarChart2 },
    { title: "Demand Analysis", path: "/demand", icon: TrendingUp },
  ].filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelectNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-muted/20">
          <Search className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a medicine name, page, or action (e.g. Panadol, sales, add)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {query.length === 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAddMed) onOpenAddMed();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted text-left text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Add New Medicine</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReorder) onOpenReorder();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted text-left text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span>Wholesale Reorder</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    exportDatabaseJSON();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted text-left text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span>Backup Database JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* Medicines Result */}
          {filteredMedicines.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Medicines in Inventory
              </p>
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  onClick={() => {
                    navigate("/inventory");
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        med.quantity < 5
                          ? "bg-destructive"
                          : med.quantity < 10
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="truncate">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {med.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Retail: {formatPKR(med.retail_price)} • Cost: {formatPKR(med.cost_price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        med.quantity < 10
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {med.quantity} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Pages */}
          {navigationActions.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Jump to Page
              </p>
              {navigationActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelectNav(item.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted text-left text-sm font-medium transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{item.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {filteredMedicines.length === 0 && navigationActions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No matching medicines or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
