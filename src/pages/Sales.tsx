// // // Sales.tsx
// // import { useState, useEffect } from "react";
// // import { ShoppingCart, Plus, Minus, Receipt, RotateCcw } from "lucide-react";
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
// // } from "firebase/firestore";

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

// // interface CartItem {
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

// // // ------------------ COMPONENT ------------------

// // export default function Sales() {
// //   const [cart, setCart] = useState<CartItem[]>([]);
// //   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);

// //   // Fetch today's sales
// //   useEffect(() => {
// //     const fetchSales = async () => {
// //       const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
// //       const q = query(collection(db, "sales"), where("date", "==", today));
// //       const snapshot = await getDocs(q);

// //       const salesData: Sale[] = snapshot.docs.map(
// //         (doc: QueryDocumentSnapshot<DocumentData>) => {
// //           const data = doc.data();
          
// //           // Normalize timestamp
// //           let timestamp: Timestamp;
// //           if (data.timestamp) {
// //             if (typeof data.timestamp.toDate === "function") {
// //               // Already a Firestore Timestamp
// //               timestamp = data.timestamp;
// //             } else {
// //               // Possibly a string or object, convert to Firestore Timestamp
// //               timestamp = Timestamp.fromDate(new Date(data.timestamp));
// //             }
// //           } else {
// //             timestamp = Timestamp.now();
// //           }
      
// //           return {
// //             id: doc.id,
// //             amount: Number(data.amount ?? 0),
// //             profit: Number(data.profit ?? 0),
// //             date: data.date ?? "",
// //             timestamp,
// //             medicineId: data.medicine_id,
// //             medicineName: data.medicine_name,
// //             quantity: Number(data.quantity ?? 0),
// //             costPrice: Number(data.cost_price ?? 0),
// //             retailPrice: Number(data.retail_price ?? 0),
// //           };
// //         }
// //       );
      

// //       setTodaysSales(salesData);
// //     };
// //     fetchSales();
// //   }, []);

// //   // Add medicine to cart
// //   const addToCart = (medicine: any, quantity: number = 1) => {
// //     const normalizedMedicine: Medicine = {
// //       id: medicine.id,
// //       name: medicine.name,
// //       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
// //       retailPrice: Number(medicine.retail_price ?? medicine.retailPrice ?? 0),
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
// //       setCart([...cart, newItem]);
// //     }
// //   };

// //   // Update quantity in cart
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
// //     cart.reduce(
// //       (sum, item) => sum + (item.price - item.cost) * item.quantity,
// //       0
// //     );

// //   // ------------------ PROCESS SALE ------------------
// //   const processSale = async () => {
// //     if (cart.length === 0) return;

// //     for (const item of cart) {
// //       const amount = item.price * item.quantity;
// //       const profit = (item.price - item.cost) * item.quantity;

// //       const saleDoc = {
// //         amount,
// //         profit,
// //         date: new Date().toISOString().split("T")[0],
// //         timestamp: Timestamp.now(),
// //         medicine_id: item.medicineId,
// //         medicine_name: item.medicineName,
// //         quantity: item.quantity,
// //         cost_price: item.cost,
// //         retail_price: item.price,
// //       };

// //       await addDoc(collection(db, "sales"), saleDoc);

// //       // ✅ Get current stock before updating
// //       const medicineRef = doc(db, "medicines", item.medicineId);
// //       const medicineSnap = await getDoc(medicineRef);

// //       if (medicineSnap.exists()) {
// //         const currentQty = medicineSnap.data().quantity ?? 0;
// //         await updateDoc(medicineRef, {
// //           quantity: Math.max(0, currentQty - item.quantity), // prevent negative stock
// //         });
// //       }
// //     }

// //     setCart([]);
// //   };

// //   // ------------------ REVERSE SALE ------------------
// //   const reverseSale = async (sale: Sale) => {
// //     try {
// //       const medicineRef = doc(db, "medicines", sale.medicineId);
// //       const medicineSnap = await getDoc(medicineRef);

// //       if (!medicineSnap.exists()) {
// //         console.error("Medicine not found:", sale.medicineId);
// //         return;
// //       }

// //       const currentQty = medicineSnap.data().quantity ?? 0;

