import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Clock,
  Sparkles,
  Stethoscope,
  Pill,
  ShoppingBag,
  DollarSign,
  BarChart3,
  CalendarDays,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Flame,
  ShieldCheck,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Info,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR, formatNumber, formatLocalDate, cn } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  KARACHI_TIMEZONE,
  WEEKDAYS,
  parseSaleDate,
  getKarachiHour,
  getKarachiWeekday,
  getKarachiDateString,
  getKarachiTimeString,
  calculatePriorPeriod,
  computeExecutiveKPIs,
  computeWeekdayAnalysis,
  computeHeatmapMatrix,
  computeHourlyVelocity,
  computeProductAnalytics,
  computeDoctorAnalytics,
  computeIntradayForecast,
  generateBusinessInsights,
  ExecutiveKPISummary,
  WeekdayStat,
  HeatmapCell,
  HourlyStat,
  DaypartBreakdown,
  ProductPerformance,
  DoctorPerformance,
  IntradayForecast,
  BusinessInsight,
} from "../lib/analyticsEngine";
import { SaleRecord } from "../types/medical";

type TabKey =
  | "overview"
  | "weekday"
  | "hourly"
  | "products"
  | "doctors"
  | "forecasting"
  | "insights";

type TrendGranularity = "daily" | "weekly" | "monthly";

