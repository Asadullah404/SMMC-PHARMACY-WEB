// import { useEffect, useState, useCallback } from "react";
// import {
//   TrendingUp,
//   Package,
//   DollarSign,
//   AlertTriangle,
//   RefreshCw,
//   Loader2,
//   Eye,
//   EyeOff,
//   Stethoscope,
//   ShoppingCart,
//   Activity,
//   Plus,
//   Minus,
//   Send,
//   X,
//   Phone,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { db } from "@/firebase";
// import { collection, getDocs, query, where } from "firebase/firestore";

// export default function Dashboard() {
//   const [todaysSales, setTodaysSales] = useState(0);
//   const [todaysProfit, setTodaysProfit] = useState(0);
//   const [todaysDoctorFees, setTodaysDoctorFees] = useState(0);
//   const [totalMedicines, setTotalMedicines] = useState(0);
//   const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRevealed, setIsRevealed] = useState(true);

//   // Reorder states
//   const [isReorderMode, setIsReorderMode] = useState(false);
//   const [reorderCart, setReorderCart] = useState<any[]>([]);
//   const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

//   // WhatsApp numbers configuration
//   const whatsappNumbers = [
//     { id: "supplier1", name: "Murshid Medicos Wholsale Num#1", number: "+923332511543" },
//     { id: "supplier1", name: "Murshid Medicos Wholsale Num#2", number: "+923337995170" },
//     { id: "supplier2", name: "Babar Medical Fba Num#1", number: "+923343073375" },
//     { id: "supplier2", name: "Babar Medical Fba Num#2", number: "+923322066879" },
//   ];

//   // Fetch Dashboard Data
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
//             costPrice: data.cost_price || 0,
//           });
//         }
//       });
//       setLowStockAlerts(lowStock);

//       // --- Get Sales for Today ---
//       const today = new Date().toISOString().split("T")[0];
//       const salesRef = collection(db, "sales");
//       const q = query(salesRef, where("date", "==", today));
//       const salesSnap = await getDocs(q);

//       let salesTotal = 0;
//       let profitTotal = 0;
//       let doctorFeesTotal = 0;

//       salesSnap.forEach((doc) => {
//         const data = doc.data();
//         if (data.medicine_id !== "DOCTOR_FEE") {
//           salesTotal += data.amount || 0;
//           profitTotal += data.profit || 0;
//         } else {
//           doctorFeesTotal += data.doctor_fee || 0;
//         }
//       });

//       setTodaysSales(salesTotal);
//       setTodaysProfit(profitTotal);
//       setTodaysDoctorFees(doctorFeesTotal);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   // Add to reorder cart
//   const addToReorderCart = (medicine: any) => {
//     const existing = reorderCart.find((item) => item.medicineId === medicine.medicineId);
//     if (existing) {
//       setReorderCart(
//         reorderCart.map((item) =>
//           item.medicineId === medicine.medicineId
//             ? { ...item, quantity: item.quantity + 10 }
//             : item
//         )
//       );
//     } else {
//       setReorderCart([
//         ...reorderCart,
//         {
//           ...medicine,
//           quantity: 10,
//         },
//       ]);
//     }
//   };

//   // Update quantity in cart
//   // const updateCartQuantity = (medicineId: string, delta: number) => {
//   //   setReorderCart(
//   //     reorderCart.map((item) =>
//   //       item.medicineId === medicineId
//   //     ? { ...item, quantity: Math.max(1, Number(item.quantity) + delta) }
//   //         : item
//   //     )
//   //   );
//   // };

//   const updateCartQuantity = (medicineId: string, delta: number) => {
//     setReorderCart(
//       reorderCart.map((item) => {
//         if (item.medicineId === medicineId) {
//           return {
//             ...item,
//             quantity: Math.max(1, Number(item.quantity) + delta)
//           };
//         }
//         return item;
//       })
//     );
//   };



//   // Remove from cart
//   const removeFromCart = (medicineId: string) => {
//     setReorderCart(reorderCart.filter((item) => item.medicineId !== medicineId));
//   };