// //       // ✅ Add back sold quantity to stock
// //       await updateDoc(medicineRef, {
// //         quantity: currentQty + sale.quantity,
// //       });

// //       // Delete sale record
// //       const saleRef = doc(db, "sales", sale.id);
// //       await deleteDoc(saleRef);

// //       // Update UI state
// //       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));
// //     } catch (err) {
// //       console.error("Error reversing sale:", err);
// //     }
// //   };

// //   // ------------------ JSX ------------------

// //   return (
// //     <div className="p-6">
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         {/* Left Side */}
// //         <div className="space-y-6">
// //           <h1 className="text-3xl font-bold text-foreground">
// //             Sales Management
// //           </h1>

// //           {/* Medicine Search */}
// //           <div className="medical-card p-4">
// //             <h3 className="font-semibold text-foreground mb-3">
// //               Add Medicine to Cart
// //             </h3>
// //             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
// //           </div>

// //           {/* Shopping Cart */}
// //           <div className="medical-card">
// //             <div className="p-4 border-b border-border flex items-center justify-between">
// //               <h3 className="font-semibold text-foreground">Shopping Cart</h3>
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
// //                         <h4 className="font-medium text-foreground">
// //                           {item.medicineName}
// //                         </h4>
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
// //                         <span className="w-8 text-center font-medium">
// //                           {item.quantity}
// //                         </span>
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
// //                         <p className="font-medium text-foreground">
// //                           PKR {(item.price * item.quantity).toFixed(2)}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   ))}

// //                   <div className="border-t border-border pt-3 mt-4">
// //                     <div className="flex justify-between items-center mb-2">
// //                       <span className="text-muted-foreground">Subtotal:</span>
// //                       <span className="font-medium text-foreground">
// //                         PKR {getTotalAmount().toFixed(2)}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between items-center mb-4">
// //                       <span className="text-muted-foreground">Profit:</span>
// //                       <span className="font-medium text-success">
// //                         PKR {getTotalProfit().toFixed(2)}
// //                       </span>
// //                     </div>
// //                     <div className="flex space-x-3">
// //                       <Button onClick={processSale} className="flex-1 gap-2">
// //                         <Receipt className="w-4 h-4" /> Process Sale
// //                       </Button>
// //                       <Button variant="outline" className="gap-2">
// //                         <RotateCcw className="w-4 h-4" /> Return
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </>
// //               ) : (
// //                 <div className="text-center py-8">
// //                   <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
// //                   <p className="text-muted-foreground">Your cart is empty</p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Side - Today's Sales */}
// //         <div className="space-y-6">
// //           <h2 className="text-2xl font-bold text-foreground">
// //             Today's Sales Summary
// //           </h2>
// //           <div className="grid grid-cols-2 gap-4">
// //             <div className="stats-card-primary p-4">
// //               <p className="text-sm font-medium text-primary/70">Total Sales</p>
// //               <h3 className="text-xl font-bold text-primary">
// //                 PKR{" "}
// //                 {todaysSales.reduce((sum, sale) => sum + (sale.amount ?? 0), 0)}
// //               </h3>
// //             </div>
// //             <div className="stats-card-success p-4">
// //               <p className="text-sm font-medium text-success/70">
// //                 Total Profit
// //               </p>
// //               <h3 className="text-xl font-bold text-success">
// //                 PKR{" "}
// //                 {todaysSales.reduce((sum, sale) => sum + (sale.profit ?? 0), 0)}
// //               </h3>
// //             </div>
// //           </div>

