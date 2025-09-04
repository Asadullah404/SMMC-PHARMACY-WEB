"use client";

import { useState } from "react";
import { Calendar, FileText, BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // call as autoTable(doc, options)

type ReportType = "sales" | "profit" | "medicines";

export default function Reports() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // helpers
  const num = (v: any) => Number(v ?? 0);
  const formatINR = (n: number) =>
    ` PKR ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Fetch sales data for the selected range
  const generateReport = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "sales"),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "asc")
      );
      const snap = await getDocs(q);
      // normalize numbers to avoid "1" or string issues
      const arr = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          medicine_name: data.medicine_name ?? data.medicineName ?? "",
          quantity: num(data.quantity),
          amount: num(data.amount),
          profit: num(data.profit),
          date: data.date ?? "",
        };
      });
      setSales(arr);
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = sales.reduce((s, r) => s + num(r.amount), 0);
  const totalProfit = sales.reduce((s, r) => s + num(r.profit), 0);

  // Export PDF with large faint logo watermark and summary table
  const exportToPDF = async () => {
    try {
      const doc = new jsPDF("p", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Load logo from public folder
      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = src;
        });

      try {
        const logo = await loadImage("/logo.png");

        // target 80% width of page, keep aspect ratio
        const targetW = pageWidth * 0.8;
        const ratio = (logo.height || 1) / (logo.width || 1);
        const targetH = targetW * ratio;

        // draw logo to a temporary canvas with low alpha to create watermark
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(targetW));
        canvas.height = Math.max(1, Math.floor(targetH));
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.1; // 10% opacity
        ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);

        // center position on PDF page
        const x = (pageWidth - targetW) / 2;
        const y = (pageHeight - targetH) / 2;

        // add watermark image first
        doc.addImage(canvas.toDataURL("image/png"), "PNG", x, y, targetW, targetH);
      } catch (err) {
        // logo load failed -> continue without watermark
        console.warn("Logo load failed, generating PDF without watermark:", err);
      }

      // Header
      doc.setFontSize(18);
      doc.text("Sales Report", 40, 50);
      doc.setFontSize(12);
      doc.text(`From ${startDate} To ${endDate}`, 40, 70);

      // Prepare table rows: medicine, qty, amount, profit, date
      const body = sales.map((s) => [
        s.medicine_name ?? "",
        String(num(s.quantity)),
        formatINR(num(s.amount)),
        formatINR(num(s.profit)),
        s.date ?? "",
      ]);

      // Use autoTable exported function (not doc.autoTable)
      autoTable(doc, {
        head: [["Medicine", "Qty", "Amount", "Profit", "Date"]],
        body,
        startY: 100,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
        theme: "grid",
        // will automatically break into multiple pages if needed
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
      doc.setFontSize(12);
      doc.text(`Total Sales: ${formatINR(totalSales)}`, 40, finalY + 24);
      doc.text(`Total Profit: ${formatINR(totalProfit)}`, 40, finalY + 42);

      doc.save(`sales_report.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. See console for details.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate detailed reports and analyze your business performance</p>
      </div>

      {/* Controls */}
      <div className="medical-card p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Custom Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select className="w-full px-3 py-2 border rounded-md" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              <option value="sales">Sales Report</option>
              <option value="profit">Profit Analysis</option>
              <option value="medicines">Top Medicines</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={generateReport} className="w-full gap-2">
              <BarChart3 className="w-4 h-4" />
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </div>

        {/* Export PDF only */}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToPDF} className="gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quick stats and preview (kept as you had) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats-card-primary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary/70">Total Revenue</p>
              <h3 className="text-2xl font-bold text-primary">{formatINR(totalSales)}</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-xs text-primary/60 mt-2">Selected range</p>
        </div>

        <div className="stats-card-success p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success/70">Net Profit</p>
              <h3 className="text-2xl font-bold text-success">{formatINR(totalProfit)}</h3>
            </div>
            <PieChart className="w-8 h-8 text-success/60" />
          </div>
          <p className="text-xs text-success/60 mt-2">{totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}% margin</p>
        </div>

        <div className="medical-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <h3 className="text-2xl font-bold text-foreground">{sales.length}</h3>
            </div>
            <BarChart3 className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total in range</p>
        </div>
      </div>

      {/* Report Preview */}
      <div className="medical-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Report Preview</h2>
          <p className="text-muted-foreground">Generated for: {startDate} to {endDate}</p>
        </div>

        <div className="p-6">
          {reportType === "sales" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Sales Summary</h3>
              <div className="overflow-x-auto">
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Medicine</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Profit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.id}>
                        <td className="font-mono text-sm">{s.id}</td>
                        <td>{s.medicine_name}</td>
                        <td>{num(s.quantity)}</td>
                        <td className="font-medium">{formatINR(num(s.amount))}</td>
                        <td className="text-success">{formatINR(num(s.profit))}</td>
                        <td>{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sales.length === 0 && <p className="text-muted-foreground text-sm mt-4">No sales found for this date range.</p>}
              </div>
            </div>
          )}

          {reportType === "profit" && (
            <div>
              <h3 className="font-semibold mb-4">Profit Analysis</h3>
              <p>Total Profit: {formatINR(totalProfit)}</p>
              <p>Revenue: {formatINR(totalSales)}</p>
            </div>
          )}

          {reportType === "medicines" && (
            <div>
              <h3 className="font-semibold mb-4">Top Medicines</h3>
              <ul className="space-y-2">
                {Object.values(sales.reduce((acc: any, s) => {
                  const name = s.medicine_name ?? "Unknown";
                  if (!acc[name]) acc[name] = { name, qty: 0 };
                  acc[name].qty += num(s.quantity);
                  return acc;
                }, {})).map((m: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span>{m.name}</span>
                    <span>{m.qty} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