//   // Calculate total bill
//   const calculateTotal = () => {
//     return reorderCart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
//   };

//   // Generate WhatsApp message
//   const generateWhatsAppMessage = () => {
//     let message = "🏥 *SMMC - Pharmacy Reorder Request*\n\n";
//     message += `📅 Date: ${new Date().toLocaleDateString()}\n`;
//     message += `⏰ Time: ${new Date().toLocaleTimeString()}\n\n`;
//     message += "📦 *Items to Order:*\n";
//     message += "━━━━━━━━━━━━━━━━━━━━\n\n";

//     reorderCart.forEach((item, index) => {
//       message += `${index + 1}. *${item.medicineName}*\n`;
//       message += `   • Quantity: ${item.quantity} units\n`;
//       message += `   • Unit Cost: PKR ${item.costPrice}\n`;
//       message += `   • Subtotal: PKR ${(item.costPrice * item.quantity).toLocaleString()}\n\n`;
//     });

//     message += "━━━━━━━━━━━━━━━━━━━━\n";
//     message += `💰 *Total Bill: PKR ${calculateTotal().toLocaleString()}*\n\n`;
//     message += "Please confirm availability and delivery time.\n";
//     message += "Thank you! 🙏";

//     return encodeURIComponent(message);
//   };

//   // Send to WhatsApp
//   const sendToWhatsApp = (number: string) => {
//     const message = generateWhatsAppMessage();
//     const whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${message}`;
//     window.open(whatsappUrl, "_blank");
//     setShowWhatsAppModal(false);
//     setIsReorderMode(false);
//     setReorderCart([]);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Dashboard Overview
//           </h1>
//           <p className="text-muted-foreground mt-2 flex items-center gap-2">
//             <Activity className="w-4 h-4" />
//             Real-time insights for your medical store
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             onClick={() => setIsRevealed(!isRevealed)}
//             variant="outline"
//             className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg"
//           >
//             {isRevealed ? (
//               <>
//                 <EyeOff className="w-4 h-4" />
//                 Hide Values
//               </>
//             ) : (
//               <>
//                 <Eye className="w-4 h-4" />
//                 Show Values
//               </>
//             )}
//           </Button>
//           <Button
//             onClick={fetchDashboardData}
//             variant="outline"
//             className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Refreshing...
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Today's Sales */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-4">
//               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <DollarSign className="w-6 h-6" />
//               </div>
//               <ShoppingCart className="w-8 h-8 opacity-20" />
//             </div>
//             <p className="text-sm font-medium text-blue-100 mb-1">Today's Sales</p>
//             <h3 className="text-3xl font-bold">
//               {isRevealed ? `PKR ${todaysSales.toLocaleString()}` : "••••••"}
//             </h3>
//             <p className="text-xs text-blue-100 mt-2">Medicines Only</p>
//           </div>
//         </div>

//         {/* Today's Profit */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-4">
//               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <TrendingUp className="w-6 h-6" />
//               </div>
//               <TrendingUp className="w-8 h-8 opacity-20" />
//             </div>
//             <p className="text-sm font-medium text-green-100 mb-1">Today's Profit</p>
//             <h3 className="text-3xl font-bold">
//               {isRevealed ? `PKR ${todaysProfit.toLocaleString()}` : "••••••"}
//             </h3>
//             <p className="text-xs text-green-100 mt-2">Net Earnings</p>
//           </div>
//         </div>

//         {/* Doctor Fees */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-4">
//               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <Stethoscope className="w-6 h-6" />
//               </div>
//               <Stethoscope className="w-8 h-8 opacity-20" />
//             </div>
//             <p className="text-sm font-medium text-teal-100 mb-1">Doctor Fees</p>
//             <h3 className="text-3xl font-bold">
//               {isRevealed ? `PKR ${todaysDoctorFees.toLocaleString()}` : "••••••"}
//             </h3>
//             <p className="text-xs text-teal-100 mt-2">Consultation Fees</p>
//           </div>
//         </div>