// //           <div className="medical-card">
// //             <div className="p-4 border-b border-border">
// //               <h3 className="font-semibold text-foreground">Recent Sales</h3>
// //             </div>
// //             <div className="p-4 space-y-3">
// //               {todaysSales.map((sale) => (
// //                 <div key={sale.id} className="p-3 bg-accent/20 rounded-lg">
// //                   <div className="flex justify-between items-start mb-2">
// //                     <div>
// //                       <p className="font-medium text-foreground">
// //                         {sale.medicineName}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         {sale.timestamp
// //                           ? sale.timestamp.toDate().toLocaleTimeString()
// //                           : ""}
// //                       </p>
// //                     </div>
// //                     <div className="text-right">
// //                       <p className="font-medium text-foreground">
// //                         PKR {sale.amount}
// //                       </p>
// //                       <p className="text-sm text-success">
// //                         Profit: PKR {sale.profit}
// //                       </p>
// //                     </div>
// //                   </div>
// //                   <div className="flex justify-between items-center">
// //                     <span className="text-sm text-muted-foreground">
// //                       Qty: {sale.quantity}
// //                     </span>
// //                     <Button
// //                       variant="destructive"
// //                       size="sm"
// //                       onClick={() => reverseSale(sale)}
// //                       className="gap-1"
// //                     >
// //                       <RotateCcw className="w-4 h-4" /> Reverse
// //                     </Button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // Sales.tsx
// import { useState, useEffect } from "react";
// import { ShoppingCart, Plus, Minus, Receipt, RotateCcw } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { SearchBar } from "@/components/SearchBar";
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
// } from "firebase/firestore";

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

// interface CartItem {
//   medicineId: string;
//   medicineName: string;
//   quantity: number;
//   price: number;
//   cost: number;
//   medicine: Medicine;
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

// // ------------------ COMPONENT ------------------

// export default function Sales() {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [todaysSales, setTodaysSales] = useState<Sale[]>([]);

//   // Fetch today's sales
//   useEffect(() => {
//     const fetchSales = async () => {
//       const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//       const q = query(collection(db, "sales"), where("date", "==", today));
//       const snapshot = await getDocs(q);

//       const salesData: Sale[] = snapshot.docs.map(
//         (doc: QueryDocumentSnapshot<DocumentData>) => {
//           const data = doc.data();
          
//           // Normalize timestamp
//           let timestamp: Timestamp;
//           if (data.timestamp) {
//             if (typeof data.timestamp.toDate === "function") {
//               // Already a Firestore Timestamp
//               timestamp = data.timestamp;
//             } else {
//               // Possibly a string or object, convert to Firestore Timestamp
//               timestamp = Timestamp.fromDate(new Date(data.timestamp));
//             }
//           } else {
//             timestamp = Timestamp.now();
//           }
      
//           return {
//             id: doc.id,
//             amount: Number(data.amount ?? 0),
//             profit: Number(data.profit ?? 0),
//             date: data.date ?? "",
//             timestamp,
//             medicineId: data.medicine_id,
//             medicineName: data.medicine_name,
//             quantity: Number(data.quantity ?? 0),
//             costPrice: Number(data.cost_price ?? 0),
//             retailPrice: Number(data.retail_price ?? 0),
//           };
//         }
//       );
      
//       setTodaysSales(salesData);
//     };
//     fetchSales();
//   }, []);

//   // Add medicine to cart
//   const addToCart = (medicine: any, quantity: number = 1) => {
//     const normalizedMedicine: Medicine = {
//       id: medicine.id,
//       name: medicine.name,
//       costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
//       retailPrice: Number(medicine.retail_price ?? medicine.retailPrice ?? 0),
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
//       };
//       setCart([...cart, newItem]);
//     }
//   };

//   // Update quantity in cart
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
//     cart.reduce(
//       (sum, item) => sum + (item.price - item.cost) * item.quantity,
//       0
//     );

//   // ------------------ PROCESS SALE ------------------
//   const processSale = async () => {
//     if (cart.length === 0) return;

//     for (const item of cart) {
//       const amount = item.price * item.quantity;
//       const profit = (item.price - item.cost) * item.quantity;

//       const saleDoc = {
//         amount,
//         profit,
//         date: new Date().toISOString().split("T")[0],
//         timestamp: Timestamp.now(),
//         medicine_id: item.medicineId,
//         medicine_name: item.medicineName,
//         quantity: item.quantity,
//         cost_price: item.cost,
//         retail_price: item.price,
//       };

//       await addDoc(collection(db, "sales"), saleDoc);

//       // ✅ Get current stock before updating
//       const medicineRef = doc(db, "medicines", item.medicineId);
//       const medicineSnap = await getDoc(medicineRef);

//       if (medicineSnap.exists()) {
//         const currentQty = medicineSnap.data().quantity ?? 0;
//         await updateDoc(medicineRef, {
//           quantity: Math.max(0, currentQty - item.quantity), // prevent negative stock
//         });
//       }
//     }

