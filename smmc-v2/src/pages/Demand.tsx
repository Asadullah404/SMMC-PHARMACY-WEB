import React, { useState, useMemo } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  Filter,
  Package,
  DollarSign,
  Award,
  Sparkles,
  BarChart2,
  FileDown,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR, formatNumber } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export const Demand: React.FC = () => {
  const { sales, privacyMode } = usePharmacy();

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(() => {
    // Default last 30 days
    return new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(today);

  // Quick Preset Helper
  const applyPreset = (preset: "7days" | "30days" | "month" | "year") => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    setEndDate(endStr);

    if (preset === "7days") {
      setStartDate(new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]);
    } else if (preset === "30days") {
      setStartDate(new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]);
    } else if (preset === "month") {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
    } else if (preset === "year") {
      setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]);
    }
  };

  // Aggregate Demand Data
  const demandData = useMemo(() => {
    const medSales = sales.filter(
      (s) => s.medicine_id !== "DOCTOR_FEE" && s.date >= startDate && s.date <= endDate
    );

    const map: Record<
      string,
      { name: string; unitsSold: number; totalValue: number; transactionCount: number }
    > = {};

    let totalUnits = 0;
    let totalGrossValue = 0;

    medSales.forEach((s) => {
      const key = s.medicine_name;
      if (!map[key]) {
        map[key] = {
          name: key,
          unitsSold: 0,
          totalValue: 0,
          transactionCount: 0,
        };
      }
      map[key].unitsSold += s.quantity;
      map[key].totalValue += s.amount;
      map[key].transactionCount += 1;

      totalUnits += s.quantity;
      totalGrossValue += s.amount;
    });

    const ranked = Object.values(map).sort((a, b) => b.unitsSold - a.unitsSold);

    return {
      ranked,
      totalUnits,
      totalGrossValue,
      uniqueMedicinesCount: ranked.length,
    };
  }, [sales, startDate, endDate]);

  const maxVolume = demandData.ranked[0]?.unitsSold || 1;

  // Chart data (top 8)
  const chartData = demandData.ranked.slice(0, 8).map((m) => ({
    name: m.name.length > 15 ? m.name.slice(0, 15) + "…" : m.name,
    fullName: m.name,
    units: m.unitsSold,
    value: m.totalValue,
  }));

  // Export PDF Report
  const exportPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, pageWidth, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("SMMC PHARMACY - MEDICINE DEMAND & VELOCITY REPORT", pageWidth / 2, 10, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Analysis Period: ${startDate} to ${endDate} • Total Volume: ${demandData.totalUnits} units`,
        pageWidth / 2,
        16,
        { align: "center" }
      );

      // Summary table
      autoTable(doc, {
        startY: 26,
        head: [["Total Units Sold", "Gross Value Generated", "Distinct SKUs Sold", "Top Performing SKU"]],
        body: [[
          formatNumber(demandData.totalUnits),
          formatPKR(demandData.totalGrossValue),
          formatNumber(demandData.uniqueMedicinesCount),
          demandData.ranked[0]?.name || "N/A",
        ]],
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 8 },
        bodyStyles: { fontStyle: "bold", fontSize: 8.5 },
      });

      const nextY = (doc as any).lastAutoTable?.finalY + 6;

      const rows = demandData.ranked.map((m, i) => [
        String(i + 1),
        m.name,
        String(m.unitsSold),
        formatPKR(m.totalValue),
        `${((m.unitsSold / demandData.totalUnits) * 100).toFixed(1)}%`,
      ]);

      autoTable(doc, {
        startY: nextY,
        head: [["Rank", "Medicine Name", "Units Sold", "Sales Value", "Volume Share"]],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
      });

      doc.save(`SMMC-Demand-Analysis-${startDate}-to-${endDate}.pdf`);
      toast.success("Demand Analysis PDF generated!");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Demand Velocity &amp; Analytics
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-0.5">
            Identify top-moving medicines, depletion speeds, and optimal wholesale quantities
          </p>
        </div>

        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Export Demand Report</span>
        </button>
      </div>

      {/* Date Filter & Presets */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Analysis Window
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as any)}
                className="px-3.5 py-1.5 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-1">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-background border border-border text-xs focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Strip: 4 Columns on Wide Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Units Dispensed
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-primary mt-3 num-mono">
            {formatNumber(demandData.totalUnits)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total dosage units dispensed in window</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Demand Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(demandData.totalGrossValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Gross sales generated from demand</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distinct SKUs Sold
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-foreground mt-3 num-mono">
            {formatNumber(demandData.uniqueMedicinesCount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Unique pharmaceutical products</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fastest Moving SKU
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg xl:text-xl font-bold tracking-tight text-foreground mt-3 truncate">
            {demandData.ranked[0]?.name || "N/A"}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {demandData.ranked[0]?.unitsSold || 0} units sold in period
          </p>
        </div>
      </div>

      {/* Chart: Top 8 Medicines */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Top Moving SKU Volume Comparison</h3>
              <p className="text-xs text-muted-foreground">Highest demand units in selected window</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium">Units Sold</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} units sold`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="units" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ranked Medicines List */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="font-bold text-base text-foreground">
          Medicine Demand Ranking ({demandData.ranked.length} items sold)
        </h3>

        {demandData.ranked.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No medicine sales recorded in this date range.
          </div>
        ) : (
          <div className="space-y-3">
            {demandData.ranked.map((m, index) => {
              const percentageOfTop = (m.unitsSold / maxVolume) * 100;
              const isTopThree = index < 3;

              return (
                <div
                  key={m.name}
                  className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        index === 0
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : index === 1
                          ? "bg-slate-300/40 text-slate-700 dark:text-slate-300 border border-slate-400/30"
                          : index === 2
                          ? "bg-amber-700/20 text-amber-700 dark:text-amber-300 border border-amber-700/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.unitsSold} units dispensed across {m.transactionCount} transactions
                      </p>
                    </div>
                  </div>

                  {/* Volume bar & value */}
                  <div className="flex items-center gap-4 flex-shrink-0 sm:w-72 justify-between">
                    <div className="w-36 hidden sm:block bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentageOfTop}%` }}
                      />
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground num-mono block">
                        {privacyMode ? "••••" : formatPKR(m.totalValue)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {((m.unitsSold / demandData.totalUnits) * 100).toFixed(1)}% share
                      </span>
                    </div>
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