//         {/* Total Medicines */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-4">
//               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <Package className="w-6 h-6" />
//               </div>
//               <Package className="w-8 h-8 opacity-20" />
//             </div>
//             <p className="text-sm font-medium text-purple-100 mb-1">Total Medicines</p>
//             <h3 className="text-3xl font-bold">{totalMedicines}</h3>
//             <p className="text-xs text-purple-100 mt-2">In Inventory</p>
//           </div>
//         </div>
//       </div>

//       {/* Secondary Stats Row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Low Stock Alerts Card */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-3">
//               <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
//                 <AlertTriangle className="w-5 h-5" />
//               </div>
//             </div>
//             <p className="text-sm font-medium text-orange-100 mb-1">Low Stock Alerts</p>
//             <h3 className="text-2xl font-bold">{lowStockAlerts.length}</h3>
//             <p className="text-xs text-orange-100 mt-2">Requires Attention</p>
//           </div>
//         </div>

//         {/* Grand Total Card */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-3">
//               <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
//                 <DollarSign className="w-5 h-5" />
//               </div>
//             </div>
//             <p className="text-sm font-medium text-indigo-100 mb-1">Total Revenue</p>
//             <h3 className="text-2xl font-bold">
//               {isRevealed
//                 ? `PKR ${(todaysSales + todaysDoctorFees).toLocaleString()}`
//                 : "••••••"}
//             </h3>
//             <p className="text-xs text-indigo-100 mt-2">Sales + Fees</p>
//           </div>
//         </div>

//         {/* Performance Indicator */}
//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
//           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
//           <div className="relative">
//             <div className="flex items-center justify-between mb-3">
//               <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
//                 <Activity className="w-5 h-5" />
//               </div>
//             </div>
//             <p className="text-sm font-medium text-pink-100 mb-1">Profit Margin</p>
//             <h3 className="text-2xl font-bold">
//               {isRevealed && todaysSales > 0
//                 ? `${((todaysProfit / todaysSales) * 100).toFixed(1)}%`
//                 : "••••"}
//             </h3>
//             <p className="text-xs text-pink-100 mt-2">Today's Performance</p>
//           </div>
//         </div>
//       </div>

//       {/* Low Stock Alerts Section */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//         <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
//                 <AlertTriangle className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-white">Low Stock Alerts</h2>
//                 <p className="text-sm text-orange-100">
//                   Medicines requiring immediate reorder
//                 </p>
//               </div>
//             </div>
//             {lowStockAlerts.length > 0 && !isReorderMode && (
//               <Button
//                 onClick={() => setIsReorderMode(true)}
//                 className="gap-2 bg-white hover:bg-gray-100 text-orange-600 font-semibold shadow-lg"
//               >
//                 <Package className="w-4 h-4" />
//                 Start Reorder
//               </Button>
//             )}
//           </div>
//         </div>

