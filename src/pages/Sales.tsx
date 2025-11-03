

// // // // Sales.tsx
// // // "use client";

// // // import { useState, useEffect } from "react";
// // // import {
// // //   ShoppingCart,
// // //   Plus,
// // //   Minus,
// // //   Receipt,
// // //   RotateCcw,
// // // } from "lucide-react";
// // // import { Button } from "@/components/ui/button";
// // // import { SearchBar } from "@/components/SearchBar";
// // // import { db } from "@/firebase";
// // // import {
// // //   collection,
// // //   addDoc,
// // //   getDocs,
// // //   query,
// // //   where,
// // //   Timestamp,
// // //   doc,
// // //   updateDoc,
// // //   deleteDoc,
// // //   getDoc,
// // //   DocumentData,
// // //   QueryDocumentSnapshot,
// // //   orderBy,
// // //   limit,
// // // } from "firebase/firestore";
// // // import { useToast } from "@/hooks/use-toast"; // assumes you have this

// // // // ------------------ TYPES ------------------

// // // export interface Medicine {
// // //   id: string;
// // //   name: string;
// // //   costPrice: number;
// // //   retailPrice: number;
// // //   quantity: number;
// // //   createdAt?: Timestamp;
// // //   updatedAt?: Timestamp;
// // // }

// // // interface CartItem {
// // //   medicineId: string;
// // //   medicineName: string;
// // //   quantity: number;
// // //   price: number;
// // //   cost: number;
// // //   medicine: Medicine;
// // // }

// // // interface Sale {
// // //   id: string;
// // //   amount: number;
// // //   profit: number;
// // //   date: string;
// // //   timestamp: Timestamp;
// // //   medicineId: string;
// // //   medicineName: string;
// // //   quantity: number;
// // //   costPrice: number;
// // //   retailPrice: number;
// // // }

// // // interface PrescriptionDoc {
// // //   id: string;
// // //   patient?: { name?: string; referringDoctor?: string; [k: string]: any };
// // //   prescription?: Array<{
// // //     id?: string;
// // //     name?: string;
// // //     qty?: number;
// // //     retail_price?: number;
// // //     cost_price?: number;
// // //     dosage?: string;
// // //     instructions?: string;
// // //     [k: string]: any;
// // //   }>;
// // //   totalItems?: number;
// // //   totalRetail?: number;
// // //   timestamp?: string | any;
// // // }

// // // // ------------------ COMPONENT ------------------

// // // export default function Sales() {
// // //   const [cart, setCart] = useState<CartItem[]>([]);
// // //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// // //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// // //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>(
// // //     []
// // //   );
// // //   const { toast } = useToast();

// // //   // Fetch today's sales
// // //   useEffect(() => {
// // //     const fetchSales = async () => {
// // //       try {
// // //         const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
// // //         const q = query(collection(db, "sales"), where("date", "==", today));
// // //         const snapshot = await getDocs(q);

// // //         const salesData: Sale[] = snapshot.docs.map(
// // //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// // //             const data = doc.data();

// // //             // Normalize timestamp
// // //             let timestamp: Timestamp;
// // //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// // //               timestamp = data.timestamp;
// // //             } else if (data.timestamp) {
// // //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// // //             } else {
// // //               timestamp = Timestamp.now();
// // //             }

// // //             return {
// // //               id: doc.id,
// // //               amount: Number(data.amount ?? 0),
// // //               profit: Number(data.profit ?? 0),
// // //               date: data.date ?? "",
// // //               timestamp,
// // //               medicineId: data.medicine_id,
// // //               medicineName: data.medicine_name,
// // //               quantity: Number(data.quantity ?? 0),
// // //               costPrice: Number(data.cost_price ?? 0),
// // //               retailPrice: Number(data.retail_price ?? 0),
// // //             };
// // //           }
// // //         );

// // //         setTodaysSales(salesData);
// // //       } catch (err) {
// // //         console.error("Error fetching today's sales:", err);
// // //       }
// // //     };
// // //     fetchSales();
// // //   }, []);

// // //   // Fetch recent prescriptions (latest 50) from collection 'prescriptions'
// // //   useEffect(() => {
// // //     const fetchPrescriptions = async () => {
// // //       try {
// // //         // latest first
// // //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// // //         const snap = await getDocs(q);
// // //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// // //           const data = d.data();
// // //           return {
// // //             id: d.id,
// // //             patient: data.patient,
// // //             prescription: data.prescription || data.prescribed || [],
// // //             totalItems: data.totalItems,
// // //             totalRetail: data.totalRetail,
// // //             timestamp: data.timestamp,
// // //           };
// // //         });
// // //         setPrescriptions(docs);
// // //       } catch (err) {
// // //         console.error("Error fetching prescriptions:", err);
// // //       }
// // //     };

// // //     fetchPrescriptions();
// // //   }, []);

// // //   // Add medicine to cart
// // //   const addToCart = (medicine: any, quantity: number = 1) => {
// // //     const normalizedMedicine: Medicine = {
// // //       id: medicine.id,
// // //       name: medicine.name,
// // //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// // //       retailPrice: Number(
// // //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// // //       ),
// // //       quantity: Number(medicine.quantity ?? 0),
// // //       createdAt: medicine.created_at,
// // //       updatedAt: medicine.updated_at,
// // //     };

// // //     const existingItem = cart.find(
// // //       (item) => item.medicineId === normalizedMedicine.id
// // //     );
// // //     if (existingItem) {
// // //       setCart(
// // //         cart.map((item) =>
// // //           item.medicineId === normalizedMedicine.id
// // //             ? { ...item, quantity: item.quantity + quantity }
// // //             : item
// // //         )
// // //       );
// // //     } else {
// // //       const newItem: CartItem = {
// // //         medicineId: normalizedMedicine.id,
// // //         medicineName: normalizedMedicine.name,
// // //         quantity,
// // //         price: normalizedMedicine.retailPrice,
// // //         cost: normalizedMedicine.costPrice,
// // //         medicine: normalizedMedicine,
// // //       };
// // //       setCart((prev) => [...prev, newItem]);
// // //     }
// // //   };

// // //   // Add multiple items (used by loading a prescription)
// // //   const addMultipleToCart = (items: {
// // //     id?: string;
// // //     name?: string;
// // //     qty?: number;
// // //     retail_price?: number;
// // //     cost_price?: number;
// // //   }[]) => {
// // //     for (const it of items) {
// // //       const medObj = {
// // //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// // //         name: it.name || "Unnamed",
// // //         cost_price: it.cost_price ?? 0,
// // //         retail_price: it.retail_price ?? 0,
// // //         quantity: it.qty ?? 1,
// // //       };
// // //       addToCart(medObj, medObj.quantity);
// // //     }
// // //   };

// // //   // Update quantity in cart
// // //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// // //     if (newQuantity <= 0) {
// // //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// // //     } else {
// // //       setCart(
// // //         cart.map((item) =>
// // //           item.medicineId === medicineId
// // //             ? { ...item, quantity: newQuantity }
// // //             : item
// // //         )
// // //       );
// // //     }
// // //   };

// // //   // Totals
// // //   const getTotalAmount = () =>
// // //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// // //   // profit rounded to two decimals when displayed
// // //   const getTotalProfit = () =>
// // //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// // //   // ------------------ PROCESS SALE ------------------
// // //   const processSale = async () => {
// // //     if (cart.length === 0) return;

// // //     try {
// // //       for (const item of cart) {
// // //         const amount = item.price * item.quantity;
// // //         const profit = (item.price - item.cost) * item.quantity;

// // //         const saleDoc = {
// // //           amount,
// // //           profit,
// // //           date: new Date().toISOString().split("T")[0],
// // //           timestamp: Timestamp.now(),
// // //           medicine_id: item.medicineId,
// // //           medicine_name: item.medicineName,
// // //           quantity: item.quantity,
// // //           cost_price: item.cost,
// // //           retail_price: item.price,
// // //         };

// // //         await addDoc(collection(db, "sales"), saleDoc);

// // //         // ✅ Update stock in main firebase's medicines collection (if exists)
// // //         const medicineRef = doc(db, "medicines", item.medicineId);
// // //         const medicineSnap = await getDoc(medicineRef);

// // //         if (medicineSnap.exists()) {
// // //           const currentQty = medicineSnap.data().quantity ?? 0;
// // //           await updateDoc(medicineRef, {
// // //             quantity: Math.max(0, currentQty - item.quantity), // prevent negative stock
// // //           });
// // //         }
// // //       }

// // //       setCart([]);

// // //       // ✅ Delete loaded prescription if any
// // // if (activePrescriptionId) {
// // //   try {
// // //     await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// // //     setPrescriptions((prev) =>
// // //       prev.filter((p) => p.id !== activePrescriptionId)
// // //     );
// // //     setActivePrescriptionId(null);
// // //   } catch (err) {
// // //     console.error("Failed to delete prescription:", err);
// // //   }
// // // }


// // //       toast({
// // //         title: "Sale processed",
// // //         description: "Sale saved and stock updated.",
// // //         variant: "default",
// // //       });

// // //       // refresh today's sales
// // //       const today = new Date().toISOString().split("T")[0];
// // //       const q = query(collection(db, "sales"), where("date", "==", today));
// // //       const snapshot = await getDocs(q);

// // //       const salesData: Sale[] = snapshot.docs.map(
// // //         (doc: QueryDocumentSnapshot<DocumentData>) => {
// // //           const data = doc.data();
// // //           let timestamp: Timestamp;
// // //           if (data.timestamp && typeof data.timestamp.toDate === "function") {
// // //             timestamp = data.timestamp;
// // //           } else if (data.timestamp) {
// // //             timestamp = Timestamp.fromDate(new Date(data.timestamp));
// // //           } else {
// // //             timestamp = Timestamp.now();
// // //           }
// // //           return {
// // //             id: doc.id,
// // //             amount: Number(data.amount ?? 0),
// // //             profit: Number(data.profit ?? 0),
// // //             date: data.date ?? "",
// // //             timestamp,
// // //             medicineId: data.medicine_id,
// // //             medicineName: data.medicine_name,
// // //             quantity: Number(data.quantity ?? 0),
// // //             costPrice: Number(data.cost_price ?? 0),
// // //             retailPrice: Number(data.retail_price ?? 0),
// // //           };
// // //         }
// // //       );

// // //       setTodaysSales(salesData);
// // //     } catch (err) {
// // //       console.error("Error processing sale:", err);
// // //       toast({
// // //         title: "Error",
// // //         description: "Failed to process sale. Check console.",
// // //         variant: "destructive",
// // //       });
// // //     }
// // //   };

// // //   // ------------------ REVERSE SALE ------------------
// // //   const reverseSale = async (sale: Sale) => {
// // //     try {
// // //       const medicineRef = doc(db, "medicines", sale.medicineId);
// // //       const medicineSnap = await getDoc(medicineRef);

// // //       if (!medicineSnap.exists()) {
// // //         console.error("Medicine not found:", sale.medicineId);
// // //         return;
// // //       }

// // //       const currentQty = medicineSnap.data().quantity ?? 0;

// // //       await updateDoc(medicineRef, {
// // //         quantity: currentQty + sale.quantity,
// // //       });

// // //       const saleRef = doc(db, "sales", sale.id);
// // //       await deleteDoc(saleRef);

// // //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// // //       toast({
// // //         title: "Sale reversed",
// // //         description: "Sale removed and stock updated.",
// // //         variant: "default",
// // //       });
// // //     } catch (err) {
// // //       console.error("Error reversing sale:", err);
// // //       toast({
// // //         title: "Error",
// // //         description: "Failed to reverse sale.",
// // //         variant: "destructive",
// // //       });
// // //     }
// // //   };

// // //   // ------------------ CLEAR CART (Return Button) ------------------
// // //   const handleReturn = () => {
// // //     if (cart.length === 0) return;
// // //     const confirmClear = window.confirm(
// // //       "Are you sure you want to remove all medicines from the cart?"
// // //     );
// // //     if (confirmClear) setCart([]);
// // //   };

// // //   // ------------------ JSX ------------------

// // //   return (
// // //     <div className="p-6">
// // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // //         {/* Left Side */}
// // //         <div className="space-y-6">
// // //           <h1 className="text-3xl font-bold text-foreground">
// // //             Sales Management
// // //           </h1>

// // //           {/* Medicine Search */}
// // //           <div className="medical-card p-4">
// // //             <h3 className="font-semibold text-foreground mb-3">
// // //               Add Medicine to Cart
// // //             </h3>
// // //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// // //           </div>

// // //           {/* Shopping Cart */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b border-border flex items-center justify-between">
// // //               <h3 className="font-semibold text-foreground">Shopping Cart</h3>
// // //               <ShoppingCart className="w-5 h-5 text-primary" />
// // //             </div>
// // //             <div className="p-4">
// // //               {cart.length > 0 ? (
// // //                 <>
// // //                   {cart.map((item) => (
// // //                     <div
// // //                       key={item.medicineId}
// // //                       className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
// // //                     >
// // //                       <div className="flex-1">
// // //                         <h4 className="font-medium text-foreground">
// // //                           {item.medicineName}
// // //                         </h4>
// // //                         <p className="text-sm text-muted-foreground">
// // //                           PKR {item.price} each
// // //                         </p>
// // //                       </div>
// // //                       <div className="flex items-center space-x-2">
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={() =>
// // //                             updateQuantity(item.medicineId, item.quantity - 1)
// // //                           }
// // //                         >
// // //                           <Minus className="w-3 h-3" />
// // //                         </Button>
// // //                         <span className="w-8 text-center font-medium">
// // //                           {item.quantity}
// // //                         </span>
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={() =>
// // //                             updateQuantity(item.medicineId, item.quantity + 1)
// // //                           }
// // //                         >
// // //                           <Plus className="w-3 h-3" />
// // //                         </Button>
// // //                       </div>
// // //                       <div className="text-right ml-4">
// // //                         <p className="font-medium text-foreground">
// // //                           PKR {(item.price * item.quantity).toFixed(2)}
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                   ))}

// // //                   <div className="border-t border-border pt-3 mt-4">
// // //                     <div className="flex justify-between items-center mb-2">
// // //                       <span className="text-muted-foreground">Subtotal:</span>
// // //                       <span className="font-medium text-foreground">
// // //                         PKR {getTotalAmount().toFixed(2)}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex justify-between items-center mb-4">
// // //                       <span className="text-muted-foreground">Profit:</span>
// // //                       <span className="font-medium text-success">
// // //                         PKR {getTotalProfit().toFixed(2)}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex space-x-3">
// // //                       <Button onClick={processSale} className="flex-1 gap-2">
// // //                         <Receipt className="w-4 h-4" /> Process Sale
// // //                       </Button>
// // //                       <Button
// // //                         variant="outline"
// // //                         className="gap-2"
// // //                         onClick={handleReturn}
// // //                       >
// // //                         <RotateCcw className="w-4 h-4" /> Return
// // //                       </Button>
// // //                     </div>
// // //                   </div>
// // //                 </>
// // //               ) : (
// // //                 <div className="text-center py-8">
// // //                   <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
// // //                   <p className="text-muted-foreground">Your cart is empty</p>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Right Side - Today's Sales, Prescriptions & Recent Sales */}
// // //         <div className="space-y-6">
// // //           <h2 className="text-2xl font-bold text-foreground">
// // //             Today's Sales Summary
// // //           </h2>

// // //           <div className="grid grid-cols-2 gap-4">
// // //             <div className="stats-card-primary p-4">
// // //               <p className="text-sm font-medium text-primary/70">Total Sales</p>
// // //               <h3 className="text-xl font-bold text-primary">
// // //                 PKR{" "}
// // //                 {todaysSales
// // //                   .reduce((sum, sale) => sum + (sale.amount ?? 0), 0)
// // //                   .toFixed(2)}
// // //               </h3>
// // //             </div>
// // //             <div className="stats-card-success p-4">
// // //               <p className="text-sm font-medium text-success/70">
// // //                 Total Profit
// // //               </p>
// // //               <h3 className="text-xl font-bold text-success">
// // //                 PKR{" "}
// // //                 {todaysSales
// // //                   .reduce((sum, sale) => sum + (sale.profit ?? 0), 0)
// // //                   .toFixed(2)}
// // //               </h3>
// // //             </div>
// // //           </div>

// // //           {/* Prescribed Section (A: below Today's Sales Summary) */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b border-border flex items-center justify-between">
// // //               <h3 className="font-semibold text-foreground">Prescriptions</h3>
// // //             </div>

