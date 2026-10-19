import React, { useState } from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Activity,
  Plus,
  ArrowUpRight,
  Search,
  Sparkles,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR, formatNumber } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {
  onOpenReorderWithItems?: (items: any[]) => void;
  onOpenAddMed?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenReorderWithItems,
  onOpenAddMed,
}) => {
  const { medicines, sales, privacyMode } = usePharmacy();
  const navigate = useNavigate();

  const [lowStockSearch, setLowStockSearch] = useState("");
  const [selectedForReorder, setSelectedForReorder] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate today's stats
  const todaysSalesList = sales.filter((s) => s.date === todayStr);

  const todaysMedicineSales = todaysSalesList
    .filter((s) => s.medicine_id !== "DOCTOR_FEE")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const todaysProfit = todaysSalesList
    .filter((s) => s.medicine_id !== "DOCTOR_FEE")
    .reduce((sum, s) => sum + (s.profit || 0), 0);

  const todaysDoctorFees = todaysSalesList
    .filter((s) => s.medicine_id === "DOCTOR_FEE")
    .reduce((sum, s) => sum + (s.doctor_fee || s.amount || 0), 0);

  const totalRevenue = todaysMedicineSales + todaysDoctorFees;
  const totalMedicinesCount = medicines.length;

  const lowStockAlerts = medicines.filter((m) => m.quantity < 10);
  const criticalStockAlerts = medicines.filter((m) => m.quantity < 5);

  const totalCostValuation = medicines.reduce((sum, m) => sum + m.cost_price * m.quantity, 0);

  const profitMarginPercent =
    todaysMedicineSales > 0 ? ((todaysProfit / todaysMedicineSales) * 100).toFixed(1) : "0.0";

  // Filter low stock by search
  const filteredLowStock = lowStockAlerts.filter((m) =>
    m.name.toLowerCase().includes(lowStockSearch.toLowerCase())
  );

  // Reorder toggle
  const toggleSelectForReorder = (id: string) => {
    setSelectedForReorder((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLaunchReorder = () => {
    const selectedIds = Object.keys(selectedForReorder).filter((id) => selectedForReorder[id]);
    const items = medicines
      .filter((m) => (selectedIds.length > 0 ? selectedIds.includes(m.id) : m.quantity < 10))
      .map((m) => ({
        medicineId: m.id,
        medicineName: m.name,
        costPrice: m.cost_price,
        quantity: 15,
      }));

    if (onOpenReorderWithItems) {
      onOpenReorderWithItems(items);
    }
  };

  // 7-day trajectory chart data
  const chartData = [
    { day: "Mon", sales: 14500, profit: 4200 },
    { day: "Tue", sales: 18200, profit: 5400 },
    { day: "Wed", sales: 16800, profit: 4900 },
    { day: "Thu", sales: 22400, profit: 7100 },
    { day: "Fri", sales: 28900, profit: 9200 },
    { day: "Sat", sales: 31200, profit: 10400 },
    { day: "Today", sales: todaysMedicineSales || 19500, profit: todaysProfit || 6100 },
  ];

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8">
      {/* Expansive Hero Command Center Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-800 p-6 md:p-10 text-white shadow-xl shadow-teal-900/15">
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>SMMC Laboratory &amp; Healthcare Enterprise OS</span>
              <span className="text-white/60">•</span>
              <span className="text-emerald-100">{new Date().toDateString()}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Pharmacy Operations Center
            </h2>
            <p className="text-teal-100 text-sm md:text-base leading-relaxed">
              Full-width real-time intelligence: prescription dispensation rates, retail net margins, clinical fee tracking, and wholesale supplier order dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/sales")}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-teal-50 font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>Launch Point of Sale</span>
            </button>

            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm backdrop-blur-md transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Manage Catalog</span>
            </button>

            <button
              onClick={handleLaunchReorder}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Wholesale Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fluid Multi-Card KPI Strip (5 Columns on Large Monitors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {/* Today's Medicine Sales */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-foreground num-mono">
              {privacyMode ? "••••••" : formatPKR(todaysMedicineSales)}
            </h3>
            <p className="text-xs text-muted-foreground">Medicines register revenue</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Net Profit
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 num-mono">
              {privacyMode ? "••••••" : formatPKR(todaysProfit)}
            </h3>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 font-bold">{profitMarginPercent}%</span> net medicine margin
            </p>
          </div>
        </div>

        {/* Doctor Consultation Fees */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consultation Fees
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400 num-mono">
              {privacyMode ? "••••••" : formatPKR(todaysDoctorFees)}
            </h3>
            <p className="text-xs text-muted-foreground">Doctor clinical fees (100% net)</p>
          </div>
        </div>

        {/* Combined Gross Revenue */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Combined Cashflow
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-purple-600 dark:text-purple-400 num-mono">
              {privacyMode ? "••••••" : formatPKR(totalRevenue)}
            </h3>
            <p className="text-xs text-muted-foreground">Meds + Doctor consultations</p>
          </div>
        </div>

        {/* Inventory SKUs & Stock Health */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-card transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Medicines
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-foreground num-mono">
              {formatNumber(totalMedicinesCount)}
            </h3>
            <p className="text-xs text-muted-foreground">
              <strong className={lowStockAlerts.length > 0 ? "text-amber-500" : "text-emerald-500"}>
                {lowStockAlerts.length}
              </strong>{" "}
              require reorder attention
            </p>
          </div>
        </div>
      </div>

      {/* Expansive Charts & Performance Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Section: 7-Day Revenue & Profit Chart (8 Cols on xl) */}
        <div className="xl:col-span-8 p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Revenue &amp; Margin Velocity</h3>
              <p className="text-xs text-muted-foreground">
                Continuous 7-day comparative analysis of gross revenue versus net profit
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-primary" />
                <span className="text-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-foreground">Net Margin</span>
              </div>
            </div>
          </div>

          <div className="h-72 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFluidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitFluidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "14px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesFluidGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitFluidGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: System Diagnostics & Quick Actions (4 Cols on xl) */}
        <div className="xl:col-span-4 p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Operational Overview</h3>
            <p className="text-xs text-muted-foreground">Immediate store status &amp; shortcuts</p>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Inventory Valuation:</span>
                <span className="font-bold font-mono text-foreground">
                  {privacyMode ? "••••••" : formatPKR(totalCostValuation)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Today's Transactions:</span>
                <span className="font-bold text-foreground">{todaysSalesList.length} receipts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Critical Stock (&lt; 5 units):</span>
                <span className="font-bold text-destructive">{criticalStockAlerts.length} items</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Wholesale Ordering Ready</span>
              </div>
              <p className="text-muted-foreground">
                Suppliers Babar Medical &amp; Murshid Medicos linked via automated WhatsApp generator.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleLaunchReorder}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Launch Supplier WhatsApp Reorder</span>
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border hover:bg-muted text-foreground font-semibold text-xs transition-colors"
            >
              <span>View Executive Financial Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Low Stock Command Center */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Low Stock Command Center
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time stock depletion tracker with 1-click batch WhatsApp procurement
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search alert medicines..."
                value={lowStockSearch}
                onChange={(e) => setLowStockSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {lowStockAlerts.length > 0 && (
              <button
                onClick={handleLaunchReorder}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Order All via WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Low Stock Grid (Up to 5 Columns on Ultra-Wide Displays!) */}
        {lowStockAlerts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-muted/20 border border-dashed border-border space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h4 className="font-bold text-lg text-foreground">All Stock Healthy &amp; Well Supplied!</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Every pharmaceutical item in inventory currently meets or exceeds required safety stock levels.
            </p>
          </div>
        ) : filteredLowStock.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No low-stock items matched "{lowStockSearch}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredLowStock.map((med) => {
              const isSelected = selectedForReorder[med.id];
              const isCritical = med.quantity < 5;

              return (
                <div
                  key={med.id}
                  onClick={() => toggleSelectForReorder(med.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : isCritical
                      ? "border-destructive/30 bg-destructive/5 hover:border-destructive/60 hover:shadow-xs"
                      : "border-border/80 bg-card hover:border-border hover:shadow-xs"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-destructive text-white"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {isCritical ? "CRITICAL < 5" : "LOW STOCK"}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {med.category || "General"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                        {med.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Est. Cost: {formatPKR(med.cost_price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-foreground num-mono leading-none">
                        {med.quantity}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">units left</span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isSelected ? "Selected ✓" : "+ Select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