//     setCart([]);
//   };

//   // ------------------ REVERSE SALE ------------------
//   const reverseSale = async (sale: Sale) => {
//     try {
//       const medicineRef = doc(db, "medicines", sale.medicineId);
//       const medicineSnap = await getDoc(medicineRef);

//       if (!medicineSnap.exists()) {
//         console.error("Medicine not found:", sale.medicineId);
//         return;
//       }

//       const currentQty = medicineSnap.data().quantity ?? 0;

//       // ✅ Add back sold quantity to stock
//       await updateDoc(medicineRef, {
//         quantity: currentQty + sale.quantity,
//       });

//       // Delete sale record
//       const saleRef = doc(db, "sales", sale.id);
//       await deleteDoc(saleRef);

//       // Update UI state
//       setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));
//     } catch (err) {
//       console.error("Error reversing sale:", err);
//     }
//   };

//   // ------------------ CLEAR CART (Return Button) ------------------
//   const handleReturn = () => {
//     if (cart.length === 0) return;
//     const confirmClear = window.confirm(
//       "Are you sure you want to remove all medicines from the cart?"
//     );
//     if (confirmClear) setCart([]);
//   };

//   // ------------------ JSX ------------------

//   return (
//     <div className="p-6">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Side */}
//         <div className="space-y-6">
//           <h1 className="text-3xl font-bold text-foreground">
//             Sales Management
//           </h1>

//           {/* Medicine Search */}
//           <div className="medical-card p-4">
//             <h3 className="font-semibold text-foreground mb-3">
//               Add Medicine to Cart
//             </h3>
//             <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
//           </div>

//           {/* Shopping Cart */}
//           <div className="medical-card">
//             <div className="p-4 border-b border-border flex items-center justify-between">
//               <h3 className="font-semibold text-foreground">Shopping Cart</h3>
//               <ShoppingCart className="w-5 h-5 text-primary" />
//             </div>
//             <div className="p-4">
//               {cart.length > 0 ? (
//                 <>
//                   {cart.map((item) => (
//                     <div
//                       key={item.medicineId}
//                       className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
//                     >
//                       <div className="flex-1">
//                         <h4 className="font-medium text-foreground">
//                           {item.medicineName}
//                         </h4>
//                         <p className="text-sm text-muted-foreground">
//                           PKR {item.price} each
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() =>
//                             updateQuantity(item.medicineId, item.quantity - 1)
//                           }
//                         >
//                           <Minus className="w-3 h-3" />
//                         </Button>
//                         <span className="w-8 text-center font-medium">
//                           {item.quantity}
//                         </span>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() =>
//                             updateQuantity(item.medicineId, item.quantity + 1)
//                           }
//                         >
//                           <Plus className="w-3 h-3" />
//                         </Button>
//                       </div>
//                       <div className="text-right ml-4">
//                         <p className="font-medium text-foreground">
//                           PKR {(item.price * item.quantity).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="border-t border-border pt-3 mt-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-muted-foreground">Subtotal:</span>
//                       <span className="font-medium text-foreground">
//                         PKR {getTotalAmount().toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center mb-4">
//                       <span className="text-muted-foreground">Profit:</span>
//                       <span className="font-medium text-success">
//                         PKR {getTotalProfit().toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="flex space-x-3">
//                       <Button onClick={processSale} className="flex-1 gap-2">
//                         <Receipt className="w-4 h-4" /> Process Sale
//                       </Button>
//                       <Button
//                         variant="outline"
//                         className="gap-2"
//                         onClick={handleReturn}
//                       >
//                         <RotateCcw className="w-4 h-4" /> Return
//                       </Button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-8">
//                   <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                   <p className="text-muted-foreground">Your cart is empty</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Today's Sales */}
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold text-foreground">
//             Today's Sales Summary
//           </h2>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="stats-card-primary p-4">
//               <p className="text-sm font-medium text-primary/70">Total Sales</p>
//               <h3 className="text-xl font-bold text-primary">
//                 PKR{" "}
//                 {todaysSales.reduce((sum, sale) => sum + (sale.amount ?? 0), 0)}
//               </h3>
//             </div>
//             <div className="stats-card-success p-4">
//               <p className="text-sm font-medium text-success/70">
//                 Total Profit
//               </p>
//               <h3 className="text-xl font-bold text-success">
//                 PKR{" "}
//                 {todaysSales.reduce((sum, sale) => sum + (sale.profit ?? 0), 0)}
//               </h3>
//             </div>
//           </div>