// // //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto pr-2">
// // //               {prescriptions.length === 0 ? (
// // //                 <p className="text-muted-foreground">No prescriptions found.</p>
// // //               ) : (
// // //                 prescriptions.map((pres) => (
// // //                   <div
// // //                     key={pres.id}
// // //                     className="p-3 bg-accent/20 rounded-lg flex items-center justify-between"
// // //                   >
// // //                     <div>
// // //                       <p className="font-medium text-foreground">
// // //                         {pres.patient?.name ?? "Unknown Patient"}
// // //                       </p>
// // //                       <p className="text-sm text-muted-foreground">
// // //                         Doctor: {pres.patient?.referringDoctor ?? "-"} •{" "}
// // //                         PKR {(pres.totalRetail ?? 0).toFixed(2)}
// // //                       </p>
// // //                     </div>

// // //                     <div className="flex items-center gap-2">
// // //                     <Button
// // //   size="sm"
// // //   onClick={() => {
// // //     if (!pres.prescription || pres.prescription.length === 0) {
// // //       toast({
// // //         title: "Empty prescription",
// // //         description: "This prescription has no medicines.",
// // //         variant: "destructive",
// // //       });
// // //       return;
// // //     }
// // //     addMultipleToCart(pres.prescription);
// // //     setActivePrescriptionId(pres.id); // ✅ remember which prescription was loaded
// // //     toast({
// // //       title: "Prescription loaded",
// // //       description: "All medicines added to cart.",
// // //       variant: "default",
// // //     });
// // //   }}
// // // >
// // //   Add to Cart
// // // </Button>

// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Recent Sales (scrollable area on the right) */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b border-border">
// // //               <h3 className="font-semibold text-foreground">Recent Sales</h3>
// // //             </div>

