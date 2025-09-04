"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  Filter,
  Package,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// ✅ Import jsPDF & autoTable correctly
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Demand() {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [totalMedicineValue, setTotalMedicineValue] = useState(0);

  // 🔹 Fetch Demand Data
  const fetchDemandData = async () => {
    try {
      const salesRef = collection(db, "sales");
      const q = query(
        salesRef,
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
      const snapshot = await getDocs(q);

      const medicineMap: Record<
        string,
        { name: string; sales: number; value: number }
      > = {};
      let valueTotal = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const { medicine_name, quantity, amount } = data;

        if (!medicineMap[medicine_name]) {
          medicineMap[medicine_name] = {
            name: medicine_name,
            sales: 0,
            value: 0,
          };
        }

        medicineMap[medicine_name].sales += Number(quantity) || 0;
        medicineMap[medicine_name].value += Number(amount) || 0;
        valueTotal += Number(amount) || 0;
      });

      const medicinesArray = Object.values(medicineMap).sort(
        (a, b) => b.sales - a.sales
      );

      setTopMedicines(medicinesArray);
      setTotalMedicines(medicinesArray.length);
      setTotalMedicineValue(valueTotal);
    } catch (error) {
      console.error("Error fetching demand data:", error);
    }
  };

  useEffect(() => {
    fetchDemandData();
  }, [startDate, endDate]);

  // 🔹 Export PDF
  const exportAnalysis = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/logo.png"; // public/logo.png

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ✅ Watermark
      (doc as any).setGState(new (doc as any).GState({ opacity: 0.1 }));
      doc.addImage(
        logo,
        "PNG",
        (pageWidth - 200) / 2,
        (pageHeight - 220) / 2,
        200,
        220
      );
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

      // ✅ Header
      doc.setFontSize(18);
      doc.text("Medicine Demand Analysis Report", 14, 20);

      doc.setFontSize(12);
      doc.text(`From: ${startDate}   To: ${endDate}`, 14, 30);
      doc.text(`Total Medicines: ${totalMedicines}`, 14, 40);
      doc.text(
        `Total Value:  PKR ${totalMedicineValue.toLocaleString()}`,
        14,
        50
      );

      // ✅ Table
      autoTable(doc, {
        startY: 60,
        head: [["#", "Medicine Name", "Units Sold", "Value"]],
        body: topMedicines.map((med, index) => [
          index + 1,
          med.name,
          med.sales,
          `PKR ${med.value.toLocaleString()}`,
        ]),
        styles: { fillColor: false },
        headStyles: { fillColor: false, textColor: [0, 0, 0] },
        bodyStyles: { fillColor: false, textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: false },
      });

      doc.save("Demand-Analysis.pdf");
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Demand Analysis
          </h1>
          <p className="text-muted-foreground">
            Analyze medicine demand patterns and trends
          </p>
        </div>
        <Button onClick={exportAnalysis} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="medical-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Analysis Period
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={fetchDemandData} className="w-full gap-2">
              <Filter className="w-4 h-4" />
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg flex items-center space-x-4">
          <Package className="w-10 h-10 text-primary" />
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              Total Medicines
            </h4>
            <p className="text-2xl font-bold text-primary">{totalMedicines}</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg flex items-center space-x-4">
          <DollarSign className="w-10 h-10 text-success" />
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              Total Medicine Value
            </h4>
            <p className="text-2xl font-bold text-success">
              PKR {totalMedicineValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Top Selling Medicines */}
      <div className="medical-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Top Selling Medicines
            </h2>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Ranked by sales volume</p>
        </div>

        <div className="p-6 space-y-4">
          {topMedicines.map((medicine, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-primary">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    {medicine.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {medicine.sales} units sold
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                  PKR {medicine.value.toLocaleString()}
                </span>

                {/* Responsive Bar */}
                <div className="w-full sm:w-24 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (medicine.sales / topMedicines[0].sales) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
