import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Medicine } from "@/types/medical";
import { db } from "@/firebase"; // ✅ your firebase.js config
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const [todaysSales, setTodaysSales] = useState(0);
  const [todaysProfit, setTodaysProfit] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMedicineSelect = (medicine: Medicine) => {
    console.log("Selected medicine:", medicine);
  };

  // 🔹 Fetch Dashboard Data (memoized so Refresh works properly)
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // --- Get Medicines ---
      const medSnap = await getDocs(collection(db, "medicines"));
      setTotalMedicines(medSnap.size);

      // Low stock (threshold = 10 units)
      const lowStock: any[] = [];
      medSnap.forEach((doc) => {
        const data = doc.data();
        if (data.quantity < 10) {
          lowStock.push({
            medicineId: doc.id,
            medicineName: data.name,
            currentStock: data.quantity,
          });
        }
      });
      setLowStockAlerts(lowStock);

      // --- Get Sales for Today ---
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const salesRef = collection(db, "sales");
      const q = query(salesRef, where("date", "==", today));
      const salesSnap = await getDocs(q);

      let salesTotal = 0;
      let profitTotal = 0;

      salesSnap.forEach((doc) => {
        const data = doc.data();
        salesTotal += data.amount || 0;
        profitTotal += data.profit || 0;
      });

      setTodaysSales(salesTotal);
      setTodaysProfit(profitTotal);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // load on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your medical store management system
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl">
        <SearchBar
          onSelect={handleMedicineSelect}
          placeholder="Quick medicine lookup..."
          className="w-full"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales */}
        <div className="stats-card-primary p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary/70">Today's Sales</p>
              <h3 className="text-2xl font-bold text-primary"> PKR {todaysSales}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="stats-card-success p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success/70">Today's Profit</p>
              <h3 className="text-2xl font-bold text-success"> PKR {todaysProfit}</h3>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Total Medicines */}
        <div className="medical-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Medicines</p>
              <h3 className="text-2xl font-bold text-foreground">{totalMedicines}</h3>
            </div>
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="stats-card-warning p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warning/70">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-warning">{lowStockAlerts.length}</h3>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="medical-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Low Stock Alerts</h2>
          </div>
        </div>

        <div className="p-6">
          {lowStockAlerts.length > 0 ? (
            <div className="space-y-4">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.medicineId}
                  className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <h4 className="font-medium text-foreground">{alert.medicineName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current stock: {alert.currentStock} units
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">All medicines are well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