//           <div className="medical-card">
//             <div className="p-4 border-b border-border">
//               <h3 className="font-semibold text-foreground">Recent Sales</h3>
//             </div>
//             <div className="p-4 space-y-3">
//               {todaysSales.map((sale) => (
//                 <div key={sale.id} className="p-3 bg-accent/20 rounded-lg">
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <p className="font-medium text-foreground">
//                         {sale.medicineName}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {sale.timestamp
//                           ? sale.timestamp.toDate().toLocaleTimeString()
//                           : ""}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium text-foreground">
//                         PKR {sale.amount}
//                       </p>
//                       <p className="text-sm text-success">
//                         Profit: PKR {sale.profit}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-muted-foreground">
//                       Qty: {sale.quantity}
//                     </span>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => reverseSale(sale)}
//                       className="gap-1"
//                     >
//                       <RotateCcw className="w-4 h-4" /> Reverse
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// Sales.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
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
import { useToast } from "@/hooks/use-toast"; // assumes you have this

// ------------------ TYPES ------------------

export interface Medicine {
  id: string;
  name: string;
  costPrice: number;
  retailPrice: number;
  quantity: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  cost: number;
  medicine: Medicine;
}

interface Sale {
  id: string;
  amount: number;
  profit: number;
  date: string;
  timestamp: Timestamp;
  medicineId: string;
  medicineName: string;
  quantity: number;
  costPrice: number;
  retailPrice: number;
}

interface PrescriptionDoc {
  id: string;
  patient?: { name?: string; referringDoctor?: string; [k: string]: any };
  prescription?: Array<{
    id?: string;
    name?: string;
    qty?: number;
    retail_price?: number;
    cost_price?: number;
    dosage?: string;
    instructions?: string;
    [k: string]: any;
  }>;
  totalItems?: number;
  totalRetail?: number;
  timestamp?: string | any;
}

// ------------------ COMPONENT ------------------

