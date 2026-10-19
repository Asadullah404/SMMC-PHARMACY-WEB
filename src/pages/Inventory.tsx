import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowUpDown,
  FileDown,
  Database,
  ChevronDown,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { Medicine } from "../types/medical";
import { formatPKR, formatNumber } from "../lib/utils";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const Inventory: React.FC = () => {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    bulkUpdateStock,
    exportDatabaseJSON,
    restoreDatabaseJSON,
    importExcelData,
    privacyMode,
  } = usePharmacy();

  // Search, filter & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"All" | "Low" | "Critical" | "Healthy">("All");
  const [sortField, setSortField] = useState<keyof Medicine>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Add/Edit Single Medicine Modal
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [medForm, setMedForm] = useState({
    name: "",
    category: "General",
    quantity: "0",
    cost_price: "0",
    retail_price: "0",
    manufacturer: "",
    expiry_date: "",
    batch_number: "",
  });

  // Bulk Add Stock Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [newPendingMeds, setNewPendingMeds] = useState<Omit<Medicine, "id">[]>([]);
  const [showStockSummary, setShowStockSummary] = useState(false);

  // New pending med form in stock modal
  const [showInlineNewMed, setShowInlineNewMed] = useState(false);
  const [inlineNewMed, setInlineNewMed] = useState({
    name: "",
    quantity: "10",
    cost_price: "0",
    retail_price: "0",
    category: "General",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Data & Backups dropdown menu state & click-outside
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) {
        setDataMenuOpen(false);
      }
    };
    if (dataMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dataMenuOpen]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ["All", ...Array.from(set)];
  }, [medicines]);

  // Filtered and Sorted medicines
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((m) => {
        const matchesQuery =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.batch_number && m.batch_number.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === "All" || m.category === selectedCategory;

        const matchesStock =
          stockFilter === "All"
            ? true
            : stockFilter === "Critical"
            ? m.quantity < 5
            : stockFilter === "Low"
            ? m.quantity < 10
            : m.quantity >= 10;

        return matchesQuery && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [medicines, searchQuery, selectedCategory, stockFilter, sortField, sortOrder]);

  // Financial Valuation
  const totalCostValue = medicines.reduce((sum, m) => sum + m.cost_price * m.quantity, 0);
  const totalRetailValue = medicines.reduce((sum, m) => sum + m.retail_price * m.quantity, 0);
  const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);

  // Single Add / Edit Handlers
  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedForm({
      name: "",
      category: "General",
      quantity: "",
      cost_price: "",
      retail_price: "",
      manufacturer: "",
      expiry_date: "",
      batch_number: "",
    });
    setMedModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMed(med);
    setMedForm({
      name: med.name,
      category: med.category || "General",
      quantity: String(med.quantity),
      cost_price: String(med.cost_price),
      retail_price: String(med.retail_price),
      manufacturer: med.manufacturer || "",
      expiry_date: med.expiry_date || "",
      batch_number: med.batch_number || "",
    });
    setMedModalOpen(true);
  };

  const handleSaveMed = async () => {
    if (!medForm.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    const payload = {
      name: medForm.name.trim(),
      category: medForm.category.trim() || "General",
      quantity: Number(medForm.quantity) || 0,
      cost_price: Number(medForm.cost_price) || 0,
      retail_price: Number(medForm.retail_price) || 0,
      manufacturer: medForm.manufacturer.trim() || "Generic",
      expiry_date: medForm.expiry_date || "",
      batch_number: medForm.batch_number || "",
    };

    if (editingMed) {
      await updateMedicine(editingMed.id, payload);
    } else {
      await addMedicine(payload);
    }
    setMedModalOpen(false);
  };

  const handleDeleteMed = async (med: Medicine) => {
    if (window.confirm(`Are you sure you want to permanently delete "${med.name}"?`)) {
      await deleteMedicine(med.id);
    }
  };

  // Excel Import Handler
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        const count = await importExcelData(data);
        toast.success(`Imported ${count} medicines from Excel successfully!`);
      } catch (err) {
        console.error("Excel import error", err);
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    try {
      const data = medicines.map((m) => ({
        "Medicine Name": m.name,
        Category: m.category || "General",
        Quantity: m.quantity,
        "Cost Price (PKR)": m.cost_price,
        "Retail Price (PKR)": m.retail_price,
        "Unit Margin (PKR)": m.retail_price - m.cost_price,
        Manufacturer: m.manufacturer || "",
        "Expiry Date": m.expiry_date || "",
        "Batch Number": m.batch_number || "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, `SMMC-Inventory-${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Inventory exported to Excel!");
    } catch (e) {
      toast.error("Failed to export Excel");
    }
  };

  // Bulk Stock Update Handlers
  const handleApplyBulkStock = async () => {
    await bulkUpdateStock(stockChanges, newPendingMeds);
    setStockChanges({});
    setNewPendingMeds([]);
    setShowStockSummary(false);
    setStockModalOpen(false);
  };

  const handleAddInlinePending = () => {
    if (!inlineNewMed.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    setNewPendingMeds((prev) => [
      ...prev,
      {
        name: inlineNewMed.name.trim(),
        quantity: Number(inlineNewMed.quantity) || 0,
        cost_price: Number(inlineNewMed.cost_price) || 0,
        retail_price: Number(inlineNewMed.retail_price) || 0,
        category: inlineNewMed.category || "General",
      },
    ]);
    setInlineNewMed({
      name: "",
      quantity: "10",
      cost_price: "0",
      retail_price: "0",
      category: "General",
    });
    setShowInlineNewMed(false);
    toast.success("New medicine queued for stock addition");
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Inventory Management
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-0.5">
            Monitor pharmaceutical stock levels, cost bases, batch lifecycle, and wholesale replenishment
          </p>
        </div>

        {/* Action Controls (Non-wrapping clean toolbar) */}
        <div className="flex items-center gap-3 flex-shrink-0 self-start lg:self-auto">
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <input
            type="file"
            ref={restoreInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) restoreDatabaseJSON(file);
              e.target.value = "";
            }}
            accept=".json"
            className="hidden"
          />

          {/* Data & Backups Dropdown */}
          <div className="relative" ref={dataMenuRef}>
            <button
              type="button"
              onClick={() => setDataMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold transition-all hover:border-primary/40 active:scale-[0.98] whitespace-nowrap"
              title="Import, Export, and Database Backups"
            >
              <Database className="w-4 h-4 text-primary" />
              <span>Data &amp; Backups</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                  dataMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dataMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 p-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Spreadsheet Operations
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDataMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-muted/60 transition-colors text-xs text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Import Excel</div>
                    <div className="text-[10px] text-muted-foreground">Upload .xlsx or .xls file</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDataMenuOpen(false);
                    handleExportExcel();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-muted/60 transition-colors text-xs text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Export Excel</div>
                    <div className="text-[10px] text-muted-foreground">Download catalog spreadsheet</div>
                  </div>
                </button>

                <div className="my-1 border-t border-border/60" />

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Database Snapshots
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDataMenuOpen(false);
                    exportDatabaseJSON();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-muted/60 transition-colors text-xs text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Backup JSON</div>
                    <div className="text-[10px] text-muted-foreground">Export system database backup</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDataMenuOpen(false);
                    restoreInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-muted/60 transition-colors text-xs text-foreground group"
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Restore JSON</div>
                    <div className="text-[10px] text-muted-foreground">Restore catalog from JSON file</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Stock Dialog */}
          <button
            type="button"
            onClick={() => setStockModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Layers className="w-4 h-4" />
            <span>Add / Refill Stock</span>
          </button>

          {/* Add New Medicine */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Medicine</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-foreground mt-3 num-mono">
            {formatNumber(medicines.length)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Distinct pharmaceutical SKUs in system</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Cost Valuation
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-foreground mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(totalCostValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Capital invested in current warehouse stock</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Retail Valuation
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-primary mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(totalRetailValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Estimated gross return upon full sale</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profit Potential
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(potentialProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Gross markup profit on existing stock</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by medicine name, generic formula, category, or batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>

        {/* Category & Stock Picker & Count */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground hidden xl:inline-block">
            Showing <span className="text-foreground font-bold">{filteredMedicines.length}</span> of {medicines.length} items
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          >
            <option value="All">All Stock Levels</option>
            <option value="Healthy">Healthy (≥ 10 units)</option>
            <option value="Low">Low (&lt; 10 units)</option>
            <option value="Critical">Critical (&lt; 5 units)</option>
          </select>
        </div>
      </div>

      {/* Responsive Medicines Table */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <th
                  onClick={() => {
                    setSortField("name");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="py-4 px-4 sm:px-6 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Medicine Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField("quantity");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className="py-4 px-4 sm:px-6 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stock Status</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-4 px-4 sm:px-6 text-right">Cost Price</th>
                <th className="py-4 px-4 sm:px-6 text-right">Retail Price</th>
                <th className="py-4 px-4 sm:px-6 text-right">Unit Margin</th>
                <th className="py-4 px-4 sm:px-6 text-center">Batch / Exp</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isCritical = med.quantity < 5;
                  const isLow = med.quantity < 10;
                  const unitMargin = med.retail_price - med.cost_price;

                  return (
                    <tr
                      key={med.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                            {med.name}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {med.category || "General"} {med.manufacturer ? `• ${med.manufacturer}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold num-mono ${
                              isCritical
                                ? "bg-destructive/15 text-destructive border border-destructive/20"
                                : isLow
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {med.quantity} in stock
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-4 sm:px-6 text-right num-mono font-medium text-foreground">
                        {privacyMode ? "••••" : formatPKR(med.cost_price)}
                      </td>

                      {/* Retail */}
                      <td className="py-4 px-4 sm:px-6 text-right num-mono font-bold text-foreground">
                        {formatPKR(med.retail_price)}
                      </td>

                      {/* Unit Margin */}
                      <td className="py-4 px-4 sm:px-6 text-right num-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {privacyMode ? "••••" : `+${formatPKR(unitMargin)}`}
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-4 px-4 sm:px-6 text-center text-xs text-muted-foreground font-mono">
                        {med.expiry_date || med.batch_number ? (
                          <div className="space-y-0.5">
                            {med.batch_number && <div className="font-medium text-foreground">{med.batch_number}</div>}
                            {med.expiry_date && <div className="text-[11px] text-muted-foreground">{med.expiry_date}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMed(med)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Single Medicine Modal */}
      {medModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                {editingMed ? "Edit Medicine" : "Add New Medicine"}
              </h3>
              <button
                onClick={() => setMedModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Medicine Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Panadol 500mg Tablets"
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Analgesic, Antibiotic"
                  value={medForm.category}
                  onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Current Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={medForm.quantity}
                  onChange={(e) => setMedForm({ ...medForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Cost Price (PKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={medForm.cost_price}
                  onChange={(e) => setMedForm({ ...medForm, cost_price: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Retail Price (PKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={medForm.retail_price}
                  onChange={(e) => setMedForm({ ...medForm, retail_price: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. B-9982"
                  value={medForm.batch_number}
                  onChange={(e) => setMedForm({ ...medForm, batch_number: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
                <input
                  type="date"
                  value={medForm.expiry_date}
                  onChange={(e) => setMedForm({ ...medForm, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
              <button
                onClick={() => setMedModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMed}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20"
              >
                {editingMed ? "Update Medicine" : "Save Medicine"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Stock Modal */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-card rounded-3xl border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {showStockSummary ? "Review Stock Updates" : "Add / Refill Inventory Stock"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {showStockSummary
                    ? "Verify all quantity additions before applying changes to database"
                    : "Enter incoming quantities for existing items or queue new products"}
                </p>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showStockSummary ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Search in stock modal */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search existing medicines to refill..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Table of existing medicines */}
                <div className="border border-border rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/70 sticky top-0 border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3 text-center">Current Stock</th>
                        <th className="py-2.5 px-3 text-right">Add Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {medicines
                        .filter((m) => m.name.toLowerCase().includes(stockSearch.toLowerCase()))
                        .map((m) => (
                          <tr key={m.id} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-medium text-foreground">{m.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-semibold">
                              {m.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                placeholder="+0"
                                value={stockChanges[m.id] || ""}
                                onChange={(e) =>
                                  setStockChanges({
                                    ...stockChanges,
                                    [m.id]: Number(e.target.value) || 0,
                                  })
                                }
                                className="w-24 px-2 py-1 text-right rounded-lg bg-background border border-border font-mono text-xs focus:ring-1 focus:ring-primary"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* New Medicines Queued */}
                {newPendingMeds.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-foreground">
                      New Products to be Added ({newPendingMeds.length})
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {newPendingMeds.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border text-xs"
                        >
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="num-mono">Qty: {item.quantity}</span>
                            <span className="num-mono">Cost: {formatPKR(item.cost_price)}</span>
                            <span className="num-mono">Retail: {formatPKR(item.retail_price)}</span>
                            <button
                              onClick={() =>
                                setNewPendingMeds((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline New Product Form Toggle */}
                {showInlineNewMed ? (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                    <p className="text-xs font-bold text-foreground">Add New Product to Inventory</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={inlineNewMed.name}
                        onChange={(e) => setInlineNewMed({ ...inlineNewMed, name: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 rounded-lg bg-background border border-border"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={inlineNewMed.quantity}
                        onChange={(e) =>
                          setInlineNewMed({ ...inlineNewMed, quantity: e.target.value })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Cost (PKR)"
                        value={inlineNewMed.cost_price}
                        onChange={(e) =>
                          setInlineNewMed({ ...inlineNewMed, cost_price: e.target.value })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Retail (PKR)"
                        value={inlineNewMed.retail_price}
                        onChange={(e) =>
                          setInlineNewMed({ ...inlineNewMed, retail_price: e.target.value })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-background border border-border font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowInlineNewMed(false)}
                        className="px-3 py-1 text-xs text-muted-foreground hover:bg-muted rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddInlinePending}
                        className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg"
                      >
                        Queue Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowInlineNewMed(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Include a brand-new medicine in this refill</span>
                  </button>
                )}
              </div>
            ) : (
              /* Review Summary View */
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground">
                  Review the queued updates below. Clicking "Confirm & Commit" will update stock counts in real time.
                </div>

                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/70">
                      <tr>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3 text-center">Previous Stock</th>
                        <th className="py-2.5 px-3 text-center">Added</th>
                        <th className="py-2.5 px-3 text-center font-bold">New Final Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {Object.entries(stockChanges)
                        .filter(([_, qty]) => qty > 0)
                        .map(([id, addQty]) => {
                          const med = medicines.find((m) => m.id === id);
                          if (!med) return null;
                          return (
                            <tr key={id}>
                              <td className="py-2.5 px-3 font-medium">{med.name}</td>
                              <td className="py-2.5 px-3 text-center num-mono">{med.quantity}</td>
                              <td className="py-2.5 px-3 text-center num-mono text-emerald-600 font-bold">
                                +{addQty}
                              </td>
                              <td className="py-2.5 px-3 text-center num-mono font-bold text-primary">
                                {med.quantity + addQty}
                              </td>
                            </tr>
                          );
                        })}
                      {newPendingMeds.map((item, idx) => (
                        <tr key={idx} className="bg-emerald-500/5">
                          <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-300">
                            {item.name} (New Product)
                          </td>
                          <td className="py-2.5 px-3 text-center num-mono">0</td>
                          <td className="py-2.5 px-3 text-center num-mono text-emerald-600 font-bold">
                            +{item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-center num-mono font-bold text-emerald-600">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              {!showStockSummary ? (
                <>
                  <button
                    onClick={() => setStockModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const hasStockChanges = Object.values(stockChanges).some((v) => v > 0);
                      const hasNewMeds = newPendingMeds.length > 0;
                      if (!hasStockChanges && !hasNewMeds) {
                        toast.error("No quantities or new medicines entered");
                        return;
                      }
                      setShowStockSummary(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20"
                  >
                    Review Changes &gt;
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowStockSummary(false)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    &lt; Back to Edit
                  </button>
                  <button
                    onClick={handleApplyBulkStock}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Confirm &amp; Commit to Database
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