export const BusinessIntelligence: React.FC = () => {
  const { medicines, privacyMode, fetchSalesByDateRange } = usePharmacy();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Global Date Range
  const todayStr = useMemo(() => getKarachiDateString(new Date()), []);
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29); // Last 30 days default
    return getKarachiDateString(d);
  }, []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(todayStr);

  // Trend Granularity
  const [trendGranularity, setTrendGranularity] = useState<TrendGranularity>("daily");

  // Selected Category filter for Products tab
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Loading States
  const [loading, setLoading] = useState(true);

  // Raw Sales Data Caches
  const [currentSales, setCurrentSales] = useState<SaleRecord[]>([]);
  const [priorSales, setPriorSales] = useState<SaleRecord[]>([]);
  const [fourWeekHistorySales, setFourWeekHistorySales] = useState<SaleRecord[]>([]);

  // Medicine Map for quick O(1) lookup
  const medicinesMap = useMemo(() => {
    const map = new Map();
    medicines.forEach((m) => map.set(m.id, m));
    return map;
  }, [medicines]);

  // Load Data for Selected Range, Prior Range, and 4-Week History
  const loadAnalyticsData = useCallback(async () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setLoading(true);

    try {
      // 1. Current period sales
      const current = await fetchSalesByDateRange(startDate, endDate);
      setCurrentSales(current);

      // 2. Prior equivalent period
      const { priorStart, priorEnd } = calculatePriorPeriod(startDate, endDate);
      const prior = await fetchSalesByDateRange(priorStart, priorEnd);
      setPriorSales(prior);

      // 3. Four-week history for intraday forecasting and same-weekday comparisons
      const historyStart = new Date();
      historyStart.setDate(historyStart.getDate() - 35); // 5 weeks back
      const historyStartStr = getKarachiDateString(historyStart);
      const historyData = await fetchSalesByDateRange(historyStartStr, todayStr);
      setFourWeekHistorySales(historyData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      toast.error("Failed to load analytics datasets");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, todayStr, fetchSalesByDateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Quick Preset Handlers
  const applyPreset = (preset: "today" | "yesterday" | "7days" | "30days" | "month" | "lastMonth" | "year") => {
    const now = new Date();
    const today = getKarachiDateString(now);

    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = getKarachiDateString(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "7days") {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      setStartDate(getKarachiDateString(d7));
      setEndDate(today);
    } else if (preset === "30days") {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 29);
      setStartDate(getKarachiDateString(d30));
      setEndDate(today);
    } else if (preset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getKarachiDateString(firstDay));
      setEndDate(today);
    } else if (preset === "lastMonth") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(getKarachiDateString(firstDayLastMonth));
      setEndDate(getKarachiDateString(lastDayLastMonth));
    } else if (preset === "year") {
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(getKarachiDateString(firstDayYear));
      setEndDate(today);
    }
  };

  // -------------------------------------------------------------
  // Computed Analytics Models
  // -------------------------------------------------------------

  const { daysDiff } = useMemo(
    () => calculatePriorPeriod(startDate, endDate),
    [startDate, endDate]
  );

  const kpis: ExecutiveKPISummary = useMemo(() => {
    return computeExecutiveKPIs(currentSales, priorSales, daysDiff, medicinesMap);
  }, [currentSales, priorSales, daysDiff, medicinesMap]);

  const weekdayAnalysis = useMemo(() => {
    return computeWeekdayAnalysis(currentSales);
  }, [currentSales]);

  const heatmapData = useMemo(() => {
    return computeHeatmapMatrix(currentSales);
  }, [currentSales]);

  const hourlyAnalysis = useMemo(() => {
    return computeHourlyVelocity(currentSales);
  }, [currentSales]);

  const productsAnalysis = useMemo(() => {
    return computeProductAnalytics(currentSales, medicinesMap);
  }, [currentSales, medicinesMap]);

  const doctorAnalysis = useMemo(() => {
    return computeDoctorAnalytics(currentSales, kpis.totalRevenue);
  }, [currentSales, kpis.totalRevenue]);

  // Today's Sales subset for Forecasting
  const todaySales = useMemo(() => {
    return currentSales.filter((s) => s.date === todayStr);
  }, [currentSales, todayStr]);

  const forecast: IntradayForecast = useMemo(() => {
    return computeIntradayForecast(todaySales, fourWeekHistorySales, todayStr);
  }, [todaySales, fourWeekHistorySales, todayStr]);

  const businessInsights: BusinessInsight[] = useMemo(() => {
    return generateBusinessInsights(
      kpis,
      weekdayAnalysis,
      hourlyAnalysis,
      productsAnalysis,
      doctorAnalysis,
      forecast
    );
  }, [kpis, weekdayAnalysis, hourlyAnalysis, productsAnalysis, doctorAnalysis, forecast]);

  // -------------------------------------------------------------
  // Revenue Trend Time Series Chart Data
  // -------------------------------------------------------------
  const trendChartData = useMemo(() => {
    if (trendGranularity === "daily") {
      const map: Record<string, { date: string; fullDate: string; revenue: number; profit: number; cumulative: number }> = {};
      currentSales.forEach((s) => {
        if (!s.date) return;
        if (!map[s.date]) {
          map[s.date] = { date: s.date.slice(5), fullDate: s.date, revenue: 0, profit: 0, cumulative: 0 };
        }
        map[s.date].revenue += s.amount || 0;
        if (s.medicine_id !== "DOCTOR_FEE") {
          map[s.date].profit += s.profit || 0;
        }
      });

      const sorted = Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
      let running = 0;
      sorted.forEach((item) => {
        running += item.revenue;
        item.cumulative = running;
      });
      return sorted;
    }

    if (trendGranularity === "weekly") {
      const map: Record<string, { date: string; fullDate: string; revenue: number; profit: number }> = {};
      currentSales.forEach((s) => {
        const d = parseSaleDate(s);
        // ISO Week or roughly group by 7 days
        const weekNum = Math.ceil(d.getDate() / 7);
        const monthStr = s.date.slice(0, 7);
        const key = `${monthStr} W${weekNum}`;
        if (!map[key]) {
          map[key] = { date: key, fullDate: s.date, revenue: 0, profit: 0 };
        }
        map[key].revenue += s.amount || 0;
        if (s.medicine_id !== "DOCTOR_FEE") {
          map[key].profit += s.profit || 0;
        }
      });
      return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    }

    // Monthly
    const map: Record<string, { date: string; fullDate: string; revenue: number; profit: number }> = {};
    currentSales.forEach((s) => {
      const mKey = s.date.slice(0, 7);
      if (!map[mKey]) {
        map[mKey] = { date: mKey, fullDate: s.date, revenue: 0, profit: 0 };
      }
      map[mKey].revenue += s.amount || 0;
      if (s.medicine_id !== "DOCTOR_FEE") {
        map[mKey].profit += s.profit || 0;
      }
    });
    return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [currentSales, trendGranularity]);

  // Color palette for charts
  const PIE_COLORS = ["#0d9488", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"];

  // -------------------------------------------------------------
  // Exports
  // -------------------------------------------------------------

  const exportExcelReport = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Executive KPI Summary
      const kpiRows = [
        { Metric: "Analysis Period", Value: `${startDate} to ${endDate}` },
        { Metric: "Total Gross Revenue (PKR)", Value: kpis.totalRevenue },
        { Metric: "Medicine Net Profit (PKR)", Value: kpis.grossProfit },
        { Metric: "Medicine Profit Margin (%)", Value: `${kpis.profitMarginPercent.toFixed(1)}%` },
        { Metric: "Total Transactions", Value: kpis.totalTransactions },
        { Metric: "Average Transaction Value (PKR)", Value: Math.round(kpis.averageTransactionValue) },
        { Metric: "Average Daily Revenue (PKR)", Value: Math.round(kpis.averageDailyRevenue) },
        { Metric: "Doctor Consultation Revenue (PKR)", Value: kpis.doctorConsultationRevenue },
        { Metric: "Medicine Units Sold", Value: kpis.totalMedicinesSold },
        { Metric: "Other Product Units Sold", Value: kpis.totalOtherProductsSold },
        { Metric: "Total Refunds (PKR)", Value: kpis.totalRefunds },
        { Metric: "Prior Period Revenue (PKR)", Value: kpis.priorRevenue },
        {
          Metric: "Revenue Growth vs Prior Period",
          Value: kpis.revenueGrowthPercent !== null ? `${kpis.revenueGrowthPercent.toFixed(1)}%` : "N/A",
        },
      ];
      const wsKPI = XLSX.utils.json_to_sheet(kpiRows);
      XLSX.utils.book_append_sheet(wb, wsKPI, "Executive Summary");

      // Sheet 2: Day of Week Performance
      const weekdayRows = weekdayAnalysis.weekdays.map((w) => ({
        Day: w.name,
        "Total Revenue (PKR)": w.totalRevenue,
        "Average Revenue / Day (PKR)": Math.round(w.averageRevenue),
        "Transaction Count": w.transactionCount,
        "Average Transaction Value (PKR)": Math.round(w.averageTransactionValue),
        "Revenue Share (%)": `${w.sharePercent.toFixed(1)}%`,
        "Days Observed": w.occurrences,
      }));
      const wsWeekday = XLSX.utils.json_to_sheet(weekdayRows);
      XLSX.utils.book_append_sheet(wb, wsWeekday, "Weekday Intelligence");

      // Sheet 3: Top Medicines
      const medRows = productsAnalysis.topMedicines.map((m, i) => ({
        Rank: i + 1,
        "Medicine Name": m.name,
        Category: m.category,
        "Units Sold": m.quantitySold,
        "Revenue (PKR)": m.revenue,
        "Net Profit (PKR)": m.profit,
        "Margin (%)": `${m.marginPercent.toFixed(1)}%`,
        "Revenue Share (%)": `${m.sharePercent.toFixed(1)}%`,
      }));
      const wsMeds = XLSX.utils.json_to_sheet(medRows);
      XLSX.utils.book_append_sheet(wb, wsMeds, "Top Medicines");

      // Sheet 4: Doctor Consultations
      const docRows = doctorAnalysis.doctorBreakdown.map((d, i) => ({
        Rank: i + 1,
        "Doctor / Specialty": d.doctorName,
        "Patient Consultations": d.consultationCount,
        "Total Revenue (PKR)": d.totalRevenue,
        "Average Fee (PKR)": Math.round(d.averageFee),
        "Share of Doctor Revenue (%)": `${d.revenueSharePercent.toFixed(1)}%`,
      }));
      const wsDocs = XLSX.utils.json_to_sheet(docRows);
      XLSX.utils.book_append_sheet(wb, wsDocs, "Doctor Consultations");

      XLSX.writeFile(wb, `SMMC-Sales-Intelligence-${startDate}-to-${endDate}.xlsx`);
      toast.success("Enterprise BI spreadsheet downloaded!");
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to export Excel spreadsheet");
    }
  };

  const exportPDFReport = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(13, 148, 136);
      doc.rect(0, 0, pageWidth, 26, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("SMMC PHARMACY - EXECUTIVE SALES INTELLIGENCE REPORT", pageWidth / 2, 11, {
        align: "center",
      });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Analysis Window: ${startDate} to ${endDate} (Timezone: Asia/Karachi) • Generated: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        18,
        { align: "center" }
      );

      // Section 1: Executive KPI Overview
      autoTable(doc, {
        startY: 30,
        head: [["Gross Revenue", "Medicine Net Profit", "Margin", "Transactions", "Avg Basket (ATV)", "Doctor Fees"]],
        body: [[
          formatPKR(kpis.totalRevenue),
          formatPKR(kpis.grossProfit),
          `${kpis.profitMarginPercent.toFixed(1)}%`,
          String(kpis.totalTransactions),
          formatPKR(kpis.averageTransactionValue),
          formatPKR(kpis.doctorConsultationRevenue),
        ]],
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontStyle: "bold", textColor: [13, 148, 136], fontSize: 8.5 },
      });

      let nextY = (doc as any).lastAutoTable?.finalY + 6;

      // Section 2: Weekday Analysis Table
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("1. Day-of-Week Revenue Distribution (Full 7-Day Cycle)", 14, nextY);

      const weekdayTableData = weekdayAnalysis.weekdays.map((w) => [
        w.name,
        formatPKR(w.totalRevenue),
        formatPKR(w.averageRevenue),
        String(w.transactionCount),
        formatPKR(w.averageTransactionValue),
        `${w.sharePercent.toFixed(1)}%`,
      ]);

      autoTable(doc, {
        startY: nextY + 3,
        head: [["Day", "Total Revenue", "Avg Rev/Day", "Tx Count", "Avg Ticket", "Rev Share"]],
        body: weekdayTableData,
        theme: "striped",
        headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5 },
      });

      nextY = (doc as any).lastAutoTable?.finalY + 6;

      // Section 3: Top Medicines
      doc.text("2. Top 10 Best-Selling Medicines by Revenue", 14, nextY);

      const topMedData = productsAnalysis.topMedicines.map((m, idx) => [
        String(idx + 1),
        m.name,
        m.category,
        String(m.quantitySold),
        formatPKR(m.revenue),
        formatPKR(m.profit),
      ]);

      autoTable(doc, {
        startY: nextY + 3,
        head: [["#", "Medicine Name", "Category", "Units", "Revenue", "Profit"]],
        body: topMedData,
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5 },
      });

      doc.save(`SMMC-BI-Executive-Report-${startDate}-to-${endDate}.pdf`);
      toast.success("Executive BI PDF generated!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8 select-none">
      {/* ========================================================= */}
      {/* Top Header Command Banner                                */}
      {/* ========================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Business Intelligence &amp; Sales Analytics
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Multi-granularity velocity, 24h heatmap, same-weekday comparisons, and predictive forecasting
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-[11px] font-semibold text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Timezone: {KARACHI_TIMEZONE} (PKT)</span>
          </div>

          <button
            onClick={loadAnalyticsData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-bold border border-border transition-colors hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportExcelReport}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-bold border border-border transition-colors hover:scale-[1.02] active:scale-[0.98]"
            title="Export Excel report"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={exportPDFReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Export executive PDF report"
          >
            <Download className="w-4 h-4" />
            <span>Executive PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Global Date & Time Range Filter Bar                      */}
      {/* ========================================================= */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              Time Horizon &amp; Granularity
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
              { id: "lastMonth", label: "Last Month" },
              { id: "year", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as any)}
                className="px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Inputs & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase">
              Trend Granularity
            </label>
            <div className="flex items-center gap-1 p-1 mt-1 rounded-xl bg-background border border-border">
              {(["daily", "weekly", "monthly"] as TrendGranularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setTrendGranularity(g)}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    trendGranularity === g
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase">
              Comparison Period
            </label>
            <div className="p-2.5 mt-1 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground flex items-center justify-between">
              <span className="font-medium truncate">Prior {daysDiff} days</span>
              <span className="text-[10px] font-mono font-bold text-primary">Auto Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Executive KPI Overview Strip (15 Metrics)                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-foreground num-mono">
              {privacyMode ? "••••••" : formatPKR(kpis.totalRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              {kpis.revenueGrowthPercent !== null && (
                <span
                  className={cn(
                    "inline-flex items-center font-bold px-1.5 py-0.5 rounded-md text-[10px]",
                    kpis.revenueGrowthPercent >= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {kpis.revenueGrowthPercent >= 0 ? "+" : ""}
                  {kpis.revenueGrowthPercent.toFixed(1)}%
                </span>
              )}
              <span className="text-muted-foreground text-[11px]">vs prior {daysDiff}d</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Gross Profit */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Medicine Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 num-mono">
              {privacyMode ? "••••••" : formatPKR(kpis.grossProfit)}
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{kpis.profitMarginPercent.toFixed(1)}%</span>
              <span className="text-[11px]">medicine net margin</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Doctor Consultation Revenue */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-teal-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Doctor Consultations
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-teal-600 dark:text-teal-400 num-mono">
              {privacyMode ? "••••••" : formatPKR(kpis.doctorConsultationRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span>{doctorAnalysis.consultationCount} visits</span>
              <span>•</span>
              <span className="font-semibold">{doctorAnalysis.revenueSharePercent.toFixed(1)}% share</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Transactions & Basket (ATV) */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-blue-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Avg Ticket (ATV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-foreground num-mono">
              {privacyMode ? "••••" : formatPKR(kpis.averageTransactionValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span>{kpis.totalTransactions} total sales</span>
              {kpis.atvGrowthPercent !== null && (
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    kpis.atvGrowthPercent >= 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  ({kpis.atvGrowthPercent >= 0 ? "+" : ""}
                  {kpis.atvGrowthPercent.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 5: Avg Daily Revenue */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-purple-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Avg Daily Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black tracking-tight text-foreground num-mono">
              {privacyMode ? "••••••" : formatPKR(kpis.averageDailyRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span>Over {kpis.totalPeriodDays} calendar days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Pharma Units Sold</span>
          <p className="text-lg font-black text-foreground mt-1 num-mono">{formatNumber(kpis.totalMedicinesSold)}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Retail &amp; Other Units</span>
          <p className="text-lg font-black text-foreground mt-1 num-mono">{formatNumber(kpis.totalOtherProductsSold)}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Peak Revenue Day</span>
          <p className="text-xs font-bold text-emerald-600 mt-1 truncate">
            {kpis.highestRevenueDay ? `${kpis.highestRevenueDay.date} (${formatPKR(kpis.highestRevenueDay.amount)})` : "N/A"}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Lowest Revenue Day</span>
          <p className="text-xs font-bold text-amber-600 mt-1 truncate">
            {kpis.lowestRevenueDay ? `${kpis.lowestRevenueDay.date} (${formatPKR(kpis.lowestRevenueDay.amount)})` : "N/A"}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Refunds / Reversals</span>
          <p className="text-lg font-black text-foreground mt-1 num-mono">{formatPKR(kpis.totalRefunds)}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Operating Expenses</span>
          <p className="text-xs font-semibold text-muted-foreground mt-1.5 italic">Not Tracked in ERP</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Segmented Navigation Tabs                                */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/40 border border-border overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Trends", icon: TrendingUp },
          { id: "weekday", label: "Day-of-Week & 24h Heatmap", icon: CalendarDays },
          { id: "hourly", label: "Hourly Sales Velocity", icon: Clock },
          { id: "products", label: "Products & Medicines", icon: Pill },
          { id: "doctors", label: "Doctor Consultations", icon: Stethoscope },
          { id: "forecasting", label: "Historical & Forecasting", icon: Target },
          { id: "insights", label: "Business Insights", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & REVENUE TRENDS                         */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Revenue &amp; Gross Margin Trajectory ({trendGranularity.toUpperCase()})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Timeline distribution of gross revenue and net profit over the selected period
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-primary inline-block" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 ml-3">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Profit
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "14px",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative Revenue Curve */}
          {trendGranularity === "daily" && trendChartData.length > 1 && (
            <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Cumulative Revenue Accumulation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregate pacing toward total period revenue
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), "Cumulative"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "14px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DAY-OF-WEEK & 24H HEATMAP MATRIX                  */}
      {/* ========================================================= */}
      {activeTab === "weekday" && (
        <div className="space-y-6">
          {/* Best / Lowest Weekday Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Best Performing Weekday
                </span>
                <h4 className="text-2xl font-black text-foreground mt-1">
                  {weekdayAnalysis.bestWeekday?.name || "N/A"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average {formatPKR(weekdayAnalysis.bestWeekday?.averageRevenue || 0)} across {weekdayAnalysis.bestWeekday?.occurrences} occurrence(s)
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                ★
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Lowest Performing Weekday
                </span>
                <h4 className="text-2xl font-black text-foreground mt-1">
                  {weekdayAnalysis.lowestWeekday?.name || "N/A"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average {formatPKR(weekdayAnalysis.lowestWeekday?.averageRevenue || 0)} across {weekdayAnalysis.lowestWeekday?.occurrences} occurrence(s)
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                ↓
              </div>
            </div>
          </div>

          {/* Weekday Bar Chart Comparison */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Complete 7-Day Weekday Revenue Performance
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Includes Sundays and all calendar weekdays derived from historical records
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayAnalysis.weekdays} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "14px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="averageRevenue"
                    name="Avg Daily Revenue"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Weekday Table */}
            <div className="border border-border rounded-2xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Day of Week</th>
                    <th className="py-3 px-4 text-right">Avg Revenue / Day</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                    <th className="py-3 px-4 text-center">Transactions</th>
                    <th className="py-3 px-4 text-right">Avg Ticket (ATV)</th>
                    <th className="py-3 px-4 text-right">Volume Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {weekdayAnalysis.weekdays.map((w) => (
                    <tr key={w.name} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                        <span>{w.name}</span>
                        {w.isBest && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-extrabold uppercase">
                            Peak
                          </span>
                        )}
                        {w.index === 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                            Sunday
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {privacyMode ? "••••" : formatPKR(w.averageRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {privacyMode ? "••••" : formatPKR(w.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{w.transactionCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        {privacyMode ? "••••" : formatPKR(w.averageTransactionValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-primary">
                        {w.sharePercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 24-Hour Weekday Heatmap Matrix */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-foreground">
                    24-Hour × Weekday Revenue Density Heatmap
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pinpoints exact days and hours generating maximum financial return
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span>Low Activity</span>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-sm bg-muted/30" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/30" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/60" />
                  <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500" />
                </div>
                <span>Peak Revenue</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[700px] space-y-1.5 pt-2">
                {/* Header Hours (00 to 23) */}
                <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-[10px] text-muted-foreground text-center font-mono font-semibold pb-1 border-b border-border/50">
                  <span className="text-left pl-1">Day</span>
                  {Array.from({ length: 24 }, (_, h) => (
                    <span key={h}>{String(h).padStart(2, "0")}</span>
                  ))}
                </div>

                {/* Rows for each weekday */}
                {heatmapData.matrix.map((row, rIdx) => {
                  const dayName = row[0]?.weekdayName || "";
                  return (
                    <div
                      key={rIdx}
                      className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 items-center"
                    >
                      <span className="text-xs font-bold text-foreground truncate pl-1">
                        {dayName.slice(0, 3)}
                      </span>

                      {row.map((cell) => {
                        const intensity = cell.intensity;
                        let bgClass = "bg-muted/20 border-border/30";
                        if (intensity > 0.7) {
                          bgClass = "bg-emerald-500 text-white font-bold";
                        } else if (intensity > 0.4) {
                          bgClass = "bg-emerald-500/60 text-white";
                        } else if (intensity > 0.15) {
                          bgClass = "bg-emerald-500/30 text-foreground";
                        } else if (intensity > 0) {
                          bgClass = "bg-emerald-500/15 text-foreground";
                        }

                        return (
                          <div
                            key={cell.hour}
                            className={cn(
                              "h-7 rounded-md border flex items-center justify-center text-[9px] transition-transform hover:scale-125 hover:z-20 relative group cursor-pointer",
                              bgClass
                            )}
                            title={`${cell.weekdayName} at ${String(cell.hour).padStart(2, "0")}:00 - Revenue: ${formatPKR(cell.revenue)} (${cell.transactions} tx)`}
                          >
                            {cell.revenue > 0 ? (
                              <span className="opacity-0 group-hover:opacity-100 font-mono text-[8px]">
                                •
                              </span>
                            ) : null}

                            {/* Floating Tooltip */}
                            <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                              <div className="bg-popover text-popover-foreground text-[10px] py-1 px-2.5 rounded-lg shadow-xl border border-border whitespace-nowrap leading-tight">
                                <p className="font-bold">{cell.weekdayName} {String(cell.hour).padStart(2, "0")}:00</p>
                                <p className="text-primary font-mono">{formatPKR(cell.revenue)}</p>
                                <p className="text-muted-foreground">{cell.transactions} transaction(s)</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HOURLY SALES VELOCITY                             */}
      {/* ========================================================= */}
      {activeTab === "hourly" && (
        <div className="space-y-6">
          {/* Dayparts Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hourlyAnalysis.dayparts.map((part) => (
              <div
                key={part.name}
                className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{part.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    {part.hoursRange}
                  </span>
                </div>
                <p className="text-2xl font-black text-foreground num-mono">
                  {privacyMode ? "••••••" : formatPKR(part.revenue)}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>{part.transactions} transactions</span>
                  <span className="font-bold text-primary">{part.sharePercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* 24-Hour Velocity Bar Chart */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  24-Hour Hourly Sales Velocity Distribution
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hourly transactions recorded in Asia/Karachi local business hours
                </p>
              </div>

              {hourlyAnalysis.peakHour && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <Flame className="w-4 h-4" />
                  <span>Peak at {hourlyAnalysis.peakHour.label}</span>
                </div>
              )}
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyAnalysis.hourly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "14px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PRODUCTS & MEDICINES MIX                          */}
      {/* ========================================================= */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Category Distribution Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col items-center justify-between">
              <h3 className="text-base font-bold text-foreground w-full text-left">
                Revenue by Product Category
              </h3>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productsAnalysis.categoryDistribution.slice(0, 6)}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {productsAnalysis.categoryDistribution.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [privacyMode ? "••••" : formatPKR(val), ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full space-y-1.5 pt-2 border-t border-border/50 text-xs">
                {productsAnalysis.categoryDistribution.slice(0, 4).map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="truncate">{c.category}</span>
                    </span>
                    <span className="font-mono font-bold text-foreground">{c.sharePercent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Medicines */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Top 10 Medicines by Revenue</h3>
                  <p className="text-xs text-muted-foreground">High-velocity pharmaceutical items</p>
                </div>
              </div>

              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3 text-center">Units Sold</th>
                      <th className="py-2.5 px-3 text-right">Revenue</th>
                      <th className="py-2.5 px-3 text-right">Net Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {productsAnalysis.topMedicines.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{m.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">{m.quantitySold}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                          {privacyMode ? "••••" : formatPKR(m.revenue)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                          {m.marginPercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Other Retail Products */}
          {productsAnalysis.topOtherProducts.length > 0 && (
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">Top Non-Medicine Retail Products</h3>
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Units Sold</th>
                      <th className="py-2.5 px-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {productsAnalysis.topOtherProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{p.name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{p.category}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{p.quantitySold}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                          {privacyMode ? "••••" : formatPKR(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DOCTOR CONSULTATIONS                              */}
      {/* ========================================================= */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-teal-500/10 border border-teal-500/20 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Total Consultation Revenue
              </span>
              <p className="text-3xl font-black text-teal-700 dark:text-teal-300 num-mono">
                {privacyMode ? "••••••" : formatPKR(doctorAnalysis.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">Zero cost of goods sold (100% net margin)</p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Patient Visits
              </span>
              <p className="text-3xl font-black text-foreground num-mono">
                {doctorAnalysis.consultationCount}
              </p>
              <p className="text-xs text-muted-foreground">Total clinic encounters recorded</p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Average Consultation Fee
              </span>
              <p className="text-3xl font-black text-foreground num-mono">
                {privacyMode ? "••••" : formatPKR(doctorAnalysis.averageFee)}
              </p>
              <p className="text-xs text-muted-foreground">Average fee collected per patient</p>
            </div>
          </div>

          {/* Doctor Leaderboard Table */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground">Consultation Revenue by Doctor / Clinic</h3>
            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Doctor / Specialty</th>
                    <th className="py-3 px-4 text-center">Consultations</th>
                    <th className="py-3 px-4 text-right">Total Fees Collected</th>
                    <th className="py-3 px-4 text-right">Avg Fee</th>
                    <th className="py-3 px-4 text-right">Revenue Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {doctorAnalysis.doctorBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No doctor consultations recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    doctorAnalysis.doctorBreakdown.map((d) => (
                      <tr key={d.doctorName} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span>{d.doctorName}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">{d.consultationCount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                          {privacyMode ? "••••" : formatPKR(d.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {privacyMode ? "••••" : formatPKR(d.averageFee)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-primary">
                          {d.revenueSharePercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: HISTORICAL COMPARISONS & INTRADAY FORECASTING     */}
      {/* ========================================================= */}
      {activeTab === "forecasting" && (
        <div className="space-y-6">
          {/* Intraday Forecast KPI Cards */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    Today's Data-Driven Sales Forecast ({WEEKDAYS[getKarachiWeekday(new Date())]})
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Statistically grounded baseline using 4-week weekday moving average and intraday run-rate
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Model Confidence:</span>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold border",
                    forecast.confidence === "High"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : forecast.confidence === "Medium"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}
                >
                  {forecast.confidence}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Actual So Far Today</span>
                <p className="text-2xl font-black text-foreground mt-1 num-mono">
                  {privacyMode ? "••••••" : formatPKR(forecast.todayActualRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">As of {forecast.currentLocalTime}</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[10px] font-bold uppercase text-primary">Expected Daily Total</span>
                <p className="text-2xl font-black text-primary mt-1 num-mono">
                  {privacyMode ? "••••••" : formatPKR(forecast.expectedDailyRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Projected full-day close</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Remaining Expected</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 num-mono">
                  {privacyMode ? "••••••" : formatPKR(forecast.remainingExpectedRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Expected between now and 23:59</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Historical Weekday Avg</span>
                <p className="text-2xl font-black text-foreground mt-1 num-mono">
                  {privacyMode ? "••••••" : formatPKR(forecast.historicalSameWeekdayAvg)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Prior 4-week benchmark</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border/60">
              ℹ {forecast.confidenceExplanation} Forecasts are empirical estimates based on historical moving averages; not guaranteed revenue.
            </p>
          </div>

          {/* Intraday Trajectory Chart */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Intraday Accumulation Trajectory</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actual progress curve vs projected remainder and historical baseline
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Projected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground/60 inline-block" /> Baseline
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="hourLabel" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "14px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual So Far"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    name="Projected Trajectory"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalBaseline"
                    name="Historical Baseline"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Same-Weekday Historical Comparison Table */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Same-Weekday Historical Comparison (Prior 4 Weeks)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fair comparison: Includes elapsed revenue up to the same hour ({forecast.currentLocalTime})
              </p>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Full Day Revenue</th>
                    <th className="py-3 px-4 text-right">Elapsed So Far (Fair)</th>
                    <th className="py-3 px-4 text-center">Transactions</th>
                    <th className="py-3 px-4 text-right">Avg Ticket (ATV)</th>
                    <th className="py-3 px-4 text-right">Delta vs Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {forecast.sameWeekdayHistory.map((item, idx) => (
                    <tr
                      key={item.date}
                      className={cn(
                        "hover:bg-muted/20 transition-colors",
                        idx === 0 && "bg-primary/5 font-semibold"
                      )}
                    >
                      <td className="py-3 px-4 font-bold text-foreground">{item.label}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{item.date}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {privacyMode ? "••••" : formatPKR(item.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-primary font-bold">
                        {privacyMode
                          ? "••••"
                          : item.elapsedHoursRevenue !== undefined
                          ? formatPKR(item.elapsedHoursRevenue)
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{item.transactions}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {privacyMode ? "••••" : formatPKR(item.atv)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.differenceFromAvgPercent !== undefined ? (
                          <span
                            className={cn(
                              "font-bold",
                              item.differenceFromAvgPercent >= 0 ? "text-emerald-600" : "text-destructive"
                            )}
                          >
                            {item.differenceFromAvgPercent >= 0 ? "+" : ""}
                            {item.differenceFromAvgPercent.toFixed(1)}%
                          </span>
                        ) : (
                          "Baseline"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming 7 Days Outlook */}
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground">Next 7-Day Revenue Outlook</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast.upcomingWeekForecast.map((day) => (
                <div
                  key={day.date}
                  className={cn(
                    "p-3.5 rounded-2xl border text-center space-y-1.5 transition-all",
                    day.isBusyDay
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/30 border-border/80"
                  )}
                >
                  <p className="text-xs font-bold text-foreground">{day.weekdayName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{day.date.slice(5)}</p>
                  <p className="text-sm font-black text-primary font-mono mt-1">
                    {privacyMode ? "••••" : formatPKR(day.expectedRevenue)}
                  </p>
                  {day.isBusyDay && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-extrabold uppercase">
                      Peak Day
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: AUTOMATED BUSINESS INSIGHTS                       */}
      {/* ========================================================= */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                Algorithmic Business Intelligence Insights
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically derived from your historical database metrics. No opinions or manual assumptions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {businessInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-5 rounded-2xl bg-background border border-border shadow-xs space-y-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {insight.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {insight.metric}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {insight.title}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.summary}
                  </p>

                  <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                    <span>Benchmark:</span>
                    <span className="font-semibold text-foreground">{insight.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
