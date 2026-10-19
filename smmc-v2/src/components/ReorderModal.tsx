import React, { useState } from "react";
import {
  X,
  PhoneCall,
  Send,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { usePharmacy } from "../context/PharmacyContext";
import { formatPKR } from "../lib/utils";
import { toast } from "sonner";

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: Array<{ medicineId: string; medicineName: string; costPrice: number; quantity?: number }>;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  onClose,
  initialItems = [],
}) => {
  const { suppliers, medicines } = usePharmacy();

  const [orderItems, setOrderItems] = useState<
    Array<{ medicineId: string; name: string; quantity: number; costPrice: number }>
  >(() => {
    if (initialItems.length > 0) {
      return initialItems.map((item) => ({
        medicineId: item.medicineId,
        name: item.medicineName,
        quantity: item.quantity || 10,
        costPrice: item.costPrice || 0,
      }));
    }
    // Auto-populate with low stock medicines (< 10)
    const low = medicines
      .filter((m) => m.quantity < 10)
      .slice(0, 10)
      .map((m) => ({
        medicineId: m.id,
        name: m.name,
        quantity: 10,
        costPrice: m.cost_price,
      }));
    return low;
  });

  const [selectedSupplierPhone, setSelectedSupplierPhone] = useState(
    suppliers[0]?.phone || "+923332511543"
  );
  const [customPhone, setCustomPhone] = useState("");
  const [useCustomSupplier, setUseCustomSupplier] = useState(false);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedQty, setCustomMedQty] = useState(10);

  if (!isOpen) return null;

  const updateQuantity = (index: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const removeItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCustom = () => {
    if (!customMedName.trim()) return;
    setOrderItems((prev) => [
      ...prev,
      {
        medicineId: `custom-${Date.now()}`,
        name: customMedName.trim(),
        quantity: customMedQty,
        costPrice: 0,
      },
    ]);
    setCustomMedName("");
    setCustomMedQty(10);
  };

  const totalBill = orderItems.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);

  const generateWhatsAppText = () => {
    let msg = `🏥 *SMMC PHARMACY - OFFICIAL WHOLESALE REORDER REQUEST*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📅 Date: ${new Date().toLocaleDateString("en-PK")}\n`;
    msg += `⏰ Time: ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}\n`;
    msg += `📦 Items Requested (${orderItems.length} items):\n\n`;

    orderItems.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.name}*\n`;
      msg += `   • Quantity: ${it.quantity} units\n`;
      if (it.costPrice > 0) {
        msg += `   • Unit Est. Cost: PKR ${it.costPrice}\n`;
        msg += `   • Line Total: PKR ${(it.costPrice * it.quantity).toLocaleString()}\n`;
      }
      msg += `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (totalBill > 0) {
      msg += `💰 *Est. Total Value: PKR ${totalBill.toLocaleString()}*\n\n`;
    }
    msg += `Please confirm stock availability, expiry batches, and delivery schedule ASAP.\n`;
    msg += `Thank you! - SMMC Medical Store Management`;

    return encodeURIComponent(msg);
  };

  const handleSendToWhatsApp = () => {
    if (orderItems.length === 0) {
      toast.error("Reorder list is empty");
      return;
    }

    const phone = useCustomSupplier ? customPhone : selectedSupplierPhone;
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    if (!cleanPhone) {
      toast.error("Please enter a valid supplier phone number");
      return;
    }

    const text = generateWhatsAppText();
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, "_blank");

    toast.success("Order dispatched to WhatsApp!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-emerald-600/10 via-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground leading-tight">
                Wholesale Supplier Reorder
              </h3>
              <p className="text-xs text-muted-foreground">
                Generate formatted WhatsApp procurement orders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Supplier Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Supplier Contact
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suppliers.map((sup) => (
                <button
                  key={sup.id}
                  onClick={() => {
                    setSelectedSupplierPhone(sup.phone);
                    setUseCustomSupplier(false);
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border text-sm transition-all ${
                    !useCustomSupplier && selectedSupplierPhone === sup.phone
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium"
                      : "border-border hover:border-border/80 bg-muted/30 text-foreground"
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">{sup.name}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{sup.phone}</span>
                </button>
              ))}
            </div>

            {/* Custom Phone toggle */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustom"
                checked={useCustomSupplier}
                onChange={(e) => setUseCustomSupplier(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="useCustom" className="text-xs text-muted-foreground cursor-pointer">
                Send to custom WhatsApp number
              </label>
            </div>
            {useCustomSupplier && (
              <input
                type="text"
                placeholder="e.g. +923001234567"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </div>

          {/* Items in Reorder list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reorder Items ({orderItems.length})
              </label>
              {orderItems.length > 0 && (
                <button
                  onClick={() => setOrderItems([])}
                  className="text-xs text-destructive hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-border bg-muted/20">
                <Package className="w-8 h-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-xs text-muted-foreground">No medicines added to reorder yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 text-sm"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      {item.costPrice > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Cost: {formatPKR(item.costPrice)} • Est: {formatPKR(item.costPrice * item.quantity)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center bg-card rounded-lg border border-border p-0.5">
                        <button
                          onClick={() => updateQuantity(idx, -5)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground"
                          title="Minus 5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono font-semibold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, 5)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground"
                          title="Plus 5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Custom Item */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add other medicine to order..."
                value={customMedName}
                onChange={(e) => setCustomMedName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCustom();
                }}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={customMedQty}
                onChange={(e) => setCustomMedQty(Number(e.target.value) || 1)}
                className="w-20 px-2 py-2 text-xs rounded-xl bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-center"
              />
              <button
                onClick={handleAddCustom}
                className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Total Estimated: <span className="font-bold text-foreground text-sm">{formatPKR(totalBill)}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendToWhatsApp}
              disabled={orderItems.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Launch WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