//         <div className="p-6">
//           {lowStockAlerts.length > 0 ? (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Low Stock Items */}
//               <div className="lg:col-span-2 space-y-4">
//                 {lowStockAlerts.map((alert, index) => (
//                   <div
//                     key={alert.medicineId}
//                     className={`flex items-center justify-between p-5 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg ${
//                       index % 3 === 0
//                         ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-red-500"
//                         : index % 3 === 1
//                         ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-l-orange-500"
//                         : "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-l-yellow-500"
//                     }`}
//                   >
//                     <div className="flex items-center space-x-4 flex-1">
//                       <div
//                         className={`w-12 h-12 rounded-xl flex items-center justify-center ${
//                           alert.currentStock < 5
//                             ? "bg-red-200 dark:bg-red-900"
//                             : "bg-orange-200 dark:bg-orange-900"
//                         }`}
//                       >
//                         <AlertTriangle
//                           className={`w-6 h-6 ${
//                             alert.currentStock < 5
//                               ? "text-red-600 dark:text-red-300"
//                               : "text-orange-600 dark:text-orange-300"
//                           }`}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-lg text-foreground">
//                           {alert.medicineName}
//                         </h4>
//                         <div className="flex items-center gap-4 mt-1">
//                           <p className="text-sm text-muted-foreground flex items-center gap-2">
//                             <Package className="w-4 h-4" />
//                             Stock: <span className="font-bold text-orange-600">{alert.currentStock}</span>
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             Cost: <span className="font-bold">PKR {alert.costPrice}</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     {isReorderMode && (
//                       <Button
//                         onClick={() => addToReorderCart(alert)}
//                         className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-none shadow-md"
//                         size="sm"
//                       >
//                         <Plus className="w-4 h-4 mr-1" />
//                         Add to Cart
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* Reorder Cart */}
//               {isReorderMode && (
//                 <div className="lg:col-span-1">
//                   <div className="sticky top-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
//                         <ShoppingCart className="w-5 h-5" />
//                         Reorder Cart
//                       </h3>
//                       <Button
//                         onClick={() => {
//                           setIsReorderMode(false);
//                           setReorderCart([]);
//                         }}
//                         variant="ghost"
//                         size="sm"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                     </div>

//                     {reorderCart.length === 0 ? (
//                       <div className="text-center py-8">
//                         <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
//                         <p className="text-sm text-muted-foreground">
//                           Cart is empty. Add items to reorder.
//                         </p>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
//                           {reorderCart.map((item) => (
//                             <div
//                               key={item.medicineId}
//                               className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
//                             >
//                               <div className="flex items-start justify-between mb-2">
//                                 <h4 className="font-semibold text-sm text-foreground flex-1">
//                                   {item.medicineName}
//                                 </h4>
//                                 <Button
//                                   onClick={() => removeFromCart(item.medicineId)}
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-6 w-6 p-0"
//                                 >
//                                   <X className="w-3 h-3" />
//                                 </Button>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
//                                   <Button
//                                     onClick={() => updateCartQuantity(item.medicineId, -1)}
//                                     variant="ghost"
//                                     size="sm"
//                                     className="h-7 w-7 p-0"
//                                   >
//                                     <Minus className="w-3 h-3" />
//                                   </Button>
//                                   <span className="text-sm font-bold min-w-[40px] text-center">
//                                     {item.quantity}
//                                   </span>
//                                   <Button
//                                     onClick={() => updateCartQuantity(item.medicineId, 1)}
//                                     variant="ghost"
//                                     size="sm"
//                                     className="h-7 w-7 p-0"
//                                   >
//                                     <Plus className="w-3 h-3" />
//                                   </Button>
//                                 </div>
//                                 <div className="text-right">
//                                   <p className="text-xs text-muted-foreground">
//                                     PKR {item.costPrice} × {item.quantity}
//                                   </p>
//                                   <p className="text-sm font-bold text-foreground">
//                                     PKR {(item.costPrice * item.quantity).toLocaleString()}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mb-4">
//                           <div className="flex items-center justify-between mb-2">
//                             <span className="text-sm text-muted-foreground">Items:</span>
//                             <span className="font-semibold">{reorderCart.length}</span>
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <span className="text-lg font-bold text-foreground">Total:</span>
//                             <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                               PKR {calculateTotal().toLocaleString()}
//                             </span>
//                           </div>
//                         </div>

//                         <Button
//                           onClick={() => setShowWhatsAppModal(true)}
//                           className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg gap-2"
//                         >
//                           <Send className="w-4 h-4" />
//                           Send to WhatsApp
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Package className="w-10 h-10 text-green-600 dark:text-green-400" />
//               </div>
//               <p className="text-lg font-semibold text-foreground">All Stock Levels Healthy!</p>
//               <p className="text-muted-foreground mt-2">
//                 All medicines are well stocked and ready for sale
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* WhatsApp Selection Modal */}
//       {showWhatsAppModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
//                 <Phone className="w-6 h-6 text-green-600" />
//                 Select Supplier
//               </h3>
//               <Button
//                 onClick={() => setShowWhatsAppModal(false)}
//                 variant="ghost"
//                 size="sm"
//               >
//                 <X className="w-5 h-5" />
//               </Button>
//             </div>

