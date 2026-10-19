import React, { useState, useMemo } from "react";
import {
  Calendar,
  FileText,
  TrendingUp,
  Download,
  Stethoscope,
  DollarSign,
  BarChart2,
  PieChart as PieIcon,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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

export const Reports: React.FC = () => {
  const { sales, privacyMode } = usePharmacy();

  // Date Range state
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reportType, setReportType] = useState<"sales" | "profit" | "topMeds">("sales");

  // Quick Preset Helper
  const applyPreset = (preset: "today" | "yesterday" | "7days" | "30days" | "month") => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    setEndDate(endStr);

    if (preset === "today") {
      setStartDate(endStr);
    } else if (preset === "yesterday") {
      const y = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      setStartDate(y);
      setEndDate(y);
    } else if (preset === "7days") {
      const d7 = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      setStartDate(d7);
    } else if (preset === "30days") {
      const d30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
      setStartDate(d30);
    } else if (preset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
    }
  };

  // Filter Sales by Date Range
  const filteredSales = useMemo(() => {
    return sales.filter((s) => s.date >= startDate && s.date <= endDate);
  }, [sales, startDate, endDate]);

  const medicineSales = filteredSales.filter((s) => s.medicine_id !== "DOCTOR_FEE");
  const doctorFees = filteredSales.filter((s) => s.medicine_id === "DOCTOR_FEE");

  // Totals
  const totalMedicineSales = medicineSales.reduce((sum, s) => sum + s.amount, 0);
  const totalMedicineProfit = medicineSales.reduce((sum, s) => sum + s.profit, 0);
  const totalDoctorFees = doctorFees.reduce((sum, s) => sum + (s.doctor_fee || s.amount), 0);
  const grandTotalRevenue = totalMedicineSales + totalDoctorFees;
  const grandTotalProfit = totalMedicineProfit + totalDoctorFees;

  const profitMarginPercent =
    totalMedicineSales > 0 ? ((totalMedicineProfit / totalMedicineSales) * 100).toFixed(1) : "0.0";

  // Top Medicines Aggregation
  const topMedicinesList = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number; profit: number }> =
      {};
    medicineSales.forEach((s) => {
      const key = s.medicine_name;
      if (!map[key]) {
        map[key] = { name: key, quantity: 0, revenue: 0, profit: 0 };
      }
      map[key].quantity += s.quantity;
      map[key].revenue += s.amount;
      map[key].profit += s.profit;
    });

    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [medicineSales]);

  // Daily Chart Aggregation
  const dailyChartData = useMemo(() => {
    const dayMap: Record<string, { date: string; sales: number; profit: number }> = {};
    filteredSales.forEach((s) => {
      if (!dayMap[s.date]) {
        dayMap[s.date] = { date: s.date.slice(5), sales: 0, profit: 0 };
      }
      dayMap[s.date].sales += s.amount;
      dayMap[s.date].profit += s.profit;
    });
    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  // Export PDF Report
  const exportPDFReport = async () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Soft Header Banner
      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, pageWidth, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("SMMC PHARMACY - EXECUTIVE FINANCIAL REPORT", pageWidth / 2, 10, { align: "center" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: From ${startDate} To ${endDate} • Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 17, { align: "center" });

      // KPI summary table
      autoTable(doc, {
        startY: 28,
        head: [["Total Medicine Sales", "Medicine Profit", "Doctor Fees", "Grand Combined Revenue", "Total Net Profit"]],
        body: [[
          formatPKR(totalMedicineSales),
          formatPKR(totalMedicineProfit),
          formatPKR(totalDoctorFees),
          formatPKR(grandTotalRevenue),
          formatPKR(grandTotalProfit),
        ]],
        theme: "grid",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontStyle: "bold", textColor: [15, 118, 110], fontSize: 8.5 },
      });

      const nextY = (doc as any).lastAutoTable?.finalY + 6;

      // Table of Sales
      const tableData = filteredSales.map((s, idx) => [
        String(idx + 1),
        s.date,
        s.medicine_name,
        String(s.quantity),
        formatPKR(s.amount),
        formatPKR(s.profit),
      ]);

      autoTable(doc, {
        startY: nextY,
        head: [["#", "Date", "Description", "Qty", "Amount", "Profit"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
      });

      doc.save(`SMMC-Report-${startDate}-to-${endDate}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report");
    }
  };

  // Export Excel
  const exportExcelReport = () => {
    try {
      const data = filteredSales.map((s) => ({
        Date: s.date,
        Description: s.medicine_name,
        Quantity: s.quantity,
        "Amount (PKR)": s.amount,
        "Profit (PKR)": s.profit,
        Customer: s.customer_name || "General",
        Type: s.medicine_id === "DOCTOR_FEE" ? "Consultation Fee" : "Medicine Sale",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
      XLSX.writeFile(wb, `SMMC-Report-${startDate}-to-${endDate}.xlsx`);
      toast.success("Excel spreadsheet downloaded!");
    } catch (e) {
      toast.error("Failed to export Excel");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Reports &amp; Financial Analytics
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-0.5">
            Real-time audit trails, margins analysis, and exportable reconciliation sheets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportExcelReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border transition-colors hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={exportPDFReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Time Period Filters
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "month", label: "This Month" },
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

        {/* Date Inputs & Report Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
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

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
              Report View
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 mt-1 rounded-xl bg-background border border-border text-xs font-semibold focus:ring-1 focus:ring-primary"
            >
              <option value="sales">Sales &amp; Dispensing Ledger</option>
              <option value="profit">Profit Margins Breakdown</option>
              <option value="topMeds">Top Selling Medicines</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medicine Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-foreground mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(totalMedicineSales)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{medicineSales.length} dispensing entries</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medicine Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(totalMedicineProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{profitMarginPercent}% net margin</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Doctor Consultation Fees
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400 mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(totalDoctorFees)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{doctorFees.length} patient visits</p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Grand Total Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl xl:text-3xl font-black tracking-tight text-primary mt-3 num-mono">
            {privacyMode ? "••••••" : formatPKR(grandTotalProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue: {privacyMode ? "••••••" : formatPKR(grandTotalRevenue)}
          </p>
        </div>
      </div>

      {/* Chart Visualization */}
      {dailyChartData.length > 1 && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <h3 className="font-bold text-base text-foreground">
            Daily Financial Distribution in Selected Period
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [privacyMode ? "••••••" : formatPKR(val), ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Report Data Views */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-xs">
        {reportType === "sales" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">
                Transaction Ledger ({filteredSales.length} entries)
              </h3>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/70 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Date</th>
                      <th className="py-3.5 px-4 sm:px-6">Description</th>
                      <th className="py-3.5 px-4 sm:px-6 text-center">Qty</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Amount</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Profit</th>
                      <th className="py-3.5 px-4 sm:px-6">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                          No transactions found within this date range.
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 font-mono text-muted-foreground">{s.date}</td>
                          <td className="py-3.5 px-4 sm:px-6 font-semibold text-foreground text-sm">
                            {s.medicine_name}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-center num-mono font-medium">{s.quantity}</td>
                          <td className="py-3.5 px-4 sm:px-6 text-right num-mono font-bold text-foreground text-sm">
                            {privacyMode ? "••••" : formatPKR(s.amount)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right num-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {privacyMode ? "••••" : formatPKR(s.profit)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                            {s.customer_name || "General Patient"}
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

        {reportType === "profit" && (
          <div className="space-y-6">
            <h3 className="font-bold text-base text-foreground">Profitability &amp; Cost Analysis</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <h4 className="font-bold text-sm text-foreground">Medicine Dispensation Margins</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Gross Medicine Sales:</span>
                    <span className="font-mono font-semibold">{formatPKR(totalMedicineSales)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Cost of Goods Sold (COGS):</span>
                    <span className="font-mono font-semibold">
                      {formatPKR(Math.max(0, totalMedicineSales - totalMedicineProfit))}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Net Medicine Profit:</span>
                    <span className="font-mono font-bold text-emerald-600">{formatPKR(totalMedicineProfit)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Profit Margin Rate:</span>
                    <span className="font-mono font-bold text-primary">{profitMarginPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-3">
                <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200">
                  Doctor Consultation Earnings
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-teal-500/20">
                    <span className="text-muted-foreground">Total Consultations:</span>
                    <span className="font-mono font-semibold">{doctorFees.length} visits</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-teal-500/20">
                    <span className="text-muted-foreground">Total Fees Collected:</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                      {formatPKR(totalDoctorFees)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Net Margin on Fees:</span>
                    <span className="font-mono font-bold text-emerald-600">100.0% (Zero COGS)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === "topMeds" && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-foreground">Top Medicines by Volume</h3>
            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/70 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">#</th>
                    <th className="py-3.5 px-4 sm:px-6">Medicine Name</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Units Sold</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Revenue Generated</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {topMedicinesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        No sales data found for this period.
                      </td>
                    </tr>
                  ) : (
                    topMedicinesList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-foreground text-sm">{m.name}</td>
                        <td className="py-3.5 px-4 sm:px-6 text-center num-mono font-bold text-primary text-sm">
                          {m.quantity}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right num-mono font-semibold text-foreground">
                          {formatPKR(m.revenue)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right num-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPKR(m.profit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