export default function Sales() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [todaysSales, setTodaysSales] = useState<Sale[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>(
    []
  );
  const { toast } = useToast();

  // Fetch today's sales
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const q = query(collection(db, "sales"), where("date", "==", today));
        const snapshot = await getDocs(q);

        const salesData: Sale[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();

            // Normalize timestamp
            let timestamp: Timestamp;
            if (data.timestamp && typeof data.timestamp.toDate === "function") {
              timestamp = data.timestamp;
            } else if (data.timestamp) {
              timestamp = Timestamp.fromDate(new Date(data.timestamp));
            } else {
              timestamp = Timestamp.now();
            }

            return {
              id: doc.id,
              amount: Number(data.amount ?? 0),
              profit: Number(data.profit ?? 0),
              date: data.date ?? "",
              timestamp,
              medicineId: data.medicine_id,
              medicineName: data.medicine_name,
              quantity: Number(data.quantity ?? 0),
              costPrice: Number(data.cost_price ?? 0),
              retailPrice: Number(data.retail_price ?? 0),
            };
          }
        );

        setTodaysSales(salesData);
      } catch (err) {
        console.error("Error fetching today's sales:", err);
      }
    };
    fetchSales();
  }, []);

  // Fetch recent prescriptions (latest 50) from collection 'prescriptions'
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        // latest first
        const q = query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50));
        const snap = await getDocs(q);
        const docs: PrescriptionDoc[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            patient: data.patient,
            prescription: data.prescription || data.prescribed || [],
            totalItems: data.totalItems,
            totalRetail: data.totalRetail,
            timestamp: data.timestamp,
          };
        });
        setPrescriptions(docs);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
      }
    };

    fetchPrescriptions();
  }, []);

  // Add medicine to cart
  const addToCart = (medicine: any, quantity: number = 1) => {
    const normalizedMedicine: Medicine = {
      id: medicine.id,
      name: medicine.name,
      costPrice: Number(medicine.cost_price ?? medicine.costPrice ?? 0),
      retailPrice: Number(
        medicine.retail_price ?? medicine.retailPrice ?? medicine.price ?? 0
      ),
      quantity: Number(medicine.quantity ?? 0),
      createdAt: medicine.created_at,
      updatedAt: medicine.updated_at,
    };

    const existingItem = cart.find(
      (item) => item.medicineId === normalizedMedicine.id
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medicineId === normalizedMedicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        medicineId: normalizedMedicine.id,
        medicineName: normalizedMedicine.name,
        quantity,
        price: normalizedMedicine.retailPrice,
        cost: normalizedMedicine.costPrice,
        medicine: normalizedMedicine,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  // Add multiple items (used by loading a prescription)
  const addMultipleToCart = (items: {
    id?: string;
    name?: string;
    qty?: number;
    retail_price?: number;
    cost_price?: number;
  }[]) => {
    for (const it of items) {
      const medObj = {
        id: it.id || `${it.name}-${Math.random().toString(36).slice(2, 8)}`,
        name: it.name || "Unnamed",
        cost_price: it.cost_price ?? 0,
        retail_price: it.retail_price ?? 0,
        quantity: it.qty ?? 1,
      };
      addToCart(medObj, medObj.quantity);
    }
  };

  // Update quantity in cart
  const updateQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.medicineId !== medicineId));
    } else {
      setCart(
        cart.map((item) =>
          item.medicineId === medicineId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  // Totals
  const getTotalAmount = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // profit rounded to two decimals when displayed
  const getTotalProfit = () =>
    cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

  // ------------------ PROCESS SALE ------------------
  const processSale = async () => {
    if (cart.length === 0) return;

    try {
      for (const item of cart) {
        const amount = item.price * item.quantity;
        const profit = (item.price - item.cost) * item.quantity;

        const saleDoc = {
          amount,
          profit,
          date: new Date().toISOString().split("T")[0],
          timestamp: Timestamp.now(),
          medicine_id: item.medicineId,
          medicine_name: item.medicineName,
          quantity: item.quantity,
          cost_price: item.cost,
          retail_price: item.price,
        };

        await addDoc(collection(db, "sales"), saleDoc);

        // ✅ Update stock in main firebase's medicines collection (if exists)
        const medicineRef = doc(db, "medicines", item.medicineId);
        const medicineSnap = await getDoc(medicineRef);

        if (medicineSnap.exists()) {
          const currentQty = medicineSnap.data().quantity ?? 0;
          await updateDoc(medicineRef, {
            quantity: Math.max(0, currentQty - item.quantity), // prevent negative stock
          });
        }
      }

      setCart([]);
      toast({
        title: "Sale processed",
        description: "Sale saved and stock updated.",
        variant: "default",
      });

      // refresh today's sales
      const today = new Date().toISOString().split("T")[0];
      const q = query(collection(db, "sales"), where("date", "==", today));
      const snapshot = await getDocs(q);

      const salesData: Sale[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          let timestamp: Timestamp;
          if (data.timestamp && typeof data.timestamp.toDate === "function") {
            timestamp = data.timestamp;
          } else if (data.timestamp) {
            timestamp = Timestamp.fromDate(new Date(data.timestamp));
          } else {
            timestamp = Timestamp.now();
          }
          return {
            id: doc.id,
            amount: Number(data.amount ?? 0),
            profit: Number(data.profit ?? 0),
            date: data.date ?? "",
            timestamp,
            medicineId: data.medicine_id,
            medicineName: data.medicine_name,
            quantity: Number(data.quantity ?? 0),
            costPrice: Number(data.cost_price ?? 0),
            retailPrice: Number(data.retail_price ?? 0),
          };
        }
      );

      setTodaysSales(salesData);
    } catch (err) {
      console.error("Error processing sale:", err);
      toast({
        title: "Error",
        description: "Failed to process sale. Check console.",
        variant: "destructive",
      });
    }
  };

  // ------------------ REVERSE SALE ------------------
  const reverseSale = async (sale: Sale) => {
    try {
      const medicineRef = doc(db, "medicines", sale.medicineId);
      const medicineSnap = await getDoc(medicineRef);

      if (!medicineSnap.exists()) {
        console.error("Medicine not found:", sale.medicineId);
        return;
      }

      const currentQty = medicineSnap.data().quantity ?? 0;

      await updateDoc(medicineRef, {
        quantity: currentQty + sale.quantity,
      });

      const saleRef = doc(db, "sales", sale.id);
      await deleteDoc(saleRef);

      setTodaysSales((prev) => prev.filter((s) => s.id !== sale.id));

      toast({
        title: "Sale reversed",
        description: "Sale removed and stock updated.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error reversing sale:", err);
      toast({
        title: "Error",
        description: "Failed to reverse sale.",
        variant: "destructive",
      });
    }
  };

  // ------------------ CLEAR CART (Return Button) ------------------
  const handleReturn = () => {
    if (cart.length === 0) return;
    const confirmClear = window.confirm(
      "Are you sure you want to remove all medicines from the cart?"
    );
    if (confirmClear) setCart([]);
  };

  // ------------------ JSX ------------------

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            Sales Management
          </h1>

          {/* Medicine Search */}
          <div className="medical-card p-4">
            <h3 className="font-semibold text-foreground mb-3">
              Add Medicine to Cart
            </h3>
            <SearchBar onSelect={(medicine) => addToCart(medicine, 1)} />
          </div>

          {/* Shopping Cart */}
          <div className="medical-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Shopping Cart</h3>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div className="p-4">
              {cart.length > 0 ? (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {item.medicineName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          PKR {item.price} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.medicineId, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.medicineId, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-foreground">
                          PKR {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium text-foreground">
                        PKR {getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Profit:</span>
                      <span className="font-medium text-success">
                        PKR {getTotalProfit().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={processSale} className="flex-1 gap-2">
                        <Receipt className="w-4 h-4" /> Process Sale
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleReturn}
                      >
                        <RotateCcw className="w-4 h-4" /> Return
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Today's Sales, Prescriptions & Recent Sales */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Today's Sales Summary
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="stats-card-primary p-4">
              <p className="text-sm font-medium text-primary/70">Total Sales</p>
              <h3 className="text-xl font-bold text-primary">
                PKR{" "}
                {todaysSales
                  .reduce((sum, sale) => sum + (sale.amount ?? 0), 0)
                  .toFixed(2)}
              </h3>
            </div>
            <div className="stats-card-success p-4">
              <p className="text-sm font-medium text-success/70">
                Total Profit
              </p>
              <h3 className="text-xl font-bold text-success">
                PKR{" "}
                {todaysSales
                  .reduce((sum, sale) => sum + (sale.profit ?? 0), 0)
                  .toFixed(2)}
              </h3>
            </div>
          </div>

          {/* Prescribed Section (A: below Today's Sales Summary) */}
          <div className="medical-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Prescriptions</h3>
            </div>

            <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {prescriptions.length === 0 ? (
                <p className="text-muted-foreground">No prescriptions found.</p>
              ) : (
                prescriptions.map((pres) => (
                  <div
                    key={pres.id}
                    className="p-3 bg-accent/20 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {pres.patient?.name ?? "Unknown Patient"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Doctor: {pres.patient?.referringDoctor ?? "-"} •{" "}
                        PKR {(pres.totalRetail ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // add all meds to cart
                          if (!pres.prescription || pres.prescription.length === 0) {
                            toast({
                              title: "Empty prescription",
                              description: "This prescription has no medicines.",
                              variant: "destructive",
                            });
                            return;
                          }
                          addMultipleToCart(pres.prescription);
                          toast({
                            title: "Prescription loaded",
                            description: "All medicines added to cart.",
                            variant: "default",
                          });
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sales (scrollable area on the right) */}
          <div className="medical-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Sales</h3>
            </div>

            <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {todaysSales.length === 0 ? (
                <p className="text-muted-foreground">No sales yet today.</p>
              ) : (
                todaysSales.map((sale) => (
                  <div key={sale.id} className="p-3 bg-accent/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {sale.medicineName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sale.timestamp
                            ? sale.timestamp.toDate().toLocaleTimeString()
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          PKR {Number(sale.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-success">
                          Profit: PKR {Number(sale.profit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Qty: {sale.quantity}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => reverseSale(sale)}
                        className="gap-1"
                      >
                        <RotateCcw className="w-4 h-4" /> Reverse
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