// // //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto pr-2">
// // //               {todaysSales.length === 0 ? (
// // //                 <p className="text-muted-foreground">No sales yet today.</p>
// // //               ) : (
// // //                 todaysSales.map((sale) => (
// // //                   <div key={sale.id} className="p-3 bg-accent/20 rounded-lg">
// // //                     <div className="flex justify-between items-start mb-2">
// // //                       <div>
// // //                         <p className="font-medium text-foreground">
// // //                           {sale.medicineName}
// // //                         </p>
// // //                         <p className="text-sm text-muted-foreground">
// // //                           {sale.timestamp
// // //                             ? sale.timestamp.toDate().toLocaleTimeString()
// // //                             : ""}
// // //                         </p>
// // //                       </div>
// // //                       <div className="text-right">
// // //                         <p className="font-medium text-foreground">
// // //                           PKR {Number(sale.amount).toFixed(2)}
// // //                         </p>
// // //                         <p className="text-sm text-success">
// // //                           Profit: PKR {Number(sale.profit).toFixed(2)}
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                     <div className="flex justify-between items-center">
// // //                       <span className="text-sm text-muted-foreground">
// // //                         Qty: {sale.quantity}
// // //                       </span>
// // //                       <Button
// // //                         variant="destructive"
// // //                         size="sm"
// // //                         onClick={() => reverseSale(sale)}
// // //                         className="gap-1"
// // //                       >
// // //                         <RotateCcw className="w-4 h-4" /> Reverse
// // //                       </Button>
// // //                     </div>
// // //                   </div>
// // //                 ))
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import {
// //   ShoppingCart,
// //   Plus,
// //   Minus,
// //   Receipt,
// //   RotateCcw,
// //   FileDown, // for PDF button
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { SearchBar } from "@/components/SearchBar";
// // import { db } from "@/firebase";
// // import {
// //   collection,
// //   addDoc,
// //   getDocs,
// //   query,
// //   where,
// //   Timestamp,
// //   doc,
// //   updateDoc,
// //   deleteDoc,
// //   getDoc,
// //   DocumentData,
// //   QueryDocumentSnapshot,
// //   orderBy,
// //   limit,
// // } from "firebase/firestore";
// // import { useToast } from "@/hooks/use-toast";
// // import generateSalePDF from "@/components/SalePDF"; // PDF generator component

// // // ------------------ TYPES ------------------

// // export interface Medicine {
// //   id: string;
// //   name: string;
// //   costPrice: number;
// //   retailPrice: number;
// //   quantity: number;
// //   createdAt?: Timestamp;
// //   updatedAt?: Timestamp;
// // }

// // export interface CartItem {
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   price: number;
// //   cost: number;
// //   medicine: Medicine;
// // }

// // interface Sale {
// //   id: string;
// //   amount: number;
// //   profit: number;
// //   date: string;
// //   timestamp: Timestamp;
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   costPrice: number;
// //   retailPrice: number;
// // }

// // interface PrescriptionDoc {
// //   id: string;
// //   patient?: { name?: string; referringDoctor?: string; [k: string]: any };
// //   prescription?: Array<{
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //     dosage?: string;
// //     instructions?: string;
// //     [k: string]: any;
// //   }>;
// //   totalItems?: number;
// //   totalRetail?: number;
// //   timestamp?: string | any;
// // }

// // // ------------------ COMPONENT ------------------

// // export default function Sales() {
// //   const [cart, setCart] = useState<CartItem[]>([]);
// //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
// //   const { toast } = useToast();

// //   // Fetch today's sales
// //   useEffect(() => {
// //     const fetchSales = async () => {
// //       try {
// //         const today = new Date().toISOString().split("T")[0];
// //         const q = query(collection(db, "sales"), where("date", "==", today));
// //         const snapshot = await getDocs(q);

// //         const salesData: Sale[] = snapshot.docs.map(
// //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// //             const data = doc.data();
// //             let timestamp: Timestamp;
// //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// //               timestamp = data.timestamp;
// //             } else if (data.timestamp) {
// //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// //             } else {
// //               timestamp = Timestamp.now();
// //             }
// //             return {
// //               id: doc.id,
// //               amount: Number(data.amount ?? 0),
// //               profit: Number(data.profit ?? 0),
// //               date: data.date ?? "",
// //               timestamp,
// //               medicineId: data.medicine_id,
// //               medicineName: data.medicine_name,
// //               quantity: Number(data.quantity ?? 0),
// //               costPrice: Number(data.cost_price ?? 0),
// //               retailPrice: Number(data.retail_price ?? 0),
// //             };
// //           }
// //         );
// //         setTodaysSales(salesData);
// //       } catch (err) {
// //         console.error("Error fetching today's sales:", err);
// //       }
// //     };
// //     fetchSales();
// //   }, []);

// //   // Fetch prescriptions (latest 50)
// //   useEffect(() => {
// //     const fetchPrescriptions = async () => {
// //       try {
// //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// //         const snap = await getDocs(q);
// //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// //           const data = d.data();
// //           return {
// //             id: d.id,
// //             patient: data.patient,
// //             prescription: data.prescription || data.prescribed || [],
// //             totalItems: data.totalItems,
// //             totalRetail: data.totalRetail,
// //             timestamp: data.timestamp,
// //           };
// //         });
// //         setPrescriptions(docs);
// //       } catch (err) {
// //         console.error("Error fetching prescriptions:", err);
// //       }
// //     };
// //     fetchPrescriptions();
// //   }, []);

// //   // Add single medicine
// //   const addToCart = (medicine: any, quantity: number = 1) => {
// //     const normalizedMedicine: Medicine = {
// //       id: medicine.id,
// //       name: medicine.name,
// //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// //       retailPrice: Number(
// //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// //       ),
// //       quantity: Number(medicine.quantity ?? 0),
// //       createdAt: medicine.created_at,
// //       updatedAt: medicine.updated_at,
// //     };

// //     const existingItem = cart.find(
// //       (item) => item.medicineId === normalizedMedicine.id
// //     );
// //     if (existingItem) {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === normalizedMedicine.id
// //             ? { ...item, quantity: item.quantity + quantity }
// //             : item
// //         )
// //       );
// //     } else {
// //       const newItem: CartItem = {
// //         medicineId: normalizedMedicine.id,
// //         medicineName: normalizedMedicine.name,
// //         quantity,
// //         price: normalizedMedicine.retailPrice,
// //         cost: normalizedMedicine.costPrice,
// //         medicine: normalizedMedicine,
// //       };
// //       setCart((prev) => [...prev, newItem]);
// //     }
// //   };

// //   // Add all medicines from a prescription
// //   const addMultipleToCart = (items: {
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //   }[]) => {
// //     for (const it of items) {
// //       const medObj = {
// //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// //         name: it.name || "Unnamed",
// //         cost_price: it.cost_price ?? 0,
// //         retail_price: it.retail_price ?? 0,
// //         quantity: it.qty ?? 1,
// //       };
// //       addToCart(medObj, medObj.quantity);
// //     }
// //   };

// //   // Update quantity
// //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// //     if (newQuantity <= 0) {
// //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// //     } else {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === medicineId
// //             ? { ...item, quantity: newQuantity }
// //             : item
// //         )
// //       );
// //     }
// //   };

// //   // Totals
// //   const getTotalAmount = () =>
// //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
// //   const getTotalProfit = () =>
// //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// //   // ------------------ PROCESS SALE ------------------
// //   const processSale = async () => {
// //     if (cart.length === 0) return;

// //     try {
// //       for (const item of cart) {
// //         const amount = item.price * item.quantity;
// //         const profit = (item.price - item.cost) * item.quantity;

// //         const saleDoc = {
// //           amount,
// //           profit,
// //           date: new Date().toISOString().split("T")[0],
// //           timestamp: Timestamp.now(),
// //           medicine_id: item.medicineId,
// //           medicine_name: item.medicineName,
// //           quantity: item.quantity,
// //           cost_price: item.cost,
// //           retail_price: item.price,
// //         };

// //         await addDoc(collection(db, "sales"), saleDoc);

// //         const medicineRef = doc(db, "medicines", item.medicineId);
// //         const medicineSnap = await getDoc(medicineRef);
// //         if (medicineSnap.exists()) {
// //           const currentQty = medicineSnap.data().quantity ?? 0;
// //           await updateDoc(medicineRef, {
// //             quantity: Math.max(0, currentQty - item.quantity),
// //           });
// //         }
// //       }

// //       setCart([]);

// //       if (activePrescriptionId) {
// //         try {
// //           await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// //           setPrescriptions((prev) => prev.filter((p) => p.id !== activePrescriptionId));
// //           setActivePrescriptionId(null);
// //         } catch (err) {
// //           console.error("Failed to delete prescription:", err);
// //         }
// //       }

// //       toast({
// //         title: "Sale processed",
// //         description: "Sale saved and stock updated.",
// //         variant: "default",
// //       });

// //       const today = new Date().toISOString().split("T")[0];
// //       const q = query(collection(db, "sales"), where("date", "==", today));
// //       const snapshot = await getDocs(q);
// //       const salesData: Sale[] = snapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           id: doc.id,
// //           amount: Number(data.amount ?? 0),
// //           profit: Number(data.profit ?? 0),
// //           date: data.date ?? "",
// //           timestamp: data.timestamp,
// //           medicineId: data.medicine_id,
// //           medicineName: data.medicine_name,
// //           quantity: Number(data.quantity ?? 0),
// //           costPrice: Number(data.cost_price ?? 0),
// //           retailPrice: Number(data.retail_price ?? 0),
// //         };
// //       });
// //       setTodaysSales(salesData);
// //     } catch (err) {
// //       console.error("Error processing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to process sale. Check console.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Process sale & print PDF
// //   const handleProcessSaleWithPDF = async () => {
// //     await processSale();
// //     generateSalePDF(cart);
// //   };

// //   // Reverse sale
// //   const reverseSale = async (sale: Sale) => {
// //     try {
// //       const medicineRef = doc(db, "medicines", sale.medicineId);
// //       const medicineSnap = await getDoc(medicineRef);

// //       if (!medicineSnap.exists()) return;

// //       const currentQty = medicineSnap.data().quantity ?? 0;
// //       await updateDoc(medicineRef, {
// //         quantity: currentQty + sale.quantity,
// //       });

// //       await deleteDoc(doc(db, "sales", sale.id));
// //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// //       toast({
// //         title: "Sale reversed",
// //         description: "Sale removed and stock updated.",
// //         variant: "default",
// //       });
// //     } catch (err) {
// //       console.error("Error reversing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to reverse sale.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Clear cart
// //   const handleReturn = () => {
// //     if (cart.length === 0) return;
// //     const confirmClear = window.confirm("Remove all medicines from cart?");
// //     if (confirmClear) setCart([]);
// //   };

// //   // ------------------ JSX ------------------

// //   return (
// //     <div className="p-6">
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         {/* Left Side */}
// //         <div className="space-y-6">
// //           <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>

// //           {/* Medicine Search */}
// //           <div className="medical-card p-4">
// //             <h3 className="font-semibold mb-3">Add Medicine to Cart</h3>
// //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// //           </div>

// //           {/* Shopping Cart */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Shopping Cart</h3>
// //               <ShoppingCart className="w-5 h-5 text-primary" />
// //             </div>

// //             <div className="p-4">
// //               {cart.length > 0 ? (
// //                 <>
// //                   {cart.map((item) => (
// //                     <div
// //                       key={item.medicineId}
// //                       className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
// //                     >
// //                       <div className="flex-1">
// //                         <h4 className="font-medium">{item.medicineName}</h4>
// //                         <p className="text-sm text-muted-foreground">
// //                           PKR {item.price} each
// //                         </p>
// //                       </div>
// //                       <div className="flex items-center space-x-2">
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           onClick={() =>
// //                             updateQuantity(item.medicineId, item.quantity - 1)
// //                           }
// //                         >
// //                           <Minus className="w-3 h-3" />
// //                         </Button>
// //                         <span className="w-8 text-center">{item.quantity}</span>
// //                         <Button
// //                           variant="outline"
// //                           size="sm"
// //                           onClick={() =>
// //                             updateQuantity(item.medicineId, item.quantity + 1)
// //                           }
// //                         >
// //                           <Plus className="w-3 h-3" />
// //                         </Button>
// //                       </div>
// //                       <div className="text-right ml-4">
// //                         <p className="font-medium">
// //                           PKR {(item.price * item.quantity).toFixed(2)}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   ))}

// //                   <div className="border-t pt-3 mt-4">
// //                     <div className="flex justify-between mb-2">
// //                       <span>Subtotal:</span>
// //                       <span>PKR {getTotalAmount().toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex justify-between mb-4">
// //                       <span>Profit:</span>
// //                       <span className="text-success">
// //                         PKR {getTotalProfit().toFixed(2)}
// //                       </span>
// //                     </div>

// //                     {/* Conditional buttons */}
// //                     {activePrescriptionId ? (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button
// //                           onClick={handleProcessSaleWithPDF}
// //                           className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
// //                         >
// //                           <FileDown className="w-4 h-4" /> Process & Print PDF
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     ) : (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </>
// //               ) : (
// //                 <div className="text-center py-8">
// //                   <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
// //                   <p>Your cart is empty</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Side */}
// //         <div className="space-y-6">
// //           <h2 className="text-2xl font-bold">Today's Sales Summary</h2>

// //           <div className="grid grid-cols-2 gap-4">
// //             <div className="stats-card-primary p-4">
// //               <p>Total Sales</p>
// //               <h3 className="text-xl font-bold">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.amount ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //             <div className="stats-card-success p-4">
// //               <p>Total Profit</p>
// //               <h3 className="text-xl font-bold text-success">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.profit ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //           </div>

// //           {/* Prescriptions */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Prescriptions</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
// //               {prescriptions.length === 0 ? (
// //                 <p>No prescriptions found.</p>
// //               ) : (
// //                 prescriptions.map((pres) => (
// //                   <div
// //                     key={pres.id}
// //                     className="p-3 bg-accent/20 rounded-lg flex justify-between"
// //                   >
// //                     <div>
// //                       <p className="font-medium">
// //                         {pres.patient?.name ?? "Unknown Patient"}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         Doctor: {pres.patient?.referringDoctor ?? "-"} • PKR{" "}
// //                         {(pres.totalRetail ?? 0).toFixed(2)}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       onClick={() => {
// //                         if (!pres.prescription || pres.prescription.length === 0) {
// //                           toast({
// //                             title: "Empty prescription",
// //                             description: "This prescription has no medicines.",
// //                             variant: "destructive",
// //                           });
// //                           return;
// //                         }
// //                         addMultipleToCart(pres.prescription);
// //                         setActivePrescriptionId(pres.id);
// //                         toast({
// //                           title: "Prescription loaded",
// //                           description: "All medicines added to cart.",
// //                         });
// //                       }}
// //                     >
// //                       Add to Cart
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>

// //           {/* Recent Sales */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b">
// //               <h3 className="font-semibold">Recent Sales</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
// //               {todaysSales.length === 0 ? (
// //                 <p>No sales yet today.</p>
// //               ) : (
// //                 todaysSales.map((s) => (
// //                   <div
// //                     key={s.id}
// //                     className="flex justify-between items-center p-2 bg-accent/30 rounded-lg"
// //                   >
// //                     <div>
// //                       <p className="font-medium">{s.medicineName}</p>
// //                       <p className="text-sm text-muted-foreground">
// //                         {s.quantity} × PKR {s.retailPrice} = PKR {s.amount}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       variant="destructive"
// //                       onClick={() => reverseSale(s)}
// //                     >
// //                       Reverse
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import {
// //   ShoppingCart,
// //   Plus,
// //   Minus,
// //   Receipt,
// //   RotateCcw,
// //   FileDown,
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { SearchBar } from "@/components/SearchBar";
// // import { db } from "@/firebase";
// // import {
// //   collection,
// //   addDoc,
// //   getDocs,
// //   query,
// //   where,
// //   Timestamp,
// //   doc,
// //   updateDoc,
// //   deleteDoc,
// //   getDoc,
// //   DocumentData,
// //   QueryDocumentSnapshot,
// //   orderBy,
// //   limit,
// // } from "firebase/firestore";
// // import { useToast } from "@/hooks/use-toast";
// // import generateSalePDF from "@/components/SalePDF";

// // // ------------------ TYPES ------------------

// // export interface Medicine {
// //   id: string;
// //   name: string;
// //   costPrice: number;
// //   retailPrice: number;
// //   quantity: number;
// //   createdAt?: Timestamp;
// //   updatedAt?: Timestamp;
// // }

// // export interface CartItem {
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   price: number;
// //   cost: number;
// //   medicine: Medicine;
// //   dosage?: string;
// //   instructions?: string;
// // }

// // interface Sale {
// //   id: string;
// //   amount: number;
// //   profit: number;
// //   date: string;
// //   timestamp: Timestamp;
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   costPrice: number;
// //   retailPrice: number;
// // }

// // interface PatientData {
// //   name?: string;
// //   referringDoctor?: string;
// //   age?: string;
// //   gender?: string;
// //   phone?: string;
// //   [k: string]: any;
// // }

// // interface PrescriptionDoc {
// //   id: string;
// //   patient?: PatientData;
// //   prescription?: Array<{
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //     dosage?: string;
// //     instructions?: string;
// //     [k: string]: any;
// //   }>;
// //   totalItems?: number;
// //   totalRetail?: number;
// //   timestamp?: string | any;
// // }

// // // ------------------ COMPONENT ------------------

// // export default function Sales() {
// //   const [cart, setCart] = useState<CartItem[]>([]);
// //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// //   const [activePatient, setActivePatient] = useState<PatientData | null>(null);
// //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
// //   const { toast } = useToast();

// //   // Fetch today's sales
// //   useEffect(() => {
// //     const fetchSales = async () => {
// //       try {
// //         const today = new Date().toISOString().split("T")[0];
// //         const q = query(collection(db, "sales"), where("date", "==", today));
// //         const snapshot = await getDocs(q);

// //         const salesData: Sale[] = snapshot.docs.map(
// //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// //             const data = doc.data();
// //             let timestamp: Timestamp;
// //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// //               timestamp = data.timestamp;
// //             } else if (data.timestamp) {
// //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// //             } else {
// //               timestamp = Timestamp.now();
// //             }
// //             return {
// //               id: doc.id,
// //               amount: Number(data.amount ?? 0),
// //               profit: Number(data.profit ?? 0),
// //               date: data.date ?? "",
// //               timestamp,
// //               medicineId: data.medicine_id,
// //               medicineName: data.medicine_name,
// //               quantity: Number(data.quantity ?? 0),
// //               costPrice: Number(data.cost_price ?? 0),
// //               retailPrice: Number(data.retail_price ?? 0),
// //             };
// //           }
// //         );
// //         setTodaysSales(salesData);
// //       } catch (err) {
// //         console.error("Error fetching today's sales:", err);
// //       }
// //     };
// //     fetchSales();
// //   }, []);

// //   // Fetch prescriptions (latest 50)
// //   useEffect(() => {
// //     const fetchPrescriptions = async () => {
// //       try {
// //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// //         const snap = await getDocs(q);
// //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// //           const data = d.data();
// //           return {
// //             id: d.id,
// //             patient: data.patient,
// //             prescription: data.prescription || data.prescribed || [],
// //             totalItems: data.totalItems,
// //             totalRetail: data.totalRetail,
// //             timestamp: data.timestamp,
// //           };
// //         });
// //         setPrescriptions(docs);
// //       } catch (err) {
// //         console.error("Error fetching prescriptions:", err);
// //       }
// //     };
// //     fetchPrescriptions();
// //   }, []);

// //   // Add single medicine
// //   const addToCart = (medicine: any, quantity: number = 1, dosage?: string, instructions?: string) => {
// //     const normalizedMedicine: Medicine = {
// //       id: medicine.id,
// //       name: medicine.name,
// //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// //       retailPrice: Number(
// //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// //       ),
// //       quantity: Number(medicine.quantity ?? 0),
// //       createdAt: medicine.created_at,
// //       updatedAt: medicine.updated_at,
// //     };

// //     const existingItem = cart.find(
// //       (item) => item.medicineId === normalizedMedicine.id
// //     );
// //     if (existingItem) {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === normalizedMedicine.id
// //             ? { ...item, quantity: item.quantity + quantity }
// //             : item
// //         )
// //       );
// //     } else {
// //       const newItem: CartItem = {
// //         medicineId: normalizedMedicine.id,
// //         medicineName: normalizedMedicine.name,
// //         quantity,
// //         price: normalizedMedicine.retailPrice,
// //         cost: normalizedMedicine.costPrice,
// //         medicine: normalizedMedicine,
// //         dosage: dosage || undefined,
// //         instructions: instructions || undefined,
// //       };
// //       setCart((prev) => [...prev, newItem]);
// //     }
// //   };

// //   // Add all medicines from a prescription
// //   const addMultipleToCart = (items: {
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //     dosage?: string;
// //     instructions?: string;
// //   }[]) => {
// //     for (const it of items) {
// //       const medObj = {
// //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// //         name: it.name || "Unnamed",
// //         cost_price: it.cost_price ?? 0,
// //         retail_price: it.retail_price ?? 0,
// //         quantity: it.qty ?? 1,
// //       };
// //       addToCart(medObj, medObj.quantity, it.dosage, it.instructions);
// //     }
// //   };

// //   // Update quantity
// //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// //     if (newQuantity <= 0) {
// //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// //     } else {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === medicineId
// //             ? { ...item, quantity: newQuantity }
// //             : item
// //         )
// //       );
// //     }
// //   };

// //   // Totals
// //   const getTotalAmount = () =>
// //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
// //   const getTotalProfit = () =>
// //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// //   // ------------------ PROCESS SALE ------------------
// //   const processSale = async () => {
// //     if (cart.length === 0) return;

// //     try {
// //       for (const item of cart) {
// //         const amount = item.price * item.quantity;
// //         const profit = (item.price - item.cost) * item.quantity;

// //         const saleDoc = {
// //           amount,
// //           profit,
// //           date: new Date().toISOString().split("T")[0],
// //           timestamp: Timestamp.now(),
// //           medicine_id: item.medicineId,
// //           medicine_name: item.medicineName,
// //           quantity: item.quantity,
// //           cost_price: item.cost,
// //           retail_price: item.price,
// //         };

// //         await addDoc(collection(db, "sales"), saleDoc);

// //         const medicineRef = doc(db, "medicines", item.medicineId);
// //         const medicineSnap = await getDoc(medicineRef);
// //         if (medicineSnap.exists()) {
// //           const currentQty = medicineSnap.data().quantity ?? 0;
// //           await updateDoc(medicineRef, {
// //             quantity: Math.max(0, currentQty - item.quantity),
// //           });
// //         }
// //       }

// //       setCart([]);
// //       setActivePatient(null);

// //       if (activePrescriptionId) {
// //         try {
// //           await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// //           setPrescriptions((prev) => prev.filter((p) => p.id !== activePrescriptionId));
// //           setActivePrescriptionId(null);
// //         } catch (err) {
// //           console.error("Failed to delete prescription:", err);
// //         }
// //       }

// //       toast({
// //         title: "Sale processed",
// //         description: "Sale saved and stock updated.",
// //         variant: "default",
// //       });

// //       const today = new Date().toISOString().split("T")[0];
// //       const q = query(collection(db, "sales"), where("date", "==", today));
// //       const snapshot = await getDocs(q);
// //       const salesData: Sale[] = snapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           id: doc.id,
// //           amount: Number(data.amount ?? 0),
// //           profit: Number(data.profit ?? 0),
// //           date: data.date ?? "",
// //           timestamp: data.timestamp,
// //           medicineId: data.medicine_id,
// //           medicineName: data.medicine_name,
// //           quantity: Number(data.quantity ?? 0),
// //           costPrice: Number(data.cost_price ?? 0),
// //           retailPrice: Number(data.retail_price ?? 0),
// //         };
// //       });
// //       setTodaysSales(salesData);
// //     } catch (err) {
// //       console.error("Error processing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to process sale. Check console.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Process sale & print PDF
// //   const handleProcessSaleWithPDF = async () => {
// //     if (cart.length === 0) return;
    
// //     try {
// //       // IMPORTANT: Generate PDF FIRST (before cart is cleared)
// //       console.log("Generating PDF with cart items:", cart.length);
// //       console.log("Patient data:", activePatient);
      
// //       await generateSalePDF({
// //         cart: cart,
// //         patient: activePatient || undefined,
// //       });
      
// //       console.log("PDF generation completed");
      
// //       // Small delay to ensure PDF download starts
// //       await new Promise(resolve => setTimeout(resolve, 500));
      
// //       // Then process the sale (this clears the cart)
// //       await processSale();
      
// //       toast({
// //         title: "PDF Generated",
// //         description: "Receipt PDF has been downloaded successfully.",
// //         variant: "default",
// //       });
// //     } catch (error) {
// //       console.error("Error in PDF generation:", error);
// //       toast({
// //         title: "PDF Error",
// //         description: "Failed to generate PDF. Check console for details.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Reverse sale
// //   const reverseSale = async (sale: Sale) => {
// //     try {
// //       const medicineRef = doc(db, "medicines", sale.medicineId);
// //       const medicineSnap = await getDoc(medicineRef);

// //       if (!medicineSnap.exists()) return;

// //       const currentQty = medicineSnap.data().quantity ?? 0;
// //       await updateDoc(medicineRef, {
// //         quantity: currentQty + sale.quantity,
// //       });

// //       await deleteDoc(doc(db, "sales", sale.id));
// //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// //       toast({
// //         title: "Sale reversed",
// //         description: "Sale removed and stock updated.",
// //         variant: "default",
// //       });
// //     } catch (err) {
// //       console.error("Error reversing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to reverse sale.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Clear cart
// //   const handleReturn = () => {
// //     if (cart.length === 0) return;
// //     const confirmClear = window.confirm("Remove all medicines from cart?");
// //     if (confirmClear) {
// //       setCart([]);
// //       setActivePrescriptionId(null);
// //       setActivePatient(null);
// //     }
// //   };

// //   // ------------------ JSX ------------------

// //   return (
// //     <div className="p-6">
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         {/* Left Side */}
// //         <div className="space-y-6">
// //           <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>

// //           {/* Active Patient Info */}
// //           {activePatient && (
// //             <div className="medical-card p-4 bg-blue-50 dark:bg-blue-950">
// //               <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Active Prescription</h3>
// //               <p className="text-sm"><strong>Patient:</strong> {activePatient.name}</p>
// //               <p className="text-sm"><strong>Doctor:</strong> {activePatient.referringDoctor}</p>
// //               {activePatient.age && <p className="text-sm"><strong>Age:</strong> {activePatient.age}</p>}
// //               {activePatient.gender && <p className="text-sm"><strong>Gender:</strong> {activePatient.gender}</p>}
// //             </div>
// //           )}

// //           {/* Medicine Search */}
// //           <div className="medical-card p-4">
// //             <h3 className="font-semibold mb-3">Add Medicine to Cart</h3>
// //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// //           </div>

// //           {/* Shopping Cart */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Shopping Cart</h3>
// //               <ShoppingCart className="w-5 h-5 text-primary" />
// //             </div>

// //             <div className="p-4">
// //               {cart.length > 0 ? (
// //                 <>
// //                   {cart.map((item) => (
// //                     <div
// //                       key={item.medicineId}
// //                       className="flex flex-col p-3 bg-accent/30 rounded-lg mb-3"
// //                     >
// //                       <div className="flex items-center justify-between">
// //                         <div className="flex-1">
// //                           <h4 className="font-medium">{item.medicineName}</h4>
// //                           <p className="text-sm text-muted-foreground">
// //                             PKR {item.price} each
// //                           </p>
// //                           {item.dosage && (
// //                             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
// //                               <strong>Dosage:</strong> {item.dosage}
// //                             </p>
// //                           )}
// //                           {item.instructions && (
// //                             <p className="text-xs text-green-600 dark:text-green-400">
// //                               <strong>Instructions:</strong> {item.instructions}
// //                             </p>
// //                           )}
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             onClick={() =>
// //                               updateQuantity(item.medicineId, item.quantity - 1)
// //                             }
// //                           >
// //                             <Minus className="w-3 h-3" />
// //                           </Button>
// //                           <span className="w-8 text-center">{item.quantity}</span>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             onClick={() =>
// //                               updateQuantity(item.medicineId, item.quantity + 1)
// //                             }
// //                           >
// //                             <Plus className="w-3 h-3" />
// //                           </Button>
// //                         </div>
// //                         <div className="text-right ml-4">
// //                           <p className="font-medium">
// //                             PKR {(item.price * item.quantity).toFixed(2)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}

// //                   <div className="border-t pt-3 mt-4">
// //                     <div className="flex justify-between mb-2">
// //                       <span>Subtotal:</span>
// //                       <span>PKR {getTotalAmount().toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex justify-between mb-4">
// //                       <span>Profit:</span>
// //                       <span className="text-success">
// //                         PKR {getTotalProfit().toFixed(2)}
// //                       </span>
// //                     </div>

// //                     {/* Conditional buttons */}
// //                     {activePrescriptionId ? (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button
// //                           onClick={handleProcessSaleWithPDF}
// //                           className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
// //                         >
// //                           <FileDown className="w-4 h-4" /> Process & Print PDF
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     ) : (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </>
// //               ) : (
// //                 <div className="text-center py-8">
// //                   <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
// //                   <p>Your cart is empty</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Side */}
// //         <div className="space-y-6">
// //           <h2 className="text-2xl font-bold">Today's Sales Summary</h2>

// //           <div className="grid grid-cols-2 gap-4">
// //             <div className="stats-card-primary p-4">
// //               <p>Total Sales</p>
// //               <h3 className="text-xl font-bold">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.amount ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //             <div className="stats-card-success p-4">
// //               <p>Total Profit</p>
// //               <h3 className="text-xl font-bold text-success">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.profit ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //           </div>

// //           {/* Prescriptions */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Prescriptions</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
// //               {prescriptions.length === 0 ? (
// //                 <p>No prescriptions found.</p>
// //               ) : (
// //                 prescriptions.map((pres) => (
// //                   <div
// //                     key={pres.id}
// //                     className="p-3 bg-accent/20 rounded-lg flex justify-between"
// //                   >
// //                     <div>
// //                       <p className="font-medium">
// //                         {pres.patient?.name ?? "Unknown Patient"}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         Doctor: {pres.patient?.referringDoctor ?? "-"} • PKR{" "}
// //                         {(pres.totalRetail ?? 0).toFixed(2)}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       onClick={() => {
// //                         if (!pres.prescription || pres.prescription.length === 0) {
// //                           toast({
// //                             title: "Empty prescription",
// //                             description: "This prescription has no medicines.",
// //                             variant: "destructive",
// //                           });
// //                           return;
// //                         }
// //                         addMultipleToCart(pres.prescription);
// //                         setActivePrescriptionId(pres.id);
// //                         setActivePatient(pres.patient || null);
// //                         toast({
// //                           title: "Prescription loaded",
// //                           description: "All medicines added to cart.",
// //                         });
// //                       }}
// //                     >
// //                       Add to Cart
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>

// //           {/* Recent Sales */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b">
// //               <h3 className="font-semibold">Recent Sales</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
// //               {todaysSales.length === 0 ? (
// //                 <p>No sales yet today.</p>
// //               ) : (
// //                 todaysSales.map((s) => (
// //                   <div
// //                     key={s.id}
// //                     className="flex justify-between items-center p-2 bg-accent/30 rounded-lg"
// //                   >
// //                     <div>
// //                       <p className="font-medium">{s.medicineName}</p>
// //                       <p className="text-sm text-muted-foreground">
// //                         {s.quantity} × PKR {s.retailPrice} = PKR {s.amount}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       variant="destructive"
// //                       onClick={() => reverseSale(s)}
// //                     >
// //                       Reverse
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



// // // // // Sales.tsx
// // // // "use client";

// // // // import { useState, useEffect } from "react";
// // // // import {
// // // //   ShoppingCart,
// // // //   Plus,
// // // //   Minus,
// // // //   Receipt,
// // // //   RotateCcw,
// // // // } from "lucide-react";
// // // // import { Button } from "@/components/ui/button";
// // // // import { SearchBar } from "@/components/SearchBar";
// // // // import { db } from "@/firebase";
// // // // import {
// // // //   collection,
// // // //   addDoc,
// // // //   getDocs,
// // // //   query,
// // // //   where,
// // // //   Timestamp,
// // // //   doc,
// // // //   updateDoc,
// // // //   deleteDoc,
// // // //   getDoc,
// // // //   DocumentData,
// // // //   QueryDocumentSnapshot,
// // // //   orderBy,
// // // //   limit,
// // // // } from "firebase/firestore";
// // // // import { useToast } from "@/hooks/use-toast"; // assumes you have this

// // // // // ------------------ TYPES ------------------

// // // // export interface Medicine {
// // // //   id: string;
// // // //   name: string;
// // // //   costPrice: number;
// // // //   retailPrice: number;
// // // //   quantity: number;
// // // //   createdAt?: Timestamp;
// // // //   updatedAt?: Timestamp;
// // // // }

// // // // interface CartItem {
// // // //   medicineId: string;
// // // //   medicineName: string;
// // // //   quantity: number;
// // // //   price: number;
// // // //   cost: number;
// // // //   medicine: Medicine;
// // // // }

// // // // interface Sale {
// // // //   id: string;
// // // //   amount: number;
// // // //   profit: number;
// // // //   date: string;
// // // //   timestamp: Timestamp;
// // // //   medicineId: string;
// // // //   medicineName: string;
// // // //   quantity: number;
// // // //   costPrice: number;
// // // //   retailPrice: number;
// // // // }

// // // // interface PrescriptionDoc {
// // // //   id: string;
// // // //   patient?: { name?: string; referringDoctor?: string; [k: string]: any };
// // // //   prescription?: Array<{
// // // //     id?: string;
// // // //     name?: string;
// // // //     qty?: number;
// // // //     retail_price?: number;
// // // //     cost_price?: number;
// // // //     dosage?: string;
// // // //     instructions?: string;
// // // //     [k: string]: any;
// // // //   }>;
// // // //   totalItems?: number;
// // // //   totalRetail?: number;
// // // //   timestamp?: string | any;
// // // // }

// // // // // ------------------ COMPONENT ------------------

// // // // export default function Sales() {
// // // //   const [cart, setCart] = useState<CartItem[]>([]);
// // // //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// // // //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// // // //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>(
// // // //     []
// // // //   );
// // // //   const { toast } = useToast();

// // // //   // Fetch today's sales
// // // //   useEffect(() => {
// // // //     const fetchSales = async () => {
// // // //       try {
// // // //         const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
// // // //         const q = query(collection(db, "sales"), where("date", "==", today));
// // // //         const snapshot = await getDocs(q);

// // // //         const salesData: Sale[] = snapshot.docs.map(
// // // //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// // // //             const data = doc.data();

// // // //             // Normalize timestamp
// // // //             let timestamp: Timestamp;
// // // //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// // // //               timestamp = data.timestamp;
// // // //             } else if (data.timestamp) {
// // // //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// // // //             } else {
// // // //               timestamp = Timestamp.now();
// // // //             }

// // // //             return {
// // // //               id: doc.id,
// // // //               amount: Number(data.amount ?? 0),
// // // //               profit: Number(data.profit ?? 0),
// // // //               date: data.date ?? "",
// // // //               timestamp,
// // // //               medicineId: data.medicine_id,
// // // //               medicineName: data.medicine_name,
// // // //               quantity: Number(data.quantity ?? 0),
// // // //               costPrice: Number(data.cost_price ?? 0),
// // // //               retailPrice: Number(data.retail_price ?? 0),
// // // //             };
// // // //           }
// // // //         );

// // // //         setTodaysSales(salesData);
// // // //       } catch (err) {
// // // //         console.error("Error fetching today's sales:", err);
// // // //       }
// // // //     };
// // // //     fetchSales();
// // // //   }, []);

// // // //   // Fetch recent prescriptions (latest 50) from collection 'prescriptions'
// // // //   useEffect(() => {
// // // //     const fetchPrescriptions = async () => {
// // // //       try {
// // // //         // latest first
// // // //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// // // //         const snap = await getDocs(q);
// // // //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// // // //           const data = d.data();
// // // //           return {
// // // //             id: d.id,
// // // //             patient: data.patient,
// // // //             prescription: data.prescription || data.prescribed || [],
// // // //             totalItems: data.totalItems,
// // // //             totalRetail: data.totalRetail,
// // // //             timestamp: data.timestamp,
// // // //           };
// // // //         });
// // // //         setPrescriptions(docs);
// // // //       } catch (err) {
// // // //         console.error("Error fetching prescriptions:", err);
// // // //       }
// // // //     };

// // // //     fetchPrescriptions();
// // // //   }, []);

// // // //   // Add medicine to cart
// // // //   const addToCart = (medicine: any, quantity: number = 1) => {
// // // //     const normalizedMedicine: Medicine = {
// // // //       id: medicine.id,
// // // //       name: medicine.name,
// // // //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// // // //       retailPrice: Number(
// // // //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// // // //       ),
// // // //       quantity: Number(medicine.quantity ?? 0),
// // // //       createdAt: medicine.created_at,
// // // //       updatedAt: medicine.updated_at,
// // // //     };

// // // //     const existingItem = cart.find(
// // // //       (item) => item.medicineId === normalizedMedicine.id
// // // //     );
// // // //     if (existingItem) {
// // // //       setCart(
// // // //         cart.map((item) =>
// // // //           item.medicineId === normalizedMedicine.id
// // // //             ? { ...item, quantity: item.quantity + quantity }
// // // //             : item
// // // //         )
// // // //       );
// // // //     } else {
// // // //       const newItem: CartItem = {
// // // //         medicineId: normalizedMedicine.id,
// // // //         medicineName: normalizedMedicine.name,
// // // //         quantity,
// // // //         price: normalizedMedicine.retailPrice,
// // // //         cost: normalizedMedicine.costPrice,
// // // //         medicine: normalizedMedicine,
// // // //       };
// // // //       setCart((prev) => [...prev, newItem]);
// // // //     }
// // // //   };

// // // //   // Add multiple items (used by loading a prescription)
// // // //   const addMultipleToCart = (items: {
// // // //     id?: string;
// // // //     name?: string;
// // // //     qty?: number;
// // // //     retail_price?: number;
// // // //     cost_price?: number;
// // // //   }[]) => {
// // // //     for (const it of items) {
// // // //       const medObj = {
// // // //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// // // //         name: it.name || "Unnamed",
// // // //         cost_price: it.cost_price ?? 0,
// // // //         retail_price: it.retail_price ?? 0,
// // // //         quantity: it.qty ?? 1,
// // // //       };
// // // //       addToCart(medObj, medObj.quantity);
// // // //     }
// // // //   };

// // // //   // Update quantity in cart
// // // //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// // // //     if (newQuantity <= 0) {
// // // //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// // // //     } else {
// // // //       setCart(
// // // //         cart.map((item) =>
// // // //           item.medicineId === medicineId
// // // //             ? { ...item, quantity: newQuantity }
// // // //             : item
// // // //         )
// // // //       );
// // // //     }
// // // //   };

// // // //   // Totals
// // // //   const getTotalAmount = () =>
// // // //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// // // //   // profit rounded to two decimals when displayed
// // // //   const getTotalProfit = () =>
// // // //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// // // //   // ------------------ PROCESS SALE ------------------
// // // //   const processSale = async () => {
// // // //     if (cart.length === 0) return;

// // // //     try {
// // // //       for (const item of cart) {
// // // //         const amount = item.price * item.quantity;
// // // //         const profit = (item.price - item.cost) * item.quantity;

// // // //         const saleDoc = {
// // // //           amount,
// // // //           profit,
// // // //           date: new Date().toISOString().split("T")[0],
// // // //           timestamp: Timestamp.now(),
// // // //           medicine_id: item.medicineId,
// // // //           medicine_name: item.medicineName,
// // // //           quantity: item.quantity,
// // // //           cost_price: item.cost,
// // // //           retail_price: item.price,
// // // //         };

// // // //         await addDoc(collection(db, "sales"), saleDoc);

// // // //         // ✅ Update stock in main firebase's medicines collection (if exists)
// // // //         const medicineRef = doc(db, "medicines", item.medicineId);
// // // //         const medicineSnap = await getDoc(medicineRef);

// // // //         if (medicineSnap.exists()) {
// // // //           const currentQty = medicineSnap.data().quantity ?? 0;
// // // //           await updateDoc(medicineRef, {
// // // //             quantity: Math.max(0, currentQty - item.quantity), // prevent negative stock
// // // //           });
// // // //         }
// // // //       }

// // // //       setCart([]);

// // // //       // ✅ Delete loaded prescription if any
// // // // if (activePrescriptionId) {
// // // //   try {
// // // //     await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// // // //     setPrescriptions((prev) =>
// // // //       prev.filter((p) => p.id !== activePrescriptionId)
// // // //     );
// // // //     setActivePrescriptionId(null);
// // // //   } catch (err) {
// // // //     console.error("Failed to delete prescription:", err);
// // // //   }
// // // // }


// // // //       toast({
// // // //         title: "Sale processed",
// // // //         description: "Sale saved and stock updated.",
// // // //         variant: "default",
// // // //       });

// // // //       // refresh today's sales
// // // //       const today = new Date().toISOString().split("T")[0];
// // // //       const q = query(collection(db, "sales"), where("date", "==", today));
// // // //       const snapshot = await getDocs(q);

// // // //       const salesData: Sale[] = snapshot.docs.map(
// // // //         (doc: QueryDocumentSnapshot<DocumentData>) => {
// // // //           const data = doc.data();
// // // //           let timestamp: Timestamp;
// // // //           if (data.timestamp && typeof data.timestamp.toDate === "function") {
// // // //             timestamp = data.timestamp;
// // // //           } else if (data.timestamp) {
// // // //             timestamp = Timestamp.fromDate(new Date(data.timestamp));
// // // //           } else {
// // // //             timestamp = Timestamp.now();
// // // //           }
// // // //           return {
// // // //             id: doc.id,
// // // //             amount: Number(data.amount ?? 0),
// // // //             profit: Number(data.profit ?? 0),
// // // //             date: data.date ?? "",
// // // //             timestamp,
// // // //             medicineId: data.medicine_id,
// // // //             medicineName: data.medicine_name,
// // // //             quantity: Number(data.quantity ?? 0),
// // // //             costPrice: Number(data.cost_price ?? 0),
// // // //             retailPrice: Number(data.retail_price ?? 0),
// // // //           };
// // // //         }
// // // //       );

// // // //       setTodaysSales(salesData);
// // // //     } catch (err) {
// // // //       console.error("Error processing sale:", err);
// // // //       toast({
// // // //         title: "Error",
// // // //         description: "Failed to process sale. Check console.",
// // // //         variant: "destructive",
// // // //       });
// // // //     }
// // // //   };

// // // //   // ------------------ REVERSE SALE ------------------
// // // //   const reverseSale = async (sale: Sale) => {
// // // //     try {
// // // //       const medicineRef = doc(db, "medicines", sale.medicineId);
// // // //       const medicineSnap = await getDoc(medicineRef);

// // // //       if (!medicineSnap.exists()) {
// // // //         console.error("Medicine not found:", sale.medicineId);
// // // //         return;
// // // //       }

// // // //       const currentQty = medicineSnap.data().quantity ?? 0;

// // // //       await updateDoc(medicineRef, {
// // // //         quantity: currentQty + sale.quantity,
// // // //       });

// // // //       const saleRef = doc(db, "sales", sale.id);
// // // //       await deleteDoc(saleRef);

// // // //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// // // //       toast({
// // // //         title: "Sale reversed",
// // // //         description: "Sale removed and stock updated.",
// // // //         variant: "default",
// // // //       });
// // // //     } catch (err) {
// // // //       console.error("Error reversing sale:", err);
// // // //       toast({
// // // //         title: "Error",
// // // //         description: "Failed to reverse sale.",
// // // //         variant: "destructive",
// // // //       });
// // // //     }
// // // //   };

// // // //   // ------------------ CLEAR CART (Return Button) ------------------
// // // //   const handleReturn = () => {
// // // //     if (cart.length === 0) return;
// // // //     const confirmClear = window.confirm(
// // // //       "Are you sure you want to remove all medicines from the cart?"
// // // //     );
// // // //     if (confirmClear) setCart([]);
// // // //   };

// // // //   // ------------------ JSX ------------------

// // // //   return (
// // // //     <div className="p-6">
// // // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // // //         {/* Left Side */}
// // // //         <div className="space-y-6">
// // // //           <h1 className="text-3xl font-bold text-foreground">
// // // //             Sales Management
// // // //           </h1>

// // // //           {/* Medicine Search */}
// // // //           <div className="medical-card p-4">
// // // //             <h3 className="font-semibold text-foreground mb-3">
// // // //               Add Medicine to Cart
// // // //             </h3>
// // // //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// // // //           </div>

// // // //           {/* Shopping Cart */}
// // // //           <div className="medical-card">
// // // //             <div className="p-4 border-b border-border flex items-center justify-between">
// // // //               <h3 className="font-semibold text-foreground">Shopping Cart</h3>
// // // //               <ShoppingCart className="w-5 h-5 text-primary" />
// // // //             </div>
// // // //             <div className="p-4">
// // // //               {cart.length > 0 ? (
// // // //                 <>
// // // //                   {cart.map((item) => (
// // // //                     <div
// // // //                       key={item.medicineId}
// // // //                       className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
// // // //                     >
// // // //                       <div className="flex-1">
// // // //                         <h4 className="font-medium text-foreground">
// // // //                           {item.medicineName}
// // // //                         </h4>
// // // //                         <p className="text-sm text-muted-foreground">
// // // //                           PKR {item.price} each
// // // //                         </p>
// // // //                       </div>
// // // //                       <div className="flex items-center space-x-2">
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={() =>
// // // //                             updateQuantity(item.medicineId, item.quantity - 1)
// // // //                           }
// // // //                         >
// // // //                           <Minus className="w-3 h-3" />
// // // //                         </Button>
// // // //                         <span className="w-8 text-center font-medium">
// // // //                           {item.quantity}
// // // //                         </span>
// // // //                         <Button
// // // //                           variant="outline"
// // // //                           size="sm"
// // // //                           onClick={() =>
// // // //                             updateQuantity(item.medicineId, item.quantity + 1)
// // // //                           }
// // // //                         >
// // // //                           <Plus className="w-3 h-3" />
// // // //                         </Button>
// // // //                       </div>
// // // //                       <div className="text-right ml-4">
// // // //                         <p className="font-medium text-foreground">
// // // //                           PKR {(item.price * item.quantity).toFixed(2)}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   ))}

// // // //                   <div className="border-t border-border pt-3 mt-4">
// // // //                     <div className="flex justify-between items-center mb-2">
// // // //                       <span className="text-muted-foreground">Subtotal:</span>
// // // //                       <span className="font-medium text-foreground">
// // // //                         PKR {getTotalAmount().toFixed(2)}
// // // //                       </span>
// // // //                     </div>
// // // //                     <div className="flex justify-between items-center mb-4">
// // // //                       <span className="text-muted-foreground">Profit:</span>
// // // //                       <span className="font-medium text-success">
// // // //                         PKR {getTotalProfit().toFixed(2)}
// // // //                       </span>
// // // //                     </div>
// // // //                     <div className="flex space-x-3">
// // // //                       <Button onClick={processSale} className="flex-1 gap-2">
// // // //                         <Receipt className="w-4 h-4" /> Process Sale
// // // //                       </Button>
// // // //                       <Button
// // // //                         variant="outline"
// // // //                         className="gap-2"
// // // //                         onClick={handleReturn}
// // // //                       >
// // // //                         <RotateCcw className="w-4 h-4" /> Return
// // // //                       </Button>
// // // //                     </div>
// // // //                   </div>
// // // //                 </>
// // // //               ) : (
// // // //                 <div className="text-center py-8">
// // // //                   <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
// // // //                   <p className="text-muted-foreground">Your cart is empty</p>
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         {/* Right Side - Today's Sales, Prescriptions & Recent Sales */}
// // // //         <div className="space-y-6">
// // // //           <h2 className="text-2xl font-bold text-foreground">
// // // //             Today's Sales Summary
// // // //           </h2>

// // // //           <div className="grid grid-cols-2 gap-4">
// // // //             <div className="stats-card-primary p-4">
// // // //               <p className="text-sm font-medium text-primary/70">Total Sales</p>
// // // //               <h3 className="text-xl font-bold text-primary">
// // // //                 PKR{" "}
// // // //                 {todaysSales
// // // //                   .reduce((sum, sale) => sum + (sale.amount ?? 0), 0)
// // // //                   .toFixed(2)}
// // // //               </h3>
// // // //             </div>
// // // //             <div className="stats-card-success p-4">
// // // //               <p className="text-sm font-medium text-success/70">
// // // //                 Total Profit
// // // //               </p>
// // // //               <h3 className="text-xl font-bold text-success">
// // // //                 PKR{" "}
// // // //                 {todaysSales
// // // //                   .reduce((sum, sale) => sum + (sale.profit ?? 0), 0)
// // // //                   .toFixed(2)}
// // // //               </h3>
// // // //             </div>
// // // //           </div>

// // // //           {/* Prescribed Section (A: below Today's Sales Summary) */}
// // // //           <div className="medical-card">
// // // //             <div className="p-4 border-b border-border flex items-center justify-between">
// // // //               <h3 className="font-semibold text-foreground">Prescriptions</h3>
// // // //             </div>

// // // //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto pr-2">
// // // //               {prescriptions.length === 0 ? (
// // // //                 <p className="text-muted-foreground">No prescriptions found.</p>
// // // //               ) : (
// // // //                 prescriptions.map((pres) => (
// // // //                   <div
// // // //                     key={pres.id}
// // // //                     className="p-3 bg-accent/20 rounded-lg flex items-center justify-between"
// // // //                   >
// // // //                     <div>
// // // //                       <p className="font-medium text-foreground">
// // // //                         {pres.patient?.name ?? "Unknown Patient"}
// // // //                       </p>
// // // //                       <p className="text-sm text-muted-foreground">
// // // //                         Doctor: {pres.patient?.referringDoctor ?? "-"} •{" "}
// // // //                         PKR {(pres.totalRetail ?? 0).toFixed(2)}
// // // //                       </p>
// // // //                     </div>

// // // //                     <div className="flex items-center gap-2">
// // // //                     <Button
// // // //   size="sm"
// // // //   onClick={() => {
// // // //     if (!pres.prescription || pres.prescription.length === 0) {
// // // //       toast({
// // // //         title: "Empty prescription",
// // // //         description: "This prescription has no medicines.",
// // // //         variant: "destructive",
// // // //       });
// // // //       return;
// // // //     }
// // // //     addMultipleToCart(pres.prescription);
// // // //     setActivePrescriptionId(pres.id); // ✅ remember which prescription was loaded
// // // //     toast({
// // // //       title: "Prescription loaded",
// // // //       description: "All medicines added to cart.",
// // // //       variant: "default",
// // // //     });
// // // //   }}
// // // // >
// // // //   Add to Cart
// // // // </Button>

// // // //                     </div>
// // // //                   </div>
// // // //                 ))
// // // //               )}
// // // //             </div>
// // // //           </div>

// // // //           {/* Recent Sales (scrollable area on the right) */}
// // // //           <div className="medical-card">
// // // //             <div className="p-4 border-b border-border">
// // // //               <h3 className="font-semibold text-foreground">Recent Sales</h3>
// // // //             </div>

// // // //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto pr-2">
// // // //               {todaysSales.length === 0 ? (
// // // //                 <p className="text-muted-foreground">No sales yet today.</p>
// // // //               ) : (
// // // //                 todaysSales.map((sale) => (
// // // //                   <div key={sale.id} className="p-3 bg-accent/20 rounded-lg">
// // // //                     <div className="flex justify-between items-start mb-2">
// // // //                       <div>
// // // //                         <p className="font-medium text-foreground">
// // // //                           {sale.medicineName}
// // // //                         </p>
// // // //                         <p className="text-sm text-muted-foreground">
// // // //                           {sale.timestamp
// // // //                             ? sale.timestamp.toDate().toLocaleTimeString()
// // // //                             : ""}
// // // //                         </p>
// // // //                       </div>
// // // //                       <div className="text-right">
// // // //                         <p className="font-medium text-foreground">
// // // //                           PKR {Number(sale.amount).toFixed(2)}
// // // //                         </p>
// // // //                         <p className="text-sm text-success">
// // // //                           Profit: PKR {Number(sale.profit).toFixed(2)}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                     <div className="flex justify-between items-center">
// // // //                       <span className="text-sm text-muted-foreground">
// // // //                         Qty: {sale.quantity}
// // // //                       </span>
// // // //                       <Button
// // // //                         variant="destructive"
// // // //                         size="sm"
// // // //                         onClick={() => reverseSale(sale)}
// // // //                         className="gap-1"
// // // //                       >
// // // //                         <RotateCcw className="w-4 h-4" /> Reverse
// // // //                       </Button>
// // // //                     </div>
// // // //                   </div>
// // // //                 ))
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // "use client";

// // // import { useState, useEffect } from "react";
// // // import {
// // //   ShoppingCart,
// // //   Plus,
// // //   Minus,
// // //   Receipt,
// // //   RotateCcw,
// // //   FileDown, // for PDF button
// // // } from "lucide-react";
// // // import { Button } from "@/components/ui/button";
// // // import { SearchBar } from "@/components/SearchBar";
// // // import { db } from "@/firebase";
// // // import {
// // //   collection,
// // //   addDoc,
// // //   getDocs,
// // //   query,
// // //   where,
// // //   Timestamp,
// // //   doc,
// // //   updateDoc,
// // //   deleteDoc,
// // //   getDoc,
// // //   DocumentData,
// // //   QueryDocumentSnapshot,
// // //   orderBy,
// // //   limit,
// // // } from "firebase/firestore";
// // // import { useToast } from "@/hooks/use-toast";
// // // import generateSalePDF from "@/components/SalePDF"; // PDF generator component

// // // // ------------------ TYPES ------------------

// // // export interface Medicine {
// // //   id: string;
// // //   name: string;
// // //   costPrice: number;
// // //   retailPrice: number;
// // //   quantity: number;
// // //   createdAt?: Timestamp;
// // //   updatedAt?: Timestamp;
// // // }

// // // export interface CartItem {
// // //   medicineId: string;
// // //   medicineName: string;
// // //   quantity: number;
// // //   price: number;
// // //   cost: number;
// // //   medicine: Medicine;
// // // }

// // // interface Sale {
// // //   id: string;
// // //   amount: number;
// // //   profit: number;
// // //   date: string;
// // //   timestamp: Timestamp;
// // //   medicineId: string;
// // //   medicineName: string;
// // //   quantity: number;
// // //   costPrice: number;
// // //   retailPrice: number;
// // // }

// // // interface PrescriptionDoc {
// // //   id: string;
// // //   patient?: { name?: string; referringDoctor?: string; [k: string]: any };
// // //   prescription?: Array<{
// // //     id?: string;
// // //     name?: string;
// // //     qty?: number;
// // //     retail_price?: number;
// // //     cost_price?: number;
// // //     dosage?: string;
// // //     instructions?: string;
// // //     [k: string]: any;
// // //   }>;
// // //   totalItems?: number;
// // //   totalRetail?: number;
// // //   timestamp?: string | any;
// // // }

// // // // ------------------ COMPONENT ------------------

// // // export default function Sales() {
// // //   const [cart, setCart] = useState<CartItem[]>([]);
// // //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// // //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// // //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
// // //   const { toast } = useToast();

// // //   // Fetch today's sales
// // //   useEffect(() => {
// // //     const fetchSales = async () => {
// // //       try {
// // //         const today = new Date().toISOString().split("T")[0];
// // //         const q = query(collection(db, "sales"), where("date", "==", today));
// // //         const snapshot = await getDocs(q);

// // //         const salesData: Sale[] = snapshot.docs.map(
// // //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// // //             const data = doc.data();
// // //             let timestamp: Timestamp;
// // //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// // //               timestamp = data.timestamp;
// // //             } else if (data.timestamp) {
// // //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// // //             } else {
// // //               timestamp = Timestamp.now();
// // //             }
// // //             return {
// // //               id: doc.id,
// // //               amount: Number(data.amount ?? 0),
// // //               profit: Number(data.profit ?? 0),
// // //               date: data.date ?? "",
// // //               timestamp,
// // //               medicineId: data.medicine_id,
// // //               medicineName: data.medicine_name,
// // //               quantity: Number(data.quantity ?? 0),
// // //               costPrice: Number(data.cost_price ?? 0),
// // //               retailPrice: Number(data.retail_price ?? 0),
// // //             };
// // //           }
// // //         );
// // //         setTodaysSales(salesData);
// // //       } catch (err) {
// // //         console.error("Error fetching today's sales:", err);
// // //       }
// // //     };
// // //     fetchSales();
// // //   }, []);

// // //   // Fetch prescriptions (latest 50)
// // //   useEffect(() => {
// // //     const fetchPrescriptions = async () => {
// // //       try {
// // //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// // //         const snap = await getDocs(q);
// // //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// // //           const data = d.data();
// // //           return {
// // //             id: d.id,
// // //             patient: data.patient,
// // //             prescription: data.prescription || data.prescribed || [],
// // //             totalItems: data.totalItems,
// // //             totalRetail: data.totalRetail,
// // //             timestamp: data.timestamp,
// // //           };
// // //         });
// // //         setPrescriptions(docs);
// // //       } catch (err) {
// // //         console.error("Error fetching prescriptions:", err);
// // //       }
// // //     };
// // //     fetchPrescriptions();
// // //   }, []);

// // //   // Add single medicine
// // //   const addToCart = (medicine: any, quantity: number = 1) => {
// // //     const normalizedMedicine: Medicine = {
// // //       id: medicine.id,
// // //       name: medicine.name,
// // //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// // //       retailPrice: Number(
// // //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// // //       ),
// // //       quantity: Number(medicine.quantity ?? 0),
// // //       createdAt: medicine.created_at,
// // //       updatedAt: medicine.updated_at,
// // //     };

// // //     const existingItem = cart.find(
// // //       (item) => item.medicineId === normalizedMedicine.id
// // //     );
// // //     if (existingItem) {
// // //       setCart(
// // //         cart.map((item) =>
// // //           item.medicineId === normalizedMedicine.id
// // //             ? { ...item, quantity: item.quantity + quantity }
// // //             : item
// // //         )
// // //       );
// // //     } else {
// // //       const newItem: CartItem = {
// // //         medicineId: normalizedMedicine.id,
// // //         medicineName: normalizedMedicine.name,
// // //         quantity,
// // //         price: normalizedMedicine.retailPrice,
// // //         cost: normalizedMedicine.costPrice,
// // //         medicine: normalizedMedicine,
// // //       };
// // //       setCart((prev) => [...prev, newItem]);
// // //     }
// // //   };

// // //   // Add all medicines from a prescription
// // //   const addMultipleToCart = (items: {
// // //     id?: string;
// // //     name?: string;
// // //     qty?: number;
// // //     retail_price?: number;
// // //     cost_price?: number;
// // //   }[]) => {
// // //     for (const it of items) {
// // //       const medObj = {
// // //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// // //         name: it.name || "Unnamed",
// // //         cost_price: it.cost_price ?? 0,
// // //         retail_price: it.retail_price ?? 0,
// // //         quantity: it.qty ?? 1,
// // //       };
// // //       addToCart(medObj, medObj.quantity);
// // //     }
// // //   };

// // //   // Update quantity
// // //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// // //     if (newQuantity <= 0) {
// // //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// // //     } else {
// // //       setCart(
// // //         cart.map((item) =>
// // //           item.medicineId === medicineId
// // //             ? { ...item, quantity: newQuantity }
// // //             : item
// // //         )
// // //       );
// // //     }
// // //   };

// // //   // Totals
// // //   const getTotalAmount = () =>
// // //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
// // //   const getTotalProfit = () =>
// // //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// // //   // ------------------ PROCESS SALE ------------------
// // //   const processSale = async () => {
// // //     if (cart.length === 0) return;

// // //     try {
// // //       for (const item of cart) {
// // //         const amount = item.price * item.quantity;
// // //         const profit = (item.price - item.cost) * item.quantity;

// // //         const saleDoc = {
// // //           amount,
// // //           profit,
// // //           date: new Date().toISOString().split("T")[0],
// // //           timestamp: Timestamp.now(),
// // //           medicine_id: item.medicineId,
// // //           medicine_name: item.medicineName,
// // //           quantity: item.quantity,
// // //           cost_price: item.cost,
// // //           retail_price: item.price,
// // //         };

// // //         await addDoc(collection(db, "sales"), saleDoc);

// // //         const medicineRef = doc(db, "medicines", item.medicineId);
// // //         const medicineSnap = await getDoc(medicineRef);
// // //         if (medicineSnap.exists()) {
// // //           const currentQty = medicineSnap.data().quantity ?? 0;
// // //           await updateDoc(medicineRef, {
// // //             quantity: Math.max(0, currentQty - item.quantity),
// // //           });
// // //         }
// // //       }

// // //       setCart([]);

// // //       if (activePrescriptionId) {
// // //         try {
// // //           await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// // //           setPrescriptions((prev) => prev.filter((p) => p.id !== activePrescriptionId));
// // //           setActivePrescriptionId(null);
// // //         } catch (err) {
// // //           console.error("Failed to delete prescription:", err);
// // //         }
// // //       }

// // //       toast({
// // //         title: "Sale processed",
// // //         description: "Sale saved and stock updated.",
// // //         variant: "default",
// // //       });

// // //       const today = new Date().toISOString().split("T")[0];
// // //       const q = query(collection(db, "sales"), where("date", "==", today));
// // //       const snapshot = await getDocs(q);
// // //       const salesData: Sale[] = snapshot.docs.map((doc) => {
// // //         const data = doc.data();
// // //         return {
// // //           id: doc.id,
// // //           amount: Number(data.amount ?? 0),
// // //           profit: Number(data.profit ?? 0),
// // //           date: data.date ?? "",
// // //           timestamp: data.timestamp,
// // //           medicineId: data.medicine_id,
// // //           medicineName: data.medicine_name,
// // //           quantity: Number(data.quantity ?? 0),
// // //           costPrice: Number(data.cost_price ?? 0),
// // //           retailPrice: Number(data.retail_price ?? 0),
// // //         };
// // //       });
// // //       setTodaysSales(salesData);
// // //     } catch (err) {
// // //       console.error("Error processing sale:", err);
// // //       toast({
// // //         title: "Error",
// // //         description: "Failed to process sale. Check console.",
// // //         variant: "destructive",
// // //       });
// // //     }
// // //   };

// // //   // Process sale & print PDF
// // //   const handleProcessSaleWithPDF = async () => {
// // //     await processSale();
// // //     generateSalePDF(cart);
// // //   };

// // //   // Reverse sale
// // //   const reverseSale = async (sale: Sale) => {
// // //     try {
// // //       const medicineRef = doc(db, "medicines", sale.medicineId);
// // //       const medicineSnap = await getDoc(medicineRef);

// // //       if (!medicineSnap.exists()) return;

// // //       const currentQty = medicineSnap.data().quantity ?? 0;
// // //       await updateDoc(medicineRef, {
// // //         quantity: currentQty + sale.quantity,
// // //       });

// // //       await deleteDoc(doc(db, "sales", sale.id));
// // //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// // //       toast({
// // //         title: "Sale reversed",
// // //         description: "Sale removed and stock updated.",
// // //         variant: "default",
// // //       });
// // //     } catch (err) {
// // //       console.error("Error reversing sale:", err);
// // //       toast({
// // //         title: "Error",
// // //         description: "Failed to reverse sale.",
// // //         variant: "destructive",
// // //       });
// // //     }
// // //   };

// // //   // Clear cart
// // //   const handleReturn = () => {
// // //     if (cart.length === 0) return;
// // //     const confirmClear = window.confirm("Remove all medicines from cart?");
// // //     if (confirmClear) setCart([]);
// // //   };

// // //   // ------------------ JSX ------------------

// // //   return (
// // //     <div className="p-6">
// // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // //         {/* Left Side */}
// // //         <div className="space-y-6">
// // //           <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>

// // //           {/* Medicine Search */}
// // //           <div className="medical-card p-4">
// // //             <h3 className="font-semibold mb-3">Add Medicine to Cart</h3>
// // //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// // //           </div>

// // //           {/* Shopping Cart */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b flex justify-between">
// // //               <h3 className="font-semibold">Shopping Cart</h3>
// // //               <ShoppingCart className="w-5 h-5 text-primary" />
// // //             </div>

// // //             <div className="p-4">
// // //               {cart.length > 0 ? (
// // //                 <>
// // //                   {cart.map((item) => (
// // //                     <div
// // //                       key={item.medicineId}
// // //                       className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
// // //                     >
// // //                       <div className="flex-1">
// // //                         <h4 className="font-medium">{item.medicineName}</h4>
// // //                         <p className="text-sm text-muted-foreground">
// // //                           PKR {item.price} each
// // //                         </p>
// // //                       </div>
// // //                       <div className="flex items-center space-x-2">
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={() =>
// // //                             updateQuantity(item.medicineId, item.quantity - 1)
// // //                           }
// // //                         >
// // //                           <Minus className="w-3 h-3" />
// // //                         </Button>
// // //                         <span className="w-8 text-center">{item.quantity}</span>
// // //                         <Button
// // //                           variant="outline"
// // //                           size="sm"
// // //                           onClick={() =>
// // //                             updateQuantity(item.medicineId, item.quantity + 1)
// // //                           }
// // //                         >
// // //                           <Plus className="w-3 h-3" />
// // //                         </Button>
// // //                       </div>
// // //                       <div className="text-right ml-4">
// // //                         <p className="font-medium">
// // //                           PKR {(item.price * item.quantity).toFixed(2)}
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                   ))}

// // //                   <div className="border-t pt-3 mt-4">
// // //                     <div className="flex justify-between mb-2">
// // //                       <span>Subtotal:</span>
// // //                       <span>PKR {getTotalAmount().toFixed(2)}</span>
// // //                     </div>
// // //                     <div className="flex justify-between mb-4">
// // //                       <span>Profit:</span>
// // //                       <span className="text-success">
// // //                         PKR {getTotalProfit().toFixed(2)}
// // //                       </span>
// // //                     </div>

// // //                     {/* Conditional buttons */}
// // //                     {activePrescriptionId ? (
// // //                       <div className="flex space-x-3">
// // //                         <Button onClick={processSale} className="flex-1 gap-2">
// // //                           <Receipt className="w-4 h-4" /> Process Sale
// // //                         </Button>
// // //                         <Button
// // //                           onClick={handleProcessSaleWithPDF}
// // //                           className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
// // //                         >
// // //                           <FileDown className="w-4 h-4" /> Process & Print PDF
// // //                         </Button>
// // //                         <Button variant="outline" onClick={handleReturn}>
// // //                           <RotateCcw className="w-4 h-4" /> Return
// // //                         </Button>
// // //                       </div>
// // //                     ) : (
// // //                       <div className="flex space-x-3">
// // //                         <Button onClick={processSale} className="flex-1 gap-2">
// // //                           <Receipt className="w-4 h-4" /> Process Sale
// // //                         </Button>
// // //                         <Button variant="outline" onClick={handleReturn}>
// // //                           <RotateCcw className="w-4 h-4" /> Return
// // //                         </Button>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </>
// // //               ) : (
// // //                 <div className="text-center py-8">
// // //                   <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
// // //                   <p>Your cart is empty</p>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Right Side */}
// // //         <div className="space-y-6">
// // //           <h2 className="text-2xl font-bold">Today's Sales Summary</h2>

// // //           <div className="grid grid-cols-2 gap-4">
// // //             <div className="stats-card-primary p-4">
// // //               <p>Total Sales</p>
// // //               <h3 className="text-xl font-bold">
// // //                 PKR{" "}
// // //                 {todaysSales
// // //                   .reduce((sum, s) => sum + (s.amount ?? 0), 0)
// // //                   .toFixed(2)}
// // //               </h3>
// // //             </div>
// // //             <div className="stats-card-success p-4">
// // //               <p>Total Profit</p>
// // //               <h3 className="text-xl font-bold text-success">
// // //                 PKR{" "}
// // //                 {todaysSales
// // //                   .reduce((sum, s) => sum + (s.profit ?? 0), 0)
// // //                   .toFixed(2)}
// // //               </h3>
// // //             </div>
// // //           </div>

// // //           {/* Prescriptions */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b flex justify-between">
// // //               <h3 className="font-semibold">Prescriptions</h3>
// // //             </div>
// // //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
// // //               {prescriptions.length === 0 ? (
// // //                 <p>No prescriptions found.</p>
// // //               ) : (
// // //                 prescriptions.map((pres) => (
// // //                   <div
// // //                     key={pres.id}
// // //                     className="p-3 bg-accent/20 rounded-lg flex justify-between"
// // //                   >
// // //                     <div>
// // //                       <p className="font-medium">
// // //                         {pres.patient?.name ?? "Unknown Patient"}
// // //                       </p>
// // //                       <p className="text-sm text-muted-foreground">
// // //                         Doctor: {pres.patient?.referringDoctor ?? "-"} • PKR{" "}
// // //                         {(pres.totalRetail ?? 0).toFixed(2)}
// // //                       </p>
// // //                     </div>
// // //                     <Button
// // //                       size="sm"
// // //                       onClick={() => {
// // //                         if (!pres.prescription || pres.prescription.length === 0) {
// // //                           toast({
// // //                             title: "Empty prescription",
// // //                             description: "This prescription has no medicines.",
// // //                             variant: "destructive",
// // //                           });
// // //                           return;
// // //                         }
// // //                         addMultipleToCart(pres.prescription);
// // //                         setActivePrescriptionId(pres.id);
// // //                         toast({
// // //                           title: "Prescription loaded",
// // //                           description: "All medicines added to cart.",
// // //                         });
// // //                       }}
// // //                     >
// // //                       Add to Cart
// // //                     </Button>
// // //                   </div>
// // //                 ))
// // //               )}
// // //             </div>
// // //           </div>

// // //           {/* Recent Sales */}
// // //           <div className="medical-card">
// // //             <div className="p-4 border-b">
// // //               <h3 className="font-semibold">Recent Sales</h3>
// // //             </div>
// // //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
// // //               {todaysSales.length === 0 ? (
// // //                 <p>No sales yet today.</p>
// // //               ) : (
// // //                 todaysSales.map((s) => (
// // //                   <div
// // //                     key={s.id}
// // //                     className="flex justify-between items-center p-2 bg-accent/30 rounded-lg"
// // //                   >
// // //                     <div>
// // //                       <p className="font-medium">{s.medicineName}</p>
// // //                       <p className="text-sm text-muted-foreground">
// // //                         {s.quantity} × PKR {s.retailPrice} = PKR {s.amount}
// // //                       </p>
// // //                     </div>
// // //                     <Button
// // //                       size="sm"
// // //                       variant="destructive"
// // //                       onClick={() => reverseSale(s)}
// // //                     >
// // //                       Reverse
// // //                     </Button>
// // //                   </div>
// // //                 ))
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import {
// //   ShoppingCart,
// //   Plus,
// //   Minus,
// //   Receipt,
// //   RotateCcw,
// //   FileDown,
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { SearchBar } from "@/components/SearchBar";
// // import { db } from "@/firebase";
// // import {
// //   collection,
// //   addDoc,
// //   getDocs,
// //   query,
// //   where,
// //   Timestamp,
// //   doc,
// //   updateDoc,
// //   deleteDoc,
// //   getDoc,
// //   DocumentData,
// //   QueryDocumentSnapshot,
// //   orderBy,
// //   limit,
// // } from "firebase/firestore";
// // import { useToast } from "@/hooks/use-toast";
// // import generateSalePDF from "@/components/SalePDF";

// // // ------------------ TYPES ------------------

// // export interface Medicine {
// //   id: string;
// //   name: string;
// //   costPrice: number;
// //   retailPrice: number;
// //   quantity: number;
// //   createdAt?: Timestamp;
// //   updatedAt?: Timestamp;
// // }

// // export interface CartItem {
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   price: number;
// //   cost: number;
// //   medicine: Medicine;
// //   dosage?: string;
// //   instructions?: string;
// // }

// // interface Sale {
// //   id: string;
// //   amount: number;
// //   profit: number;
// //   date: string;
// //   timestamp: Timestamp;
// //   medicineId: string;
// //   medicineName: string;
// //   quantity: number;
// //   costPrice: number;
// //   retailPrice: number;
// // }

// // interface PatientData {
// //   name?: string;
// //   referringDoctor?: string;
// //   age?: string;
// //   gender?: string;
// //   phone?: string;
// //   [k: string]: any;
// // }

// // interface PrescriptionDoc {
// //   id: string;
// //   patient?: PatientData;
// //   prescription?: Array<{
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //     dosage?: string;
// //     instructions?: string;
// //     [k: string]: any;
// //   }>;
// //   totalItems?: number;
// //   totalRetail?: number;
// //   timestamp?: string | any;
// // }

// // // ------------------ COMPONENT ------------------

// // export default function Sales() {
// //   const [cart, setCart] = useState<CartItem[]>([]);
// //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
// //   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
// //   const [activePatient, setActivePatient] = useState<PatientData | null>(null);
// //   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
// //   const { toast } = useToast();

// //   // Fetch today's sales
// //   useEffect(() => {
// //     const fetchSales = async () => {
// //       try {
// //         const today = new Date().toISOString().split("T")[0];
// //         const q = query(collection(db, "sales"), where("date", "==", today));
// //         const snapshot = await getDocs(q);

// //         const salesData: Sale[] = snapshot.docs.map(
// //           (doc: QueryDocumentSnapshot<DocumentData>) => {
// //             const data = doc.data();
// //             let timestamp: Timestamp;
// //             if (data.timestamp && typeof data.timestamp.toDate === "function") {
// //               timestamp = data.timestamp;
// //             } else if (data.timestamp) {
// //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// //             } else {
// //               timestamp = Timestamp.now();
// //             }
// //             return {
// //               id: doc.id,
// //               amount: Number(data.amount ?? 0),
// //               profit: Number(data.profit ?? 0),
// //               date: data.date ?? "",
// //               timestamp,
// //               medicineId: data.medicine_id,
// //               medicineName: data.medicine_name,
// //               quantity: Number(data.quantity ?? 0),
// //               costPrice: Number(data.cost_price ?? 0),
// //               retailPrice: Number(data.retail_price ?? 0),
// //             };
// //           }
// //         );
// //         setTodaysSales(salesData);
// //       } catch (err) {
// //         console.error("Error fetching today's sales:", err);
// //       }
// //     };
// //     fetchSales();
// //   }, []);

// //   // Fetch prescriptions (latest 50)
// //   useEffect(() => {
// //     const fetchPrescriptions = async () => {
// //       try {
// //         const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
// //         const snap = await getDocs(q);
// //         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
// //           const data = d.data();
// //           return {
// //             id: d.id,
// //             patient: data.patient,
// //             prescription: data.prescription || data.prescribed || [],
// //             totalItems: data.totalItems,
// //             totalRetail: data.totalRetail,
// //             timestamp: data.timestamp,
// //           };
// //         });
// //         setPrescriptions(docs);
// //       } catch (err) {
// //         console.error("Error fetching prescriptions:", err);
// //       }
// //     };
// //     fetchPrescriptions();
// //   }, []);

// //   // Add single medicine
// //   const addToCart = (medicine: any, quantity: number = 1, dosage?: string, instructions?: string) => {
// //     const normalizedMedicine: Medicine = {
// //       id: medicine.id,
// //       name: medicine.name,
// //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// //       retailPrice: Number(
// //         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
// //       ),
// //       quantity: Number(medicine.quantity ?? 0),
// //       createdAt: medicine.created_at,
// //       updatedAt: medicine.updated_at,
// //     };

// //     const existingItem = cart.find(
// //       (item) => item.medicineId === normalizedMedicine.id
// //     );
// //     if (existingItem) {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === normalizedMedicine.id
// //             ? { ...item, quantity: item.quantity + quantity }
// //             : item
// //         )
// //       );
// //     } else {
// //       const newItem: CartItem = {
// //         medicineId: normalizedMedicine.id,
// //         medicineName: normalizedMedicine.name,
// //         quantity,
// //         price: normalizedMedicine.retailPrice,
// //         cost: normalizedMedicine.costPrice,
// //         medicine: normalizedMedicine,
// //         dosage: dosage || undefined,
// //         instructions: instructions || undefined,
// //       };
// //       setCart((prev) => [...prev, newItem]);
// //     }
// //   };

// //   // Add all medicines from a prescription
// //   const addMultipleToCart = (items: {
// //     id?: string;
// //     name?: string;
// //     qty?: number;
// //     retail_price?: number;
// //     cost_price?: number;
// //     dosage?: string;
// //     instructions?: string;
// //   }[]) => {
// //     for (const it of items) {
// //       const medObj = {
// //         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
// //         name: it.name || "Unnamed",
// //         cost_price: it.cost_price ?? 0,
// //         retail_price: it.retail_price ?? 0,
// //         quantity: it.qty ?? 1,
// //       };
// //       addToCart(medObj, medObj.quantity, it.dosage, it.instructions);
// //     }
// //   };

// //   // Update quantity
// //   const updateQuantity = (medicineId: string, newQuantity: number) => {
// //     if (newQuantity <= 0) {
// //       setCart(cart.filter((item) => item.medicineId !== medicineId));
// //     } else {
// //       setCart(
// //         cart.map((item) =>
// //           item.medicineId === medicineId
// //             ? { ...item, quantity: newQuantity }
// //             : item
// //         )
// //       );
// //     }
// //   };

// //   // Totals
// //   const getTotalAmount = () =>
// //     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
// //   const getTotalProfit = () =>
// //     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

// //   // ------------------ PROCESS SALE ------------------
// //   const processSale = async () => {
// //     if (cart.length === 0) return;

// //     try {
// //       for (const item of cart) {
// //         const amount = item.price * item.quantity;
// //         const profit = (item.price - item.cost) * item.quantity;

// //         const saleDoc = {
// //           amount,
// //           profit,
// //           date: new Date().toISOString().split("T")[0],
// //           timestamp: Timestamp.now(),
// //           medicine_id: item.medicineId,
// //           medicine_name: item.medicineName,
// //           quantity: item.quantity,
// //           cost_price: item.cost,
// //           retail_price: item.price,
// //         };

// //         await addDoc(collection(db, "sales"), saleDoc);

// //         const medicineRef = doc(db, "medicines", item.medicineId);
// //         const medicineSnap = await getDoc(medicineRef);
// //         if (medicineSnap.exists()) {
// //           const currentQty = medicineSnap.data().quantity ?? 0;
// //           await updateDoc(medicineRef, {
// //             quantity: Math.max(0, currentQty - item.quantity),
// //           });
// //         }
// //       }

// //       setCart([]);
// //       setActivePatient(null);

// //       if (activePrescriptionId) {
// //         try {
// //           await deleteDoc(doc(db, "prescriptions", activePrescriptionId));
// //           setPrescriptions((prev) => prev.filter((p) => p.id !== activePrescriptionId));
// //           setActivePrescriptionId(null);
// //         } catch (err) {
// //           console.error("Failed to delete prescription:", err);
// //         }
// //       }

// //       toast({
// //         title: "Sale processed",
// //         description: "Sale saved and stock updated.",
// //         variant: "default",
// //       });

// //       const today = new Date().toISOString().split("T")[0];
// //       const q = query(collection(db, "sales"), where("date", "==", today));
// //       const snapshot = await getDocs(q);
// //       const salesData: Sale[] = snapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           id: doc.id,
// //           amount: Number(data.amount ?? 0),
// //           profit: Number(data.profit ?? 0),
// //           date: data.date ?? "",
// //           timestamp: data.timestamp,
// //           medicineId: data.medicine_id,
// //           medicineName: data.medicine_name,
// //           quantity: Number(data.quantity ?? 0),
// //           costPrice: Number(data.cost_price ?? 0),
// //           retailPrice: Number(data.retail_price ?? 0),
// //         };
// //       });
// //       setTodaysSales(salesData);
// //     } catch (err) {
// //       console.error("Error processing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to process sale. Check console.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Process sale & print PDF
// //   const handleProcessSaleWithPDF = async () => {
// //     if (cart.length === 0) return;
    
// //     try {
// //       // IMPORTANT: Generate PDF FIRST (before cart is cleared)
// //       console.log("Generating PDF with cart items:", cart.length);
// //       console.log("Patient data:", activePatient);
      
// //       await generateSalePDF({
// //         cart: cart,
// //         patient: activePatient || undefined,
// //       });
      
// //       console.log("PDF generation completed");
      
// //       // Small delay to ensure PDF download starts
// //       await new Promise(resolve => setTimeout(resolve, 500));
      
// //       // Then process the sale (this clears the cart)
// //       await processSale();
      
// //       toast({
// //         title: "PDF Generated",
// //         description: "Receipt PDF has been downloaded successfully.",
// //         variant: "default",
// //       });
// //     } catch (error) {
// //       console.error("Error in PDF generation:", error);
// //       toast({
// //         title: "PDF Error",
// //         description: "Failed to generate PDF. Check console for details.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Reverse sale
// //   const reverseSale = async (sale: Sale) => {
// //     try {
// //       const medicineRef = doc(db, "medicines", sale.medicineId);
// //       const medicineSnap = await getDoc(medicineRef);

// //       if (!medicineSnap.exists()) return;

// //       const currentQty = medicineSnap.data().quantity ?? 0;
// //       await updateDoc(medicineRef, {
// //         quantity: currentQty + sale.quantity,
// //       });

// //       await deleteDoc(doc(db, "sales", sale.id));
// //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

// //       toast({
// //         title: "Sale reversed",
// //         description: "Sale removed and stock updated.",
// //         variant: "default",
// //       });
// //     } catch (err) {
// //       console.error("Error reversing sale:", err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to reverse sale.",
// //         variant: "destructive",
// //       });
// //     }
// //   };

// //   // Clear cart
// //   const handleReturn = () => {
// //     if (cart.length === 0) return;
// //     const confirmClear = window.confirm("Remove all medicines from cart?");
// //     if (confirmClear) {
// //       setCart([]);
// //       setActivePrescriptionId(null);
// //       setActivePatient(null);
// //     }
// //   };

// //   // ------------------ JSX ------------------

// //   return (
// //     <div className="p-6">
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         {/* Left Side */}
// //         <div className="space-y-6">
// //           <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>

// //           {/* Active Patient Info */}
// //           {activePatient && (
// //             <div className="medical-card p-4 bg-blue-50 dark:bg-blue-950">
// //               <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Active Prescription</h3>
// //               <p className="text-sm"><strong>Patient:</strong> {activePatient.name}</p>
// //               <p className="text-sm"><strong>Doctor:</strong> {activePatient.referringDoctor}</p>
// //               {activePatient.age && <p className="text-sm"><strong>Age:</strong> {activePatient.age}</p>}
// //               {activePatient.gender && <p className="text-sm"><strong>Gender:</strong> {activePatient.gender}</p>}
// //             </div>
// //           )}

// //           {/* Medicine Search */}
// //           <div className="medical-card p-4">
// //             <h3 className="font-semibold mb-3">Add Medicine to Cart</h3>
// //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// //           </div>

// //           {/* Shopping Cart */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Shopping Cart</h3>
// //               <ShoppingCart className="w-5 h-5 text-primary" />
// //             </div>

// //             <div className="p-4">
// //               {cart.length > 0 ? (
// //                 <>
// //                   {cart.map((item) => (
// //                     <div
// //                       key={item.medicineId}
// //                       className="flex flex-col p-3 bg-accent/30 rounded-lg mb-3"
// //                     >
// //                       <div className="flex items-center justify-between">
// //                         <div className="flex-1">
// //                           <h4 className="font-medium">{item.medicineName}</h4>
// //                           <p className="text-sm text-muted-foreground">
// //                             PKR {item.price} each
// //                           </p>
// //                           {item.dosage && (
// //                             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
// //                               <strong>Dosage:</strong> {item.dosage}
// //                             </p>
// //                           )}
// //                           {item.instructions && (
// //                             <p className="text-xs text-green-600 dark:text-green-400">
// //                               <strong>Instructions:</strong> {item.instructions}
// //                             </p>
// //                           )}
// //                         </div>
// //                         <div className="flex items-center space-x-2">
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             onClick={() =>
// //                               updateQuantity(item.medicineId, item.quantity - 1)
// //                             }
// //                           >
// //                             <Minus className="w-3 h-3" />
// //                           </Button>
// //                           <span className="w-8 text-center">{item.quantity}</span>
// //                           <Button
// //                             variant="outline"
// //                             size="sm"
// //                             onClick={() =>
// //                               updateQuantity(item.medicineId, item.quantity + 1)
// //                             }
// //                           >
// //                             <Plus className="w-3 h-3" />
// //                           </Button>
// //                         </div>
// //                         <div className="text-right ml-4">
// //                           <p className="font-medium">
// //                             PKR {(item.price * item.quantity).toFixed(2)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}

// //                   <div className="border-t pt-3 mt-4">
// //                     <div className="flex justify-between mb-2">
// //                       <span>Subtotal:</span>
// //                       <span>PKR {getTotalAmount().toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex justify-between mb-4">
// //                       <span>Profit:</span>
// //                       <span className="text-success">
// //                         PKR {getTotalProfit().toFixed(2)}
// //                       </span>
// //                     </div>

// //                     {/* Conditional buttons */}
// //                     {activePrescriptionId ? (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button
// //                           onClick={handleProcessSaleWithPDF}
// //                           className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
// //                         >
// //                           <FileDown className="w-4 h-4" /> Process & Print PDF
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     ) : (
// //                       <div className="flex space-x-3">
// //                         <Button onClick={processSale} className="flex-1 gap-2">
// //                           <Receipt className="w-4 h-4" /> Process Sale
// //                         </Button>
// //                         <Button variant="outline" onClick={handleReturn}>
// //                           <RotateCcw className="w-4 h-4" /> Return
// //                         </Button>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </>
// //               ) : (
// //                 <div className="text-center py-8">
// //                   <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
// //                   <p>Your cart is empty</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Side */}
// //         <div className="space-y-6">
// //           <h2 className="text-2xl font-bold">Today's Sales Summary</h2>

// //           <div className="grid grid-cols-2 gap-4">
// //             <div className="stats-card-primary p-4">
// //               <p>Total Sales</p>
// //               <h3 className="text-xl font-bold">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.amount ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //             <div className="stats-card-success p-4">
// //               <p>Total Profit</p>
// //               <h3 className="text-xl font-bold text-success">
// //                 PKR{" "}
// //                 {todaysSales
// //                   .reduce((sum, s) => sum + (s.profit ?? 0), 0)
// //                   .toFixed(2)}
// //               </h3>
// //             </div>
// //           </div>

// //           {/* Prescriptions */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b flex justify-between">
// //               <h3 className="font-semibold">Prescriptions</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
// //               {prescriptions.length === 0 ? (
// //                 <p>No prescriptions found.</p>
// //               ) : (
// //                 prescriptions.map((pres) => (
// //                   <div
// //                     key={pres.id}
// //                     className="p-3 bg-accent/20 rounded-lg flex justify-between"
// //                   >
// //                     <div>
// //                       <p className="font-medium">
// //                         {pres.patient?.name ?? "Unknown Patient"}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         Doctor: {pres.patient?.referringDoctor ?? "-"} • PKR{" "}
// //                         {(pres.totalRetail ?? 0).toFixed(2)}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       onClick={() => {
// //                         if (!pres.prescription || pres.prescription.length === 0) {
// //                           toast({
// //                             title: "Empty prescription",
// //                             description: "This prescription has no medicines.",
// //                             variant: "destructive",
// //                           });
// //                           return;
// //                         }
// //                         addMultipleToCart(pres.prescription);
// //                         setActivePrescriptionId(pres.id);
// //                         setActivePatient(pres.patient || null);
// //                         toast({
// //                           title: "Prescription loaded",
// //                           description: "All medicines added to cart.",
// //                         });
// //                       }}
// //                     >
// //                       Add to Cart
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>

// //           {/* Recent Sales */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b">
// //               <h3 className="font-semibold">Recent Sales</h3>
// //             </div>
// //             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
// //               {todaysSales.length === 0 ? (
// //                 <p>No sales yet today.</p>
// //               ) : (
// //                 todaysSales.map((s) => (
// //                   <div
// //                     key={s.id}
// //                     className="flex justify-between items-center p-2 bg-accent/30 rounded-lg"
// //                   >
// //                     <div>
// //                       <p className="font-medium">{s.medicineName}</p>
// //                       <p className="text-sm text-muted-foreground">
// //                         {s.quantity} × PKR {s.retailPrice} = PKR {s.amount}
// //                       </p>
// //                     </div>
// //                     <Button
// //                       size="sm"
// //                       variant="destructive"
// //                       onClick={() => reverseSale(s)}
// //                     >
// //                       Reverse
// //                     </Button>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import {
//   ShoppingCart,
//   Plus,
//   Minus,
//   Receipt,
//   RotateCcw,
//   FileDown,
//   History,
//   X,
//   Search,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { SearchBar } from "@/components/SearchBar";
// import { Input } from "@/components/ui/input";
// import { db } from "@/firebase";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   Timestamp,
//   doc,
//   updateDoc,
//   deleteDoc,
//   getDoc,
//   DocumentData,
//   QueryDocumentSnapshot,
//   orderBy,
//   limit,
// } from "firebase/firestore";
// import { useToast } from "@/hooks/use-toast";
// import generateSalePDF from "@/components/SalePDF";

// // ------------------ TYPES ------------------

// export interface Medicine {
//   id: string;
//   name: string;
//   costPrice: number;
//   retailPrice: number;
//   quantity: number;
//   createdAt?: Timestamp;
//   updatedAt?: Timestamp;
// }

// export interface CartItem {
//   medicineId: string;
//   medicineName: string;
//   quantity: number;
//   price: number;
//   cost: number;
//   medicine: Medicine;
//   dosage?: string;
//   instructions?: string;
// }

// interface Sale {
//   id: string;
//   amount: number;
//   profit: number;
//   date: string;
//   timestamp: Timestamp;
//   medicineId: string;
//   medicineName: string;
//   quantity: number;
//   costPrice: number;
//   retailPrice: number;
// }

// interface PatientData {
//   name?: string;
//   referringDoctor?: string;
//   age?: string;
//   gender?: string;
//   phone?: string;
//   [k: string]: any;
// }

// interface PrescriptionDoc {
//   id: string;
//   patient?: PatientData;
//   prescription?: Array<{
//     id?: string;
//     name?: string;
//     qty?: number;
//     retail_price?: number;
//     cost_price?: number;
//     dosage?: string;
//     instructions?: string;
//     [k: string]: any;
//   }>;
//   totalItems?: number;
//   totalRetail?: number;
//   timestamp?: string | any;
//   processed?: boolean;
//   processedAt?: Timestamp;
// }

// // ------------------ COMPONENT ------------------

// export default function Sales() {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
//   const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
//   const [activePatient, setActivePatient] = useState<PatientData | null>(null);
//   const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
//   const [historyOpen, setHistoryOpen] = useState(false);
//   const [historyPrescriptions, setHistoryPrescriptions] = useState<PrescriptionDoc[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const { toast } = useToast();

//   // Fetch today's sales
//   useEffect(() => {
//     const fetchSales = async () => {
//       try {
//         const today = new Date().toISOString().split("T")[0];
//         const q = query(collection(db, "sales"), where("date", "==", today));
//         const snapshot = await getDocs(q);

//         const salesData: Sale[] = snapshot.docs.map(
//           (doc: QueryDocumentSnapshot<DocumentData>) => {
//             const data = doc.data();
//             let timestamp: Timestamp;
//             if (data.timestamp && typeof data.timestamp.toDate === "function") {
//               timestamp = data.timestamp;
//             } else if (data.timestamp) {
//               timestamp = Timestamp.fromDate(new Date(data.timestamp));
//             } else {
//               timestamp = Timestamp.now();
//             }
//             return {
//               id: doc.id,
//               amount: Number(data.amount ?? 0),
//               profit: Number(data.profit ?? 0),
//               date: data.date ?? "",
//               timestamp,
//               medicineId: data.medicine_id,
//               medicineName: data.medicine_name,
//               quantity: Number(data.quantity ?? 0),
//               costPrice: Number(data.cost_price ?? 0),
//               retailPrice: Number(data.retail_price ?? 0),
//             };
//           }
//         );
//         setTodaysSales(salesData);
//       } catch (err) {
//         console.error("Error fetching today's sales:", err);
//       }
//     };
//     fetchSales();
//   }, []);

//   // Fetch active prescriptions (not processed)
//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       try {
//         const q = query(
//           collection(db, "prescriptions"),
//           orderBy("timestamp", "desc"),
//           limit(50)
//         );
//         const snap = await getDocs(q);
//         const docs: PrescriptionDoc[] = snap.docs
//           .map((d) => {
//             const data = d.data();
//             return {
//               id: d.id,
//               patient: data.patient,
//               prescription: data.prescription || data.prescribed || [],
//               totalItems: data.totalItems,
//               totalRetail: data.totalRetail,
//               timestamp: data.timestamp,
//               processed: data.processed || false,
//               processedAt: data.processedAt,
//             };
//           })
//           .filter((doc) => !doc.processed);
//         setPrescriptions(docs);
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//       }
//     };
//     fetchPrescriptions();
//   }, []);

//   // Fetch all prescriptions for history
//   useEffect(() => {
//     const fetchAllPrescriptions = async () => {
//       try {
//         const q = query(
//           collection(db, "prescriptions"),
//           orderBy("timestamp", "desc"),
//           limit(200)
//         );
//         const snap = await getDocs(q);
//         const docs: PrescriptionDoc[] = snap.docs.map((d) => {
//           const data = d.data();
//           return {
//             id: d.id,
//             patient: data.patient,
//             prescription: data.prescription || data.prescribed || [],
//             totalItems: data.totalItems,
//             totalRetail: data.totalRetail,
//             timestamp: data.timestamp,
//             processed: data.processed || false,
//             processedAt: data.processedAt,
//           };
//         });
//         setHistoryPrescriptions(docs);
//       } catch (err) {
//         console.error("Error fetching history prescriptions:", err);
//       }
//     };
//     if (historyOpen) {
//       fetchAllPrescriptions();
//     }
//   }, [historyOpen]);

//   // Filter history prescriptions by search query
//   const filteredHistory = historyPrescriptions.filter((pres) => {
//     const patientName = pres.patient?.name?.toLowerCase() || "";
//     const doctorName = pres.patient?.referringDoctor?.toLowerCase() || "";
//     const search = searchQuery.toLowerCase();
//     return patientName.includes(search) || doctorName.includes(search);
//   });

//   // Add single medicine
//   const addToCart = (medicine: any, quantity: number = 1, dosage?: string, instructions?: string) => {
//     const normalizedMedicine: Medicine = {
//       id: medicine.id,
//       name: medicine.name,
//       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
//       retailPrice: Number(
//         medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
//       ),
//       quantity: Number(medicine.quantity ?? 0),
//       createdAt: medicine.created_at,
//       updatedAt: medicine.updated_at,
//     };

//     const existingItem = cart.find(
//       (item) => item.medicineId === normalizedMedicine.id
//     );
//     if (existingItem) {
//       setCart(
//         cart.map((item) =>
//           item.medicineId === normalizedMedicine.id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         )
//       );
//     } else {
//       const newItem: CartItem = {
//         medicineId: normalizedMedicine.id,
//         medicineName: normalizedMedicine.name,
//         quantity,
//         price: normalizedMedicine.retailPrice,
//         cost: normalizedMedicine.costPrice,
//         medicine: normalizedMedicine,
//         dosage: dosage || undefined,
//         instructions: instructions || undefined,
//       };
//       setCart((prev) => [...prev, newItem]);
//     }
//   };

//   // Add all medicines from a prescription
//   const addMultipleToCart = (items: {
//     id?: string;
//     name?: string;
//     qty?: number;
//     retail_price?: number;
//     cost_price?: number;
//     dosage?: string;
//     instructions?: string;
//   }[]) => {
//     for (const it of items) {
//       const medObj = {
//         id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
//         name: it.name || "Unnamed",
//         cost_price: it.cost_price ?? 0,
//         retail_price: it.retail_price ?? 0,
//         quantity: it.qty ?? 1,
//       };
//       addToCart(medObj, medObj.quantity, it.dosage, it.instructions);
//     }
//   };

//   // Update quantity
//   const updateQuantity = (medicineId: string, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setCart(cart.filter((item) => item.medicineId !== medicineId));
//     } else {
//       setCart(
//         cart.map((item) =>
//           item.medicineId === medicineId
//             ? { ...item, quantity: newQuantity }
//             : item
//         )
//       );
//     }
//   };

//   // Totals
//   const getTotalAmount = () =>
//     cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const getTotalProfit = () =>
//     cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

//   // ------------------ PROCESS SALE ------------------
//   const processSale = async () => {
//     if (cart.length === 0) return;

//     try {
//       for (const item of cart) {
//         const amount = item.price * item.quantity;
//         const profit = (item.price - item.cost) * item.quantity;

//         const saleDoc = {
//           amount,
//           profit,
//           date: new Date().toISOString().split("T")[0],
//           timestamp: Timestamp.now(),
//           medicine_id: item.medicineId,
//           medicine_name: item.medicineName,
//           quantity: item.quantity,
//           cost_price: item.cost,
//           retail_price: item.price,
//         };

//         await addDoc(collection(db, "sales"), saleDoc);

//         const medicineRef = doc(db, "medicines", item.medicineId);
//         const medicineSnap = await getDoc(medicineRef);
//         if (medicineSnap.exists()) {
//           const currentQty = medicineSnap.data().quantity ?? 0;
//           await updateDoc(medicineRef, {
//             quantity: Math.max(0, currentQty - item.quantity),
//           });
//         }
//       }

//       setCart([]);
//       setActivePatient(null);

//       // Mark prescription as processed instead of deleting
//       if (activePrescriptionId) {
//         try {
//           await updateDoc(doc(db, "prescriptions", activePrescriptionId), {
//             processed: true,
//             processedAt: Timestamp.now(),
//           });
//           setPrescriptions((prev) => prev.filter((p) => p.id !== activePrescriptionId));
//           setActivePrescriptionId(null);
//         } catch (err) {
//           console.error("Failed to mark prescription as processed:", err);
//         }
//       }

//       toast({
//         title: "Sale processed",
//         description: "Sale saved and stock updated.",
//         variant: "default",
//       });

//       const today = new Date().toISOString().split("T")[0];
//       const q = query(collection(db, "sales"), where("date", "==", today));
//       const snapshot = await getDocs(q);
//       const salesData: Sale[] = snapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           amount: Number(data.amount ?? 0),
//           profit: Number(data.profit ?? 0),
//           date: data.date ?? "",
//           timestamp: data.timestamp,
//           medicineId: data.medicine_id,
//           medicineName: data.medicine_name,
//           quantity: Number(data.quantity ?? 0),
//           costPrice: Number(data.cost_price ?? 0),
//           retailPrice: Number(data.retail_price ?? 0),
//         };
//       });
//       setTodaysSales(salesData);
//     } catch (err) {
//       console.error("Error processing sale:", err);
//       toast({
//         title: "Error",
//         description: "Failed to process sale. Check console.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Process sale & print PDF
//   const handleProcessSaleWithPDF = async () => {
//     if (cart.length === 0) return;
    
//     try {
//       console.log("Generating PDF with cart items:", cart.length);
//       console.log("Patient data:", activePatient);
      
//       await generateSalePDF({
//         cart: cart,
//         patient: activePatient || undefined,
//       });
      
//       console.log("PDF generation completed");
      
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       await processSale();
      
//       toast({
//         title: "PDF Generated",
//         description: "Receipt PDF has been downloaded successfully.",
//         variant: "default",
//       });
//     } catch (error) {
//       console.error("Error in PDF generation:", error);
//       toast({
//         title: "PDF Error",
//         description: "Failed to generate PDF. Check console for details.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Reverse sale
//   const reverseSale = async (sale: Sale) => {
//     try {
//       const medicineRef = doc(db, "medicines", sale.medicineId);
//       const medicineSnap = await getDoc(medicineRef);

//       if (!medicineSnap.exists()) return;

//       const currentQty = medicineSnap.data().quantity ?? 0;
//       await updateDoc(medicineRef, {
//         quantity: currentQty + sale.quantity,
//       });

//       await deleteDoc(doc(db, "sales", sale.id));
//       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

//       toast({
//         title: "Sale reversed",
//         description: "Sale removed and stock updated.",
//         variant: "default",
//       });
//     } catch (err) {
//       console.error("Error reversing sale:", err);
//       toast({
//         title: "Error",
//         description: "Failed to reverse sale.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Clear cart
//   const handleReturn = () => {
//     if (cart.length === 0) return;
//     const confirmClear = window.confirm("Remove all medicines from cart?");
//     if (confirmClear) {
//       setCart([]);
//       setActivePrescriptionId(null);
//       setActivePatient(null);
//     }
//   };

//   // Load prescription from history
//   const loadFromHistory = (pres: PrescriptionDoc) => {
//     if (!pres.prescription || pres.prescription.length === 0) {
//       toast({
//         title: "Empty prescription",
//         description: "This prescription has no medicines.",
//         variant: "destructive",
//       });
//       return;
//     }
//     addMultipleToCart(pres.prescription);
//     setActivePatient(pres.patient || null);
//     setHistoryOpen(false);
//     toast({
//       title: "Prescription loaded",
//       description: "Medicines added to cart from history.",
//     });
//   };

//   // ------------------ JSX ------------------

//   return (
//     <div className="p-6 relative">
//       {/* History Button */}
//       <Button
//         onClick={() => setHistoryOpen(true)}
//         className="fixed top-20 right-6 z-40 gap-2"
//         variant="outline"
//       >
//         <History className="w-4 h-4" />
//         History
//       </Button>

//       {/* History Sidebar */}
//       {historyOpen && (
//         <>
//           {/* Overlay */}
//           <div
//             className="fixed inset-0 bg-black/50 z-40"
//             onClick={() => setHistoryOpen(false)}
//           />

//           {/* Sidebar */}
//           <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-background shadow-2xl z-50 overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Prescription History</h2>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => setHistoryOpen(false)}
//                 >
//                   <X className="w-5 h-5" />
//                 </Button>
//               </div>

//               {/* Search Bar */}
//               <div className="relative mb-6">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                 <Input
//                   type="text"
//                   placeholder="Search by patient or doctor name..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               {/* History List */}
//               <div className="space-y-4">
//                 {filteredHistory.length === 0 ? (
//                   <p className="text-muted-foreground text-center py-8">
//                     {searchQuery ? "No results found." : "No prescription history."}
//                   </p>
//                 ) : (
//                   filteredHistory.map((pres) => (
//                     <div
//                       key={pres.id}
//                       className={`medical-card p-4 ${
//                         pres.processed ? "bg-green-50 dark:bg-green-950/20" : ""
//                       }`}
//                     >
//                       <div className="flex justify-between items-start mb-3">
//                         <div>
//                           <p className="font-semibold text-lg">
//                             {pres.patient?.name ?? "Unknown Patient"}
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             Dr. {pres.patient?.referringDoctor ?? "-"}
//                           </p>
//                           {pres.patient?.age && (
//                             <p className="text-xs text-muted-foreground">
//                               Age: {pres.patient.age} {pres.patient.gender && `• ${pres.patient.gender}`}
//                             </p>
//                           )}
//                         </div>
//                         {pres.processed && (
//                           <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
//                             Processed
//                           </span>
//                         )}
//                       </div>

//                       <div className="mb-3 max-h-40 overflow-y-auto">
//                         <p className="text-sm font-medium mb-2">Medicines:</p>
//                         {pres.prescription && pres.prescription.length > 0 ? (
//                           <ul className="text-sm space-y-1">
//                             {pres.prescription.map((med, idx) => (
//                               <li key={idx} className="text-muted-foreground">
//                                 • {med.name} ({med.qty}x) - PKR {med.retail_price}
//                                 {med.dosage && (
//                                   <span className="text-xs block ml-4 text-blue-600">
//                                     {med.dosage}
//                                   </span>
//                                 )}
//                               </li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <p className="text-sm text-muted-foreground">No medicines</p>
//                         )}
//                       </div>

//                       <div className="flex justify-between items-center pt-3 border-t">
//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Total: PKR {(pres.totalRetail ?? 0).toFixed(2)}
//                           </p>
//                           {pres.processedAt && (
//                             <p className="text-xs text-muted-foreground">
//                               Processed: {pres.processedAt.toDate().toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>
//                         <Button
//                           size="sm"
//                           onClick={() => loadFromHistory(pres)}
//                           variant="outline"
//                         >
//                           Load to Cart
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Side */}
//         <div className="space-y-6">
//           <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>

//           {/* Active Patient Info */}
//           {activePatient && (
//             <div className="medical-card p-4 bg-blue-50 dark:bg-blue-950">
//               <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Active Prescription</h3>
//               <p className="text-sm"><strong>Patient:</strong> {activePatient.name}</p>
//               <p className="text-sm"><strong>Doctor:</strong> {activePatient.referringDoctor}</p>
//               {activePatient.age && <p className="text-sm"><strong>Age:</strong> {activePatient.age}</p>}
//               {activePatient.gender && <p className="text-sm"><strong>Gender:</strong> {activePatient.gender}</p>}
//             </div>
//           )}

//           {/* Medicine Search */}
//           <div className="medical-card p-4">
//             <h3 className="font-semibold mb-3">Add Medicine to Cart</h3>
//             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
//           </div>

//           {/* Shopping Cart */}
//           <div className="medical-card">
//             <div className="p-4 border-b flex justify-between">
//               <h3 className="font-semibold">Shopping Cart</h3>
//               <ShoppingCart className="w-5 h-5 text-primary" />
//             </div>

//             <div className="p-4">
//               {cart.length > 0 ? (
//                 <>
//                   {cart.map((item) => (
//                     <div
//                       key={item.medicineId}
//                       className="flex flex-col p-3 bg-accent/30 rounded-lg mb-3"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex-1">
//                           <h4 className="font-medium">{item.medicineName}</h4>
//                           <p className="text-sm text-muted-foreground">
//                             PKR {item.price} each
//                           </p>
//                           {item.dosage && (
//                             <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//                               <strong>Dosage:</strong> {item.dosage}
//                             </p>
//                           )}
//                           {item.instructions && (
//                             <p className="text-xs text-green-600 dark:text-green-400">
//                               <strong>Instructions:</strong> {item.instructions}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() =>
//                               updateQuantity(item.medicineId, item.quantity - 1)
//                             }
//                           >
//                             <Minus className="w-3 h-3" />
//                           </Button>
//                           <span className="w-8 text-center">{item.quantity}</span>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() =>
//                               updateQuantity(item.medicineId, item.quantity + 1)
//                             }
//                           >
//                             <Plus className="w-3 h-3" />
//                           </Button>
//                         </div>
//                         <div className="text-right ml-4">
//                           <p className="font-medium">
//                             PKR {(item.price * item.quantity).toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="border-t pt-3 mt-4">
//                     <div className="flex justify-between mb-2">
//                       <span>Subtotal:</span>
//                       <span>PKR {getTotalAmount().toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between mb-4">
//                       <span>Profit:</span>
//                       <span className="text-success">
//                         PKR {getTotalProfit().toFixed(2)}
//                       </span>
//                     </div>

//                     {activePrescriptionId ? (
//                       <div className="flex space-x-3">
//                         <Button onClick={processSale} className="flex-1 gap-2">
//                           <Receipt className="w-4 h-4" /> Process Sale
//                         </Button>
//                         <Button
//                           onClick={handleProcessSaleWithPDF}
//                           className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
//                         >
//                           <FileDown className="w-4 h-4" /> Process & Print PDF
//                         </Button>
//                         <Button variant="outline" onClick={handleReturn}>
//                           <RotateCcw className="w-4 h-4" /> Return
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="flex space-x-3">
//                         <Button onClick={processSale} className="flex-1 gap-2">
//                           <Receipt className="w-4 h-4" /> Process Sale
//                         </Button>
//                         <Button variant="outline" onClick={handleReturn}>
//                           <RotateCcw className="w-4 h-4" /> Return
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-8">
//                   <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
//                   <p>Your cart is empty</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Side */}
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold">Today's Sales Summary</h2>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="stats-card-primary p-4">
//               <p>Total Sales</p>
//               <h3 className="text-xl font-bold">
//                 PKR{" "}
//                 {todaysSales
//                   .reduce((sum, s) => sum + (s.amount ?? 0), 0)
//                   .toFixed(2)}
//               </h3>
//             </div>
//             <div className="stats-card-success p-4">
//               <p>Total Profit</p>
//               <h3 className="text-xl font-bold text-success">
//                 PKR{" "}
//                 {todaysSales
//                   .reduce((sum, s) => sum + (s.profit ?? 0), 0)
//                   .toFixed(2)}
//               </h3>
//             </div>
//           </div>

//           {/* Prescriptions */}
//           <div className="medical-card">
//             <div className="p-4 border-b flex justify-between">
//               <h3 className="font-semibold">Prescriptions</h3>
//             </div>
//             <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
//               {prescriptions.length === 0 ? (
//                 <p>No prescriptions found.</p>
//               ) : (
//                 prescriptions.map((pres) => (
//                   <div
//                     key={pres.id}
//                     className="p-3 bg-accent/20 rounded-lg flex justify-between"
//                   >
//                     <div>
//                       <p className="font-medium">
//                         {pres.patient?.name ?? "Unknown Patient"}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Doctor: {pres.patient?.referringDoctor ?? "-"} • PKR{" "}
//                         {(pres.totalRetail ?? 0).toFixed(2)}
//                       </p>
//                     </div>
//                     <Button
//                       size="sm"
//                       onClick={() => {
//                         if (!pres.prescription || pres.prescription.length === 0) {
//                           toast({
//                             title: "Empty prescription",
//                             description: "This prescription has no medicines.",
//                             variant: "destructive",
//                           });
//                           return;
//                         }
//                         addMultipleToCart(pres.prescription);
//                         setActivePrescriptionId(pres.id);
//                         setActivePatient(pres.patient || null);
//                         toast({
//                           title: "Prescription loaded",
//                           description: "All medicines added to cart.",
//                         });
//                       }}
//                     >
//                       Add to Cart
//                     </Button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>    
                
//          {/* Recent Sales */}
//          <div className="medical-card">
//             <div className="p-4 border-b">
//               <h3 className="font-semibold">Recent Sales</h3>
//             </div>
//             <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
//               {todaysSales.length === 0 ? (
//                 <p>No sales yet today.</p>
//               ) : (
//                 todaysSales.map((s) => (
//                   <div
//                     key={s.id}
//                     className="flex justify-between items-center p-2 bg-accent/30 rounded-lg"
//                   >
//                     <div>
//                       <p className="font-medium">{s.medicineName}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {s.quantity} × PKR {s.retailPrice} = PKR {s.amount}
//                       </p>
//                     </div>
//                     <Button
//                        size="sm"
//                        variant="destructive"
//                        onClick={() => reverseSale(s)}
//                      >
//                        Reverse
//                      </Button>
//                    </div>
//                  ))
//                )}
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  RotateCcw,
  FileDown,
  History,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import generateSalePDF from "@/components/SalePDF";

// ------------------ TYPES ------------------

export interface Medicine { ... } 
export interface CartItem { ... }
interface Sale { ... }
interface PatientData { ... }
interface PrescriptionDoc { ... }

// ------------------ COMPONENT ------------------

export default function Sales() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
  const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);
  const [activePatient, setActivePatient] = useState<PatientData | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPrescriptions, setHistoryPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  // ✅ ADDED: reveal sales state
  const [showTotals, setShowTotals] = useState(false);

  // Fetch today's sales
  useEffect(() => {
    ...
  }, []);

  useEffect(() => {
    ...
  }, []);

  useEffect(() => {
    ...
  }, [historyOpen]);

  const filteredHistory = historyPrescriptions.filter((pres) => { ... });

  const addToCart = (medicine: any, quantity: number = 1, dosage?: string, instructions?: string) => { ... };

  const addMultipleToCart = (items: any[]) => { ... };

  const updateQuantity = (medicineId: string, newQuantity: number) => { ... };

  const getTotalAmount = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTotalProfit = () =>
    cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

  const processSale = async () => { ... };

  const handleProcessSaleWithPDF = async () => { ... };

  const reverseSale = async (sale: Sale) => { ... };

  const handleReturn = () => { ... };

  const loadFromHistory = (pres: PrescriptionDoc) => { ... };

  // ------------------ JSX ------------------

  return (
    <div className="p-6 relative">

      {/* History Button */}
      <Button
        onClick={() => setHistoryOpen(true)}
        className="fixed top-20 right-6 z-40 gap-2"
        variant="outline"
      >
        <History className="w-4 h-4" />
        History
      </Button>

      {historyOpen && (
        <>
          ...
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side */}
        <div className="space-y-6">
          ...
        </div>

        {/* Right Side - Today's Sales */}
        <div className="space-y-6">
          <div className="medical-card p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              Today's Sales <Receipt className="ml-2 w-5 h-5 text-primary" />
            </h3>

            {todaysSales.length === 0 ? (
              <p className="text-muted-foreground">No sales today.</p>
            ) : (
              todaysSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex justify-between items-center p-3 border rounded mb-2"
                >
                  <div>
                    <p className="font-medium">{sale.medicineName}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.quantity}x — PKR {sale.amount}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => reverseSale(sale)}
                  >
                    Reverse
                  </Button>
                </div>
              ))
            )}

            {/* ✅ ADDED: Reveal button + totals */}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowTotals(!showTotals)}
                className="w-full"
              >
                {showTotals ? "Hide Totals" : "Reveal Totals"}
              </Button>

              {showTotals && (
                <div className="mt-3 bg-green-50 dark:bg-green-950 p-3 rounded">
                  <p className="font-semibold text-lg">
                    Total Sales: PKR{" "}
                    {todaysSales.reduce((t, s) => t + s.amount, 0).toFixed(2)}
                  </p>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    Profit: PKR{" "}
                    {todaysSales.reduce((t, s) => t + s.profit, 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            {/* ✅ END ADDED */}
          </div>
        </div>
      </div>
    </div>
  );
}
