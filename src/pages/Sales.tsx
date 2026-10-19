import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Receipt,
  RotateCcw,
  Printer,
  History,
  X,
  Search,
  Stethoscope,
  User,
  Phone,
  FileDown,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { CartItem, PatientInfo, Prescription, SaleRecord } from "../types/medical";
import { formatPKR, formatNumber } from "../lib/utils";
import { generateSalePDF } from "../components/SalePDF";
import { toast } from "sonner";

export const Sales: React.FC = () => {
  const {
    medicines,
    sales,
    prescriptions,
    processSale,
    reverseSale,
    privacyMode,
    togglePrivacyMode,
  } = usePharmacy();

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [doctorFee, setDoctorFee] = useState<number>(0);
  const [activePatient, setActivePatient] = useState<PatientInfo | null>(null);
  const [activePrescriptionId, setActivePrescriptionId] = useState<string | null>(null);

  // Search input in POS
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // History Drawer
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Today's Sales Calculation
  const todaysSales = useMemo(() => {
    return sales.filter((s) => s.date === todayStr);
  }, [sales, todayStr]);

  const todaysMedicineSales = todaysSales
    .filter((s) => s.medicine_id !== "DOCTOR_FEE")
    .reduce((sum, s) => sum + s.amount, 0);

  const todaysProfit = todaysSales
    .filter((s) => s.medicine_id !== "DOCTOR_FEE")
    .reduce((sum, s) => sum + s.profit, 0);

  const todaysDoctorFees = todaysSales
    .filter((s) => s.medicine_id === "DOCTOR_FEE")
    .reduce((sum, s) => sum + (s.doctor_fee || s.amount), 0);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartProfit = cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);
  const grandTotal = cartSubtotal + doctorFee;

  // Search Medicine results
  const searchResults = useMemo(() => {
    if (!medSearchQuery.trim()) return [];
    return medicines
      .filter((m) => m.name.toLowerCase().includes(medSearchQuery.toLowerCase()))
      .slice(0, 8);
  }, [medicines, medSearchQuery]);

  // Cart Management
  const addToCart = (med: any, quantity = 1, dosage?: string, instructions?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.medicineId === med.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      } else {
        const newItem: CartItem = {
          medicineId: med.id,
          medicineName: med.name,
          quantity,
          price: Number(med.retail_price ?? med.retailPrice ?? med.price ?? 0),
          cost: Number(med.cost_price ?? med.costPrice ?? med.cost ?? 0),
          dosage: dosage || "",
          instructions: instructions || "",
          currentStock: med.quantity,
        };
        return [...prev, newItem];
      }
    });

    setMedSearchQuery("");
    setShowSearchDropdown(false);
  };

  const updateCartQuantity = (medicineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medicineId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    if (cart.length === 0 && doctorFee === 0) return;
    if (window.confirm("Clear all medicines and consultation fees from current sale?")) {
      setCart([]);
      setDoctorFee(0);
      setActivePatient(null);
      setActivePrescriptionId(null);
    }
  };

  // Load Prescription
  const loadPrescriptionToCart = (rx: Prescription) => {
    if (!rx.prescription || rx.prescription.length === 0) {
      toast.error("This prescription has no medicine items");
      return;
    }

    setCart([]);
    rx.prescription.forEach((it) => {
      addToCart(
        {
          id: it.id || `rx-item-${Math.random()}`,
          name: it.name,
          retail_price: it.retail_price || 0,
          cost_price: it.cost_price || 0,
          quantity: it.qty || 1,
        },
        it.qty || 1,
        it.dosage,
        it.instructions
      );
    });

    setActivePatient(rx.patient || null);
    setActivePrescriptionId(rx.id);
    setHistoryDrawerOpen(false);

    toast.success(`Prescription for ${rx.patient?.name || "Patient"} loaded to cart.`);
  };

  // Handle Checkout
  const handleCheckout = async (withPDF: boolean) => {
    if (cart.length === 0 && doctorFee <= 0) {
      toast.error("Add medicines or consultation fee to process sale");
      return;
    }

    // Check if stock is sufficient
    for (const item of cart) {
      const match = medicines.find((m) => m.id === item.medicineId);
      if (match && item.quantity > match.quantity) {
        toast.warning(
          `Stock warning: ${item.medicineName} only has ${match.quantity} in stock (requested ${item.quantity}).`
        );
      }
    }

    if (withPDF) {
      try {
        await generateSalePDF({
          cart,
          patient: activePatient,
          doctorFee,
        });
      } catch (pdfErr) {
        console.error("PDF generation error", pdfErr);
      }
    }

    const success = await processSale(cart, doctorFee, activePatient, activePrescriptionId);
    if (success) {
      setCart([]);
      setDoctorFee(0);
      setActivePatient(null);
      setActivePrescriptionId(null);
    }
  };

  // Filtered prescription history
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const pName = p.patient?.name?.toLowerCase() || "";
      const docName = p.patient?.referringDoctor?.toLowerCase() || "";
      const query = historySearch.toLowerCase();
      return pName.includes(query) || docName.includes(query);
    });
  }, [prescriptions, historySearch]);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-12 py-6 md:py-8 space-y-8">
      {/* Top Header / Action strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Sales &amp; Dispensing Register (POS)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-0.5">
            Real-time billing, clinical prescription intake, and instant receipt printing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* History Drawer Trigger */}
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/20 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <History className="w-4 h-4" />
            <span>Prescription History</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Cart & Input Area (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Active Patient Pill Banner (if prescription loaded) */}
          {activePatient && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {activePatient.name || "Patient"}
                    </span>
                    {activePatient.age && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
                        {activePatient.age} yrs {activePatient.gender || ""}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    Dr. {activePatient.referringDoctor || "General Consultation"} •{" "}
                    {activePatient.phone || "No contact"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePatient(null);
                  setActivePrescriptionId(null);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                title="Detach patient"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Search Medicine to Add */}
          <div className="relative">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-5 h-5 text-muted-foreground ml-3" />
              <input
                type="text"
                placeholder="Search and tap medicine to add to cart (e.g. Panadol, Augmentin)..."
                value={medSearchQuery}
                onChange={(e) => {
                  setMedSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-transparent py-2 px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {medSearchQuery && (
                <button
                  onClick={() => setMedSearchQuery("")}
                  className="p-1.5 text-muted-foreground hover:text-foreground mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-border/60">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addToCart(m, 1)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.category || "General"} • Stock:{" "}
                        <strong
                          className={m.quantity < 10 ? "text-destructive" : "text-emerald-600"}
                        >
                          {m.quantity}
                        </strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary num-mono">
                        {formatPKR(m.retail_price)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Tap to add +</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Consultation Fee Card */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                  Doctor Consultation Fee
                </p>
                <p className="text-xs text-muted-foreground">
                  Optional clinical consultation entry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-200">PKR</span>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="0"
                value={doctorFee || ""}
                onChange={(e) => setDoctorFee(Math.max(0, Number(e.target.value) || 0))}
                className="w-28 px-3 py-1.5 text-right font-mono font-bold text-sm rounded-xl bg-card border border-teal-500/30 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {doctorFee > 0 && (
                <button
                  onClick={() => setDoctorFee(0)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                  title="Clear doctor fee"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Shopping Cart List */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  Prescription Cart ({cart.length} items)
                </h3>
              </div>

              {(cart.length > 0 || doctorFee > 0) && (
                <button
                  onClick={clearCart}
                  className="text-xs text-destructive hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="py-3 space-y-2.5 min-h-[220px] max-h-80 overflow-y-auto pr-1">
              {cart.length === 0 && doctorFee === 0 ? (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                  <ShoppingCart className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-sm font-semibold">Your dispensing cart is currently empty</p>
                  <p className="text-xs mt-1">
                    Search medicines above or load an incoming prescription from the queue.
                  </p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:border-border transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground text-sm truncate">
                          {item.medicineName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="num-mono font-medium">
                            {formatPKR(item.price)} each
                          </span>
                          {item.dosage && (
                            <span className="text-primary font-medium">
                              • {item.dosage}
                            </span>
                          )}
                        </div>
                        {item.instructions && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Instr: {item.instructions}
                          </p>
                        )}
                      </div>

                      {/* Stepper & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="flex items-center bg-card rounded-xl border border-border p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.medicineId, -1)}
                            className="p-1 hover:bg-muted rounded-lg text-muted-foreground"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-mono font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.medicineId, 1)}
                            className="p-1 hover:bg-muted rounded-lg text-muted-foreground"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <span className="font-black text-sm text-foreground num-mono block">
                            {formatPKR(item.price * item.quantity)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Margin: +{formatPKR((item.price - item.cost) * item.quantity)}
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.medicineId)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Doctor fee row in cart */}
                  {doctorFee > 0 && (
                    <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="font-bold text-teal-900 dark:text-teal-200">
                            Doctor Consultation Fee
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Clinical professional charge
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-teal-700 dark:text-teal-300 num-mono">
                        {formatPKR(doctorFee)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cart Billing Summary Footer */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Medicines Subtotal:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatPKR(cartSubtotal)}
                </span>
              </div>

              {doctorFee > 0 && (
                <div className="flex items-center justify-between text-sm text-teal-700 dark:text-teal-300">
                  <span>Consultation Fee:</span>
                  <span className="font-mono font-semibold">{formatPKR(doctorFee)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-border/60">
                <span className="text-foreground">Grand Total:</span>
                <span className="text-2xl font-black text-primary num-mono">
                  {formatPKR(grandTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estimated Net Profit on this sale:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 num-mono">
                  +{formatPKR(cartProfit + doctorFee)}
                </span>
              </div>

              {/* Checkout Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleCheckout(false)}
                  disabled={cart.length === 0 && doctorFee <= 0}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-40 transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Process Sale Only</span>
                </button>

                <button
                  onClick={() => handleCheckout(true)}
                  disabled={cart.length === 0 && doctorFee <= 0}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-40 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Process &amp; Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prescriptions Queue & Today's Sales (5 cols on xl) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Today's Sales Ticker KPI */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">Today's Sales Summary</h3>
              <button
                onClick={togglePrivacyMode}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {privacyMode ? "Reveal" : "Hide"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Sales (Meds)
                </span>
                <p className="text-xl font-bold text-foreground mt-0.5 num-mono">
                  {privacyMode ? "••••" : formatPKR(todaysMedicineSales)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                  Net Profit
                </span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 num-mono">
                  {privacyMode ? "••••" : formatPKR(todaysProfit)}
                </p>
              </div>
            </div>

            {todaysDoctorFees > 0 && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-xs">
                <span className="text-teal-800 dark:text-teal-200 font-semibold">
                  Doctor Fees Collected:
                </span>
                <span className="font-bold text-teal-700 dark:text-teal-300 num-mono text-sm">
                  {privacyMode ? "••••" : formatPKR(todaysDoctorFees)}
                </span>
              </div>
            )}
          </div>

          {/* Pending Prescriptions Queue */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Incoming Prescriptions Queue
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {prescriptions.filter((p) => !p.processed).length} pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {prescriptions.filter((p) => !p.processed).length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                  No pending prescriptions in queue.
                </div>
              ) : (
                prescriptions
                  .filter((p) => !p.processed)
                  .map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 text-xs hover:border-primary/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground text-sm truncate">
                          {rx.patient?.name || "Patient Prescription"}
                        </p>
                        <p className="text-muted-foreground mt-0.5 truncate">
                          {rx.patient?.referringDoctor || "Doctor"} • {rx.prescription?.length || 0}{" "}
                          items
                        </p>
                      </div>

                      <button
                        onClick={() => loadPrescriptionToCart(rx)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary-hover flex-shrink-0 transition-colors"
                      >
                        Load Cart
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Recent Sales with 1-Click Reversal */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-foreground">Today's Recent Transactions</h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {todaysSales.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No sales processed yet today.
                </div>
              ) : (
                todaysSales.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-foreground truncate">
                        {s.medicine_name}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {s.quantity}x • Amount: <strong className="text-foreground">{formatPKR(s.amount)}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => reverseSale(s)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors flex-shrink-0"
                      title="Reverse sale & return medicine to stock"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reverse</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription History Slide-out Drawer */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setHistoryDrawerOpen(false)} />

          <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col p-6 space-y-5 animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Prescription History</h3>
              </div>
              <button
                onClick={() => setHistoryDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patient or doctor name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Prescriptions List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No prescription records found.
                </div>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {rx.patient?.name || "Unknown Patient"}
                        </p>
                        <p className="text-muted-foreground">
                          Dr. {rx.patient?.referringDoctor || "General Practitioner"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          rx.processed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {rx.processed ? "✓ Completed" : "Pending"}
                      </span>
                    </div>

                    {/* Prescribed Items summary */}
                    {rx.prescription && rx.prescription.length > 0 && (
                      <div className="space-y-1 py-1 text-muted-foreground border-y border-border/40">
                        {rx.prescription.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {it.name} ({it.qty}x)
                            </span>
                            <span className="font-mono">{formatPKR((it.retail_price || 0) * (it.qty || 1))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-foreground">
                        Total: {formatPKR(rx.totalRetail || 0)}
                      </span>
                      <button
                        onClick={() => loadPrescriptionToCart(rx)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-xs"
                      >
                        Load to POS Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
