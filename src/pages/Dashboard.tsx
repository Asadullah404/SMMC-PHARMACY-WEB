// import { useEffect, useState, useCallback } from "react";
// import {
//   TrendingUp,
//   Package,
//   DollarSign,
//   AlertTriangle,
//   RefreshCw,
//   Loader2,
// } from "lucide-react";
// import { SearchBar } from "@/components/SearchBar";
// import { Button } from "@/components/ui/button";
// import { Medicine } from "@/types/medical";
// import { db } from "@/firebase"; // ✅ your firebase.js config
// import { collection, getDocs, query, where } from "firebase/firestore";

// export default function Dashboard() {
//   const [todaysSales, setTodaysSales] = useState(0);
//   const [todaysProfit, setTodaysProfit] = useState(0);
//   const [totalMedicines, setTotalMedicines] = useState(0);
//   const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleMedicineSelect = (medicine: Medicine) => {
//     console.log("Selected medicine:", medicine);
//   };

//   // 🔹 Fetch Dashboard Data (memoized so Refresh works properly)
//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);

//       // --- Get Medicines ---
//       const medSnap = await getDocs(collection(db, "medicines"));
//       setTotalMedicines(medSnap.size);

//       // Low stock (threshold = 10 units)
//       const lowStock: any[] = [];
//       medSnap.forEach((doc) => {
//         const data = doc.data();
//         if (data.quantity < 10) {
//           lowStock.push({
//             medicineId: doc.id,
//             medicineName: data.name,
//             currentStock: data.quantity,
//           });
//         }
//       });
//       setLowStockAlerts(lowStock);

//       // --- Get Sales for Today ---
//       const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//       const salesRef = collection(db, "sales");
//       const q = query(salesRef, where("date", "==", today));
//       const salesSnap = await getDocs(q);

//       let salesTotal = 0;
//       let profitTotal = 0;

//       salesSnap.forEach((doc) => {
//         const data = doc.data();
//         salesTotal += data.amount || 0;
//         profitTotal += data.profit || 0;
//       });

//       setTodaysSales(salesTotal);
//       setTodaysProfit(profitTotal);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // load on mount
//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
//           <p className="text-muted-foreground">
//             Welcome to your medical store management system
//           </p>
//         </div>
//         <Button onClick={fetchDashboardData} variant="outline" className="gap-2" disabled={loading}>
//           {loading ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Refreshing...
//             </>
//           ) : (
//             <>
//               <RefreshCw className="w-4 h-4" />
//               Refresh
//             </>
//           )}
//         </Button>
//       </div>

//       {/* Search Bar */}
//       <div className="max-w-2xl">
//         <SearchBar
//           onSelect={handleMedicineSelect}
//           placeholder="Quick medicine lookup..."
//           className="w-full"
//         />
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Sales */}
//         <div className="stats-card-primary p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-primary/70">Today's Sales</p>
//               <h3 className="text-2xl font-bold text-primary"> PKR {todaysSales}</h3>
//             </div>
//             <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
//               <DollarSign className="w-6 h-6 text-primary" />
//             </div>
//           </div>
//         </div>

//         {/* Profit */}
//         <div className="stats-card-success p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-success/70">Today's Profit</p>
//               <h3 className="text-2xl font-bold text-success"> PKR {todaysProfit}</h3>
//             </div>
//             <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
//               <TrendingUp className="w-6 h-6 text-success" />
//             </div>
//           </div>
//         </div>

//         {/* Total Medicines */}
//         <div className="medical-card p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">Total Medicines</p>
//               <h3 className="text-2xl font-bold text-foreground">{totalMedicines}</h3>
//             </div>
//             <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
//               <Package className="w-6 h-6 text-primary" />
//             </div>
//           </div>
//         </div>

//         {/* Low Stock */}
//         <div className="stats-card-warning p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-warning/70">Low Stock Alerts</p>
//               <h3 className="text-2xl font-bold text-warning">{lowStockAlerts.length}</h3>
//             </div>
//             <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
//               <AlertTriangle className="w-6 h-6 text-warning" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Low Stock Alerts */}
//       <div className="medical-card">
//         <div className="p-6 border-b border-border">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-semibold text-foreground">Low Stock Alerts</h2>
//           </div>
//         </div>