//             <div className="space-y-3">
//               {whatsappNumbers.map((supplier) => (
//                 <button
//                   key={supplier.id}
//                   onClick={() => sendToWhatsApp(supplier.number)}
//                   className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg group"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="text-left">
//                       <h4 className="font-bold text-foreground group-hover:text-green-600 transition-colors">
//                         {supplier.name}
//                       </h4>
//                       <p className="text-sm text-muted-foreground">{supplier.number}</p>
//                     </div>
//                     <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
//                       <Send className="w-6 h-6 text-white" />
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>

//             <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//               <p className="text-xs text-center text-muted-foreground">
//                 📋 Your reorder list with {reorderCart.length} items (PKR {calculateTotal().toLocaleString()}) will be sent
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
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
  Plus,
  Minus,
  Send,
  X,
  Phone,
  Search, // Added Search icon
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

  // Reorder states
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderCart, setReorderCart] = useState<any[]>([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // New state for low stock search
  const [lowStockSearch, setLowStockSearch] = useState("");

  // WhatsApp numbers configuration
  const whatsappNumbers = [
    { id: "supplier1", name: "Murshid Medicos Wholsale Num#1", number: "+923332511543" },
    { id: "supplier1", name: "Murshid Medicos Wholsale Num#2", number: "+923337995170" },
    { id: "supplier2", name: "Babar Medical Fba Num#1", number: "+923343073375" },
    { id: "supplier2", name: "Babar Medical Fba Num#2", number: "+923322066879" },
  ];

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
            costPrice: data.cost_price || 0,
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
        if (data.medicine_id !== "DOCTOR_FEE") {
          salesTotal += data.amount || 0;
          profitTotal += data.profit || 0;
        } else {
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

  // Add to reorder cart
  const addToReorderCart = (medicine: any) => {
    const existing = reorderCart.find((item) => item.medicineId === medicine.medicineId);
    if (existing) {
      setReorderCart(
        reorderCart.map((item) =>
          item.medicineId === medicine.medicineId
            ? { ...item, quantity: item.quantity + 10 }
            : item
        )
      );
    } else {
      setReorderCart([
        ...reorderCart,
        {
          ...medicine,
          quantity: 10,
        },
      ]);
    }
  };

  // Update quantity in cart
  const updateCartQuantity = (medicineId: string, delta: number) => {
    setReorderCart(
      reorderCart.map((item) => {
        if (item.medicineId === medicineId) {
          return {
            ...item,
            quantity: Math.max(1, Number(item.quantity) + delta)
          };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (medicineId: string) => {
    setReorderCart(reorderCart.filter((item) => item.medicineId !== medicineId));
  };

  // Calculate total bill
  const calculateTotal = () => {
    return reorderCart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    let message = "🏥 *SMMC - Pharmacy Reorder Request*\n\n";
    message += `📅 Date: ${new Date().toLocaleDateString()}\n`;
    message += `⏰ Time: ${new Date().toLocaleTimeString()}\n\n`;
    message += "📦 *Items to Order:*\n";
    message += "━━━━━━━━━━━━━━━━━━━━\n\n";

    reorderCart.forEach((item, index) => {
      message += `${index + 1}. *${item.medicineName}*\n`;
      message += `   • Quantity: ${item.quantity} units\n`;
      message += `   • Unit Cost: PKR ${item.costPrice}\n`;
      message += `   • Subtotal: PKR ${(item.costPrice * item.quantity).toLocaleString()}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━\n";
    message += `💰 *Total Bill: PKR ${calculateTotal().toLocaleString()}*\n\n`;
    message += "Please confirm availability and delivery time.\n";
    message += "Thank you! 🙏";

    return encodeURIComponent(message);
  };

  // Send to WhatsApp
  const sendToWhatsApp = (number: string) => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setShowWhatsAppModal(false);
    setIsReorderMode(false);
    setReorderCart([]);
  };

  // Filtered low stock alerts based on search
  const filteredLowStockAlerts = lowStockAlerts.filter((alert) =>
    alert.medicineName.toLowerCase().includes(lowStockSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm md:text-base">
            <Activity className="w-4 h-4" />
            Real-time insights for your medical store
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => setIsRevealed(!isRevealed)}
            variant="outline"
            className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none shadow-lg"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Hide Values</span>
                <span className="sm:hidden">Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Show Values</span>
                <span className="sm:hidden">Show</span>
              </>
            )}
          </Button>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Refreshing...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
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
            {lowStockAlerts.length > 0 && !isReorderMode && (
              <Button
                onClick={() => setIsReorderMode(true)}
                className="gap-2 bg-white hover:bg-gray-100 text-orange-600 font-semibold shadow-lg"
              >
                <Package className="w-4 h-4" />
                Start Reorder
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* --- NEW: Search Bar --- */}
          {lowStockAlerts.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search low stock items..."
                value={lowStockSearch}
                onChange={(e) => setLowStockSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* --- UPDATED: Conditional Rendering --- */}
          {lowStockAlerts.length > 0 ? (
            filteredLowStockAlerts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Low Stock Items */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Use filtered list here */}
                  {filteredLowStockAlerts.map((alert, index) => (
                    <div
                      key={alert.medicineId}
                      className={`flex items-center justify-between p-5 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg ${index % 3 === 0
                        ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-red-500"
                        : index % 3 === 1
                          ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-l-orange-500"
                          : "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-l-yellow-500"
                        }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert.currentStock < 5
                            ? "bg-red-200 dark:bg-red-900"
                            : "bg-orange-200 dark:bg-orange-900"
                            }`}
                        >
                          <AlertTriangle
                            className={`w-6 h-6 ${alert.currentStock < 5
                              ? "text-red-600 dark:text-red-300"
                              : "text-orange-600 dark:text-orange-300"
                              }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">
                            {alert.medicineName}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Stock: <span className="font-bold text-orange-600">{alert.currentStock}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cost: <span className="font-bold">PKR {alert.costPrice}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      {isReorderMode && (
                        <Button
                          onClick={() => addToReorderCart(alert)}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-none shadow-md"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reorder Cart */}
                {isReorderMode && (
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Reorder Cart
                        </h3>
                        <Button
                          onClick={() => {
                            setIsReorderMode(false);
                            setReorderCart([]);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {reorderCart.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Cart is empty. Add items to reorder.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                            {reorderCart.map((item) => (
                              <div
                                key={item.medicineId}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-sm text-foreground flex-1">
                                    {item.medicineName}
                                  </h4>
                                  <Button
                                    onClick={() => removeFromCart(item.medicineId)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                    <Button
                                      onClick={() => updateCartQuantity(item.medicineId, -1)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-sm font-bold min-w-[40px] text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      onClick={() => updateCartQuantity(item.medicineId, 1)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                      PKR {item.costPrice} × {item.quantity}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                      PKR {(item.costPrice * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Items:</span>
                              <span className="font-semibold">{reorderCart.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-foreground">Total:</span>
                              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                PKR {calculateTotal().toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => setShowWhatsAppModal(true)}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Send to WhatsApp
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // --- NEW: No Results Message ---
              <div className="text-center py-12">
                <Search className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground">No Medicines Found</p>
                <p className="text-muted-foreground mt-2">
                  Your search for "{lowStockSearch}" matched 0 items.
                </p>
              </div>
            )
          ) : (
            // --- Existing "All Stock Healthy" Message ---
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

      {/* WhatsApp Selection Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Phone className="w-6 h-6 text-green-600" />
                Select Supplier
              </h3>
              <Button
                onClick={() => setShowWhatsAppModal(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {whatsappNumbers.map((supplier) => (
                <button
                  key={supplier.number} // Using number as key for simplicity, assuming they are unique
                  onClick={() => sendToWhatsApp(supplier.number)}
                  className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-700 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="font-bold text-foreground group-hover:text-green-600 transition-colors">
                        {supplier.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{supplier.number}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                📋 Your reorder list with {reorderCart.length} items (PKR {calculateTotal().toLocaleString()}) will be sent
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
