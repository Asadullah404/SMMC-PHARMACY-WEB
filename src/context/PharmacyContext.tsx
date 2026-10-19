import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db, isFirebaseConfigured } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { Medicine, SaleRecord, Prescription, CartItem, SupplierContact } from "../types/medical";
import { initialMedicines, defaultSuppliers, mockPrescriptions } from "../data/mockData";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface PharmacyContextType {
  medicines: Medicine[];
  sales: SaleRecord[];
  prescriptions: Prescription[];
  suppliers: SupplierContact[];
  loading: boolean;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  // Medicine CRUD
  addMedicine: (medicine: Omit<Medicine, "id">) => Promise<boolean>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<boolean>;
  deleteMedicine: (id: string) => Promise<boolean>;
  bulkUpdateStock: (
    stockChanges: Record<string, number>,
    newMeds: Omit<Medicine, "id">[]
  ) => Promise<boolean>;
  // Sales Processing
  processSale: (
    cart: CartItem[],
    doctorFee: number,
    patientInfo?: any,
    prescriptionId?: string | null
  ) => Promise<boolean>;
  reverseSale: (sale: SaleRecord) => Promise<boolean>;
  // Prescriptions
  markPrescriptionProcessed: (id: string) => Promise<void>;
  // Backup & Import
  exportDatabaseJSON: () => void;
  restoreDatabaseJSON: (file: File) => Promise<boolean>;
  importExcelData: (data: any[]) => Promise<number>;
  // Refresh
  refreshData: () => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const STORAGE_KEY_MEDS = "smmc_v2_medicines";
const STORAGE_KEY_SALES = "smmc_v2_sales";
const STORAGE_KEY_RX = "smmc_v2_prescriptions";
const STORAGE_KEY_PRIVACY = "smmc_v2_privacy_mode";

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEDS);
      return saved ? JSON.parse(saved) : initialMedicines;
    } catch {
      return initialMedicines;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SALES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RX);
      return saved ? JSON.parse(saved) : mockPrescriptions;
    } catch {
      return mockPrescriptions;
    }
  });

  const [suppliers] = useState<SupplierContact[]>(defaultSuppliers);
  const [loading, setLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_PRIVACY) === "true";
  });

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_PRIVACY, String(next));
      return next;
    });
  };

  // Sync to LocalStorage as safety net
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medicines));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RX, JSON.stringify(prescriptions));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [prescriptions]);

  // Fetch Firestore Data when available
  const fetchAllData = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      setLoading(true);

      // 1. Fetch Medicines
      const medSnap = await getDocs(collection(db, "medicines"));
      if (!medSnap.empty) {
        const fetchedMeds: Medicine[] = medSnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || "Unnamed Medicine",
            quantity: Number(d.quantity) || 0,
            cost_price: Number(d.cost_price ?? d.costPrice ?? 0),
            retail_price: Number(d.retail_price ?? d.retailPrice ?? 0),
            category: d.category || "General",
            manufacturer: d.manufacturer || "Generic",
            expiry_date: d.expiry_date || d.expiryDate || "",
            batch_number: d.batch_number || d.batchNumber || "",
            created_at: d.created_at,
            updated_at: d.updated_at,
          };
        });
        fetchedMeds.sort((a, b) => a.name.localeCompare(b.name));
        setMedicines(fetchedMeds);
      }

      // 2. Fetch Sales (Today and recent)
      const salesSnap = await getDocs(
        query(collection(db, "sales"), orderBy("date", "desc"), limit(200))
      );
      if (!salesSnap.empty) {
        const fetchedSales: SaleRecord[] = salesSnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            medicine_id: d.medicine_id || "",
            medicine_name: d.medicine_name || "Unknown",
            quantity: Number(d.quantity) || 0,
            cost_price: Number(d.cost_price) || 0,
            retail_price: Number(d.retail_price) || 0,
            amount: Number(d.amount) || 0,
            profit: Number(d.profit) || 0,
            date: d.date || new Date().toISOString().split("T")[0],
            timestamp: d.timestamp,
            doctor_fee: Number(d.doctor_fee) || 0,
            customer_name: d.customer_name || "",
          };
        });
        setSales(fetchedSales);
      }

      // 3. Fetch Prescriptions
      try {
        const rxSnap = await getDocs(
          query(collection(db, "prescriptions"), orderBy("timestamp", "desc"), limit(50))
        );
        if (!rxSnap.empty) {
          const fetchedRx: Prescription[] = rxSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setPrescriptions(fetchedRx);
        }
      } catch (rxErr) {
        console.warn("Prescriptions collection query notice:", rxErr);
      }
    } catch (err) {
      console.warn("Firestore fetch error, operating in local-first mode:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Add Medicine
  const addMedicine = async (medData: Omit<Medicine, "id">): Promise<boolean> => {
    try {
      const normalizedData = {
        name: medData.name.trim(),
        quantity: Number(medData.quantity) || 0,
        cost_price: Number(medData.cost_price) || 0,
        retail_price: Number(medData.retail_price) || 0,
        category: medData.category || "General",
        manufacturer: medData.manufacturer || "Generic",
        expiry_date: medData.expiry_date || "",
        batch_number: medData.batch_number || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let newId = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (isFirebaseConfigured) {
        try {
          const docRef = await addDoc(collection(db, "medicines"), {
            ...normalizedData,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          });
          newId = docRef.id;
        } catch (fbErr) {
          console.warn("Firestore add failed, saved locally", fbErr);
        }
      }

      const newMedicine: Medicine = { id: newId, ...normalizedData };
      setMedicines((prev) => [...prev, newMedicine].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Medicine "${medData.name}" added to inventory.`);
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to add medicine");
      return false;
    }
  };

  // Update Medicine
  const updateMedicine = async (id: string, updates: Partial<Medicine>): Promise<boolean> => {
    try {
      if (isFirebaseConfigured) {
        try {
          const cleanUpdates: any = { ...updates, updated_at: Timestamp.now() };
          delete cleanUpdates.id;
          await updateDoc(doc(db, "medicines", id), cleanUpdates);
        } catch (fbErr) {
          console.warn("Firestore update notice:", fbErr);
        }
      }

      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m))
      );
      toast.success("Medicine updated successfully.");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to update medicine");
      return false;
    }
  };

  // Delete Medicine
  const deleteMedicine = async (id: string): Promise<boolean> => {
    try {
      if (isFirebaseConfigured) {
        try {
          await deleteDoc(doc(db, "medicines", id));
        } catch (fbErr) {
          console.warn("Firestore delete notice:", fbErr);
        }
      }
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      toast.success("Medicine removed from inventory.");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete medicine");
      return false;
    }
  };

  // Bulk Stock Addition
  const bulkUpdateStock = async (
    stockChanges: Record<string, number>,
    newMeds: Omit<Medicine, "id">[]
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Update existing
      const updatedList = [...medicines];
      for (const [id, addedQty] of Object.entries(stockChanges)) {
        if (addedQty > 0) {
          const idx = updatedList.findIndex((m) => m.id === id);
          if (idx !== -1) {
            const nextQty = updatedList[idx].quantity + addedQty;
            updatedList[idx] = { ...updatedList[idx], quantity: nextQty };

            if (isFirebaseConfigured) {
              try {
                await updateDoc(doc(db, "medicines", id), {
                  quantity: nextQty,
                  updated_at: Timestamp.now(),
                });
              } catch (err) {
                console.warn("Stock update notice for", id, err);
              }
            }
          }
        }
      }

      // Add new
      for (const item of newMeds) {
        const existingIdx = updatedList.findIndex(
          (m) => m.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );
        if (existingIdx !== -1) {
          const nextQty = updatedList[existingIdx].quantity + item.quantity;
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            quantity: nextQty,
            cost_price: item.cost_price,
            retail_price: item.retail_price,
          };
          if (isFirebaseConfigured) {
            try {
              await updateDoc(doc(db, "medicines", updatedList[existingIdx].id), {
                quantity: nextQty,
                cost_price: item.cost_price,
                retail_price: item.retail_price,
                updated_at: Timestamp.now(),
              });
            } catch (err) {
              console.warn("Update notice", err);
            }
          }
        } else {
          let newId = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          if (isFirebaseConfigured) {
            try {
              const ref = await addDoc(collection(db, "medicines"), {
                ...item,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now(),
              });
              newId = ref.id;
            } catch (err) {
              console.warn("Add new med notice", err);
            }
          }
          updatedList.push({ id: newId, ...item });
        }
      }

      updatedList.sort((a, b) => a.name.localeCompare(b.name));
      setMedicines(updatedList);
      toast.success("Stock inventory updated successfully!");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to apply stock updates");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Process POS Sale
  const processSale = async (
    cart: CartItem[],
    doctorFee: number,
    patientInfo?: any,
    prescriptionId?: string | null
  ): Promise<boolean> => {
    if (cart.length === 0 && doctorFee <= 0) {
      toast.error("Cart is empty");
      return false;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const newSaleRecords: SaleRecord[] = [];

      // 1. Process medicines in cart
      for (const item of cart) {
        const itemAmount = item.price * item.quantity;
        const itemProfit = (item.price - item.cost) * item.quantity;

        const saleItem: SaleRecord = {
          id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          medicine_id: item.medicineId,
          medicine_name: item.medicineName,
          quantity: item.quantity,
          cost_price: item.cost,
          retail_price: item.price,
          amount: itemAmount,
          profit: itemProfit,
          date: today,
          timestamp: new Date().toISOString(),
          customer_name: patientInfo?.name || "Walk-in Patient",
        };

        if (isFirebaseConfigured) {
          try {
            const saleDoc = {
              medicine_id: item.medicineId,
              medicine_name: item.medicineName,
              quantity: item.quantity,
              cost_price: item.cost,
              retail_price: item.price,
              amount: itemAmount,
              profit: itemProfit,
              date: today,
              timestamp: Timestamp.now(),
              doctor_fee: 0,
              customer_name: patientInfo?.name || "Walk-in Patient",
            };
            const docRef = await addDoc(collection(db, "sales"), saleDoc);
            saleItem.id = docRef.id;

            // Decrement Stock in Firestore
            const medIndex = medicines.findIndex((m) => m.id === item.medicineId);
            if (medIndex !== -1) {
              const currentStock = medicines[medIndex].quantity;
              const nextStock = Math.max(0, currentStock - item.quantity);
              await updateDoc(doc(db, "medicines", item.medicineId), {
                quantity: nextStock,
                updated_at: Timestamp.now(),
              });
            }
          } catch (fbErr) {
            console.warn("Firestore sale write notice", fbErr);
          }
        }

        newSaleRecords.push(saleItem);
      }

      // 2. Process Doctor Fee if any
      if (doctorFee > 0) {
        const docFeeRecord: SaleRecord = {
          id: `fee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          medicine_id: "DOCTOR_FEE",
          medicine_name: `Doctor Consultation (${patientInfo?.referringDoctor || "Doctor"})`,
          quantity: 1,
          cost_price: 0,
          retail_price: doctorFee,
          amount: doctorFee,
          profit: doctorFee,
          date: today,
          timestamp: new Date().toISOString(),
          doctor_fee: doctorFee,
          customer_name: patientInfo?.name || "Patient",
        };

        if (isFirebaseConfigured) {
          try {
            const docRef = await addDoc(collection(db, "sales"), {
              ...docFeeRecord,
              timestamp: Timestamp.now(),
            });
            docFeeRecord.id = docRef.id;
          } catch (fbErr) {
            console.warn("Firestore fee write notice", fbErr);
          }
        }

        newSaleRecords.push(docFeeRecord);
      }

      // 3. Update local state
      setMedicines((prev) =>
        prev.map((m) => {
          const inCart = cart.find((c) => c.medicineId === m.id);
          if (inCart) {
            return { ...m, quantity: Math.max(0, m.quantity - inCart.quantity) };
          }
          return m;
        })
      );

      setSales((prev) => [...newSaleRecords, ...prev]);

      // 4. Mark Prescription as processed if applicable
      if (prescriptionId) {
        await markPrescriptionProcessed(prescriptionId);
      }

      // Celebration confetti for delightful UX
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#10b981", "#06b6d4", "#3b82f6"],
        });
      } catch {}

      toast.success("Sale processed successfully! Receipt recorded.");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to process sale");
      return false;
    }
  };

  // Reverse Sale
  const reverseSale = async (sale: SaleRecord): Promise<boolean> => {
    try {
      if (isFirebaseConfigured) {
        try {
          await deleteDoc(doc(db, "sales", sale.id));
          if (sale.medicine_id !== "DOCTOR_FEE") {
            const med = medicines.find((m) => m.id === sale.medicine_id);
            if (med) {
              await updateDoc(doc(db, "medicines", sale.medicine_id), {
                quantity: med.quantity + sale.quantity,
                updated_at: Timestamp.now(),
              });
            }
          }
        } catch (err) {
          console.warn("Firestore reverse notice", err);
        }
      }

      // Restock in memory
      if (sale.medicine_id !== "DOCTOR_FEE") {
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === sale.medicine_id ? { ...m, quantity: m.quantity + sale.quantity } : m
          )
        );
      }

      setSales((prev) => prev.filter((s) => s.id !== sale.id));
      toast.success(`Sale for "${sale.medicine_name}" reversed & stock restored.`);
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Failed to reverse sale");
      return false;
    }
  };

  const markPrescriptionProcessed = async (id: string) => {
    try {
      if (isFirebaseConfigured) {
        try {
          await updateDoc(doc(db, "prescriptions", id), {
            processed: true,
            processedAt: Timestamp.now(),
          });
        } catch (err) {
          console.warn("Firestore rx update notice", err);
        }
      }
      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, processed: true, processedAt: new Date().toISOString() } : p
        )
      );
    } catch (e) {
      console.warn("Prescription mark processed notice", e);
    }
  };

  // Backup Database JSON
  const exportDatabaseJSON = () => {
    try {
      const backup = {
        metadata: {
          system: "SMMC Pharmacy Pro Max ERP",
          version: "2.0.0",
          exportDate: new Date().toISOString(),
        },
        medicines,
        sales,
        prescriptions,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SMMC-Pharmacy-Backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Database backup JSON exported successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export backup");
    }
  };

  // Restore Database JSON
  const restoreDatabaseJSON = async (file: File): Promise<boolean> => {
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);

      if (parsed.medicines && Array.isArray(parsed.medicines)) {
        setMedicines(parsed.medicines);
        if (isFirebaseConfigured) {
          for (const m of parsed.medicines) {
            try {
              const { id, ...data } = m;
              await setDoc(doc(db, "medicines", id), data);
            } catch {}
          }
        }
      }

      if (parsed.sales && Array.isArray(parsed.sales)) {
        setSales(parsed.sales);
      }

      if (parsed.prescriptions && Array.isArray(parsed.prescriptions)) {
        setPrescriptions(parsed.prescriptions);
      }

      toast.success("Database restored successfully from backup!");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Invalid backup file format");
      return false;
    }
  };

  // Import Excel data
  const importExcelData = async (data: any[]): Promise<number> => {
    let count = 0;
    const importedMeds: Omit<Medicine, "id">[] = [];

    for (const row of data) {
      const name = row.name || row.Name || row["Medicine Name"] || row["Item Name"];
      if (!name) continue;

      const quantity = Number(row.quantity || row.Quantity || row.Qty || row.qty || 0);
      const cost_price = Number(
        row.cost_price || row.costPrice || row["Cost Price"] || row["Cost"] || 0
      );
      const retail_price = Number(
        row.retail_price || row.retailPrice || row["Retail Price"] || row["Price"] || 0
      );

      importedMeds.push({
        name: String(name).trim(),
        quantity,
        cost_price,
        retail_price,
        category: row.category || row.Category || "Imported",
        manufacturer: row.manufacturer || row.Manufacturer || "Generic",
        expiry_date: row.expiryDate || row["Expiry Date"] || "",
        batch_number: row.batchNumber || row["Batch Number"] || "",
      });
      count++;
    }

    if (importedMeds.length > 0) {
      await bulkUpdateStock({}, importedMeds);
    }

    return count;
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        sales,
        prescriptions,
        suppliers,
        loading,
        privacyMode,
        togglePrivacyMode,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        bulkUpdateStock,
        processSale,
        reverseSale,
        markPrescriptionProcessed,
        exportDatabaseJSON,
        restoreDatabaseJSON,
        importExcelData,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error("usePharmacy must be used within a PharmacyProvider");
  }
  return context;
};