//         <div className="p-6">
//           {lowStockAlerts.length > 0 ? (
//             <div className="space-y-4">
//               {lowStockAlerts.map((alert) => (
//                 <div
//                   key={alert.medicineId}
//                   className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <AlertTriangle className="w-5 h-5 text-warning" />
//                     <div>
//                       <h4 className="font-medium text-foreground">{alert.medicineName}</h4>
//                       <p className="text-sm text-muted-foreground">
//                         Current stock: {alert.currentStock} units
//                       </p>
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm">
//                     Reorder
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground">All medicines are well stocked!</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Stethoscope,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const [todaysSales, setTodaysSales] = useState(0);
  const [todaysProfit, setTodaysProfit] = useState(0);
  const [todaysDoctorFees, setTodaysDoctorFees] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(true);

  // Fetch Dashboard Data
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
      const today = new Date().toISOString().split("T")[0];
      const salesRef = collection(db, "sales");
      const q = query(salesRef, where("date", "==", today));
      const salesSnap = await getDocs(q);

      let salesTotal = 0;
      let profitTotal = 0;
      let doctorFeesTotal = 0;

      salesSnap.forEach((doc) => {
        const data = doc.data();
        // Exclude doctor fee entries from sales/profit
        if (data.medicine_id !== "DOCTOR_FEE") {
          salesTotal += data.amount || 0;
          profitTotal += data.profit || 0;
        } else {
          // Count doctor fees separately
          doctorFeesTotal += data.doctor_fee || 0;
        }
      });

      setTodaysSales(salesTotal);
      setTodaysProfit(profitTotal);
      setTodaysDoctorFees(doctorFeesTotal);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time insights for your medical store
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsRevealed(!isRevealed)}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Values
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Values
              </>
            )}
          </Button>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg"
            disabled={loading}
          >
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Sales */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <ShoppingCart className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium text-blue-100 mb-1">Today's Sales</p>
            <h3 className="text-3xl font-bold">
              {isRevealed ? `PKR ${todaysSales.toLocaleString()}` : "••••••"}
            </h3>
            <p className="text-xs text-blue-100 mt-2">Medicines Only</p>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <TrendingUp className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium text-green-100 mb-1">Today's Profit</p>
            <h3 className="text-3xl font-bold">
              {isRevealed ? `PKR ${todaysProfit.toLocaleString()}` : "••••••"}
            </h3>
            <p className="text-xs text-green-100 mt-2">Net Earnings</p>
          </div>
        </div>

        {/* Doctor Fees */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <Stethoscope className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium text-teal-100 mb-1">Doctor Fees</p>
            <h3 className="text-3xl font-bold">
              {isRevealed ? `PKR ${todaysDoctorFees.toLocaleString()}` : "••••••"}
            </h3>
            <p className="text-xs text-teal-100 mt-2">Consultation Fees</p>
          </div>
        </div>

        {/* Total Medicines */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <Package className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium text-purple-100 mb-1">Total Medicines</p>
            <h3 className="text-3xl font-bold">{totalMedicines}</h3>
            <p className="text-xs text-purple-100 mt-2">In Inventory</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Alerts Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-orange-100 mb-1">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold">{lowStockAlerts.length}</h3>
            <p className="text-xs text-orange-100 mt-2">Requires Attention</p>
          </div>
        </div>

        {/* Grand Total Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-100 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold">
              {isRevealed
                ? `PKR ${(todaysSales + todaysDoctorFees).toLocaleString()}`
                : "••••••"}
            </h3>
            <p className="text-xs text-indigo-100 mt-2">Sales + Fees</p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-pink-100 mb-1">Profit Margin</p>
            <h3 className="text-2xl font-bold">
              {isRevealed && todaysSales > 0
                ? `${((todaysProfit / todaysSales) * 100).toFixed(1)}%`
                : "••••"}
            </h3>
            <p className="text-xs text-pink-100 mt-2">Today's Performance</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Low Stock Alerts</h2>
                <p className="text-sm text-orange-100">
                  Medicines requiring immediate reorder
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {lowStockAlerts.length > 0 ? (
            <div className="space-y-4">
              {lowStockAlerts.map((alert, index) => (
                <div
                  key={alert.medicineId}
                  className={`flex items-center justify-between p-5 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg ${
                    index % 3 === 0
                      ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-red-500"
                      : index % 3 === 1
                      ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-l-orange-500"
                      : "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-l-yellow-500"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        alert.currentStock < 5
                          ? "bg-red-200 dark:bg-red-900"
                          : "bg-orange-200 dark:bg-orange-900"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${
                          alert.currentStock < 5
                            ? "text-red-600 dark:text-red-300"
                            : "text-orange-600 dark:text-orange-300"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        {alert.medicineName}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Current stock: <span className="font-bold text-orange-600">{alert.currentStock}</span> units
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-none shadow-md"
                  >
                    Reorder Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-foreground">All Stock Levels Healthy!</p>
              <p className="text-muted-foreground mt-2">
                All medicines are well stocked and ready for sale
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}