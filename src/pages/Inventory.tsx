"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
  Package,
  TrendingUp,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";

interface Medicine {
  id: string;
  name: string;
  quantity: number;
  cost_price: number;
  retail_price: number;
  created_at?: any;
  updated_at?: any;
}

export default function InventoryMerged() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    cost_price: "",
    retail_price: "",
  });

  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");

  const [newMedicines, setNewMedicines] = useState<
    { name: string; quantity: number; cost_price: number; retail_price: number }[]
  >([]);

  const [newForm, setNewForm] = useState({
    name: "",
    quantity: "",
    cost_price: "",
    retail_price: "",
  });
  const [openNewMedDialog, setOpenNewMedDialog] = useState(false);

  const fetchMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "medicines"));
      const meds = snapshot.docs.map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Medicine, "id">),
          } as Medicine)
      );

      meds.sort((a, b) => a.name.localeCompare(b.name));
      setMedicines(meds);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) {
        alert("Name is required");
        return;
      }
      const medicineData = {
        name: form.name,
        quantity: Number(form.quantity) || 0,
        cost_price: Number(form.cost_price) || 0,
        retail_price: Number(form.retail_price) || 0,
        updated_at: Timestamp.now(),
        created_at: editMedicine ? editMedicine.created_at : Timestamp.now(),
      };

      if (editMedicine) {
        await updateDoc(doc(db, "medicines", editMedicine.id), medicineData);
      } else {
        await addDoc(collection(db, "medicines"), medicineData);
      }

      setForm({ name: "", quantity: "", cost_price: "", retail_price: "" });
      setEditMedicine(null);
      setOpenDialog(false);
      await fetchMedicines();
    } catch (error) {
      console.error("Error saving medicine:", error);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setForm({
      name: medicine.name,
      quantity: String(medicine.quantity),
      cost_price: String(medicine.cost_price),
      retail_price: String(medicine.retail_price),
    });
    setEditMedicine(medicine);
    setOpenDialog(true);
  };

  const handleDelete = async (medicine: Medicine) => {
    try {
      await deleteDoc(doc(db, "medicines", medicine.id));
      setMedicines((prev) => prev.filter((m) => m.id !== medicine.id));
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      for (const row of data) {
        if (!row.name) continue;
        await addDoc(collection(db, "medicines"), {
          name: row.name,
          quantity: Number(row.quantity) || 0,
          cost_price: Number(row.cost_price) || 0,
          retail_price: Number(row.retail_price) || 0,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
      }
      fetchMedicines();
    };
    reader.readAsBinaryString(file);
  };

  const handleBackup = async () => {
    try {
      const collections = ["medicines", "sales"];
      let backupData: any = {};

      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        backupData[col] = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `firestore-backup-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error backing up DB:", error);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const jsonData = JSON.parse(content);

        for (const [colName, docs] of Object.entries<any[]>(jsonData)) {
          for (const docData of docs) {
            const { id, ...data } = docData;
            await setDoc(doc(db, colName, id), data);
          }
        }

        alert("Database restored successfully!");
        fetchMedicines();
      } catch (error) {
        console.error("Error restoring DB:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleStockInput = (id: string, value: string) => {
    setStockChanges((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleNewMedicineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddNewMedicineTemp = () => {
    const { name, quantity, cost_price, retail_price } = newForm;
    if (!name || !quantity || !cost_price || !retail_price)
      return alert("Fill all fields!");

    setNewMedicines((prev) => [
      ...prev,
      {
        name,
        quantity: Number(quantity),
        cost_price: Number(cost_price),
        retail_price: Number(retail_price),
      },
    ]);

    setNewForm({ name: "", quantity: "", cost_price: "", retail_price: "" });
    setOpenNewMedDialog(false);
  };

  const handleRemoveNewMedicine = (index: number) => {
    setNewMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyStock = () => {
    const hasOldStock = Object.values(stockChanges).some((q) => q > 0);
    const hasNewMeds = newMedicines.length > 0;

    if (!hasOldStock && !hasNewMeds)
      return alert("No changes or new medicines added!");

    setShowSummary(true);
  };

  const handleConfirmStock = async () => {
    try {
      for (const [id, addedQty] of Object.entries(stockChanges)) {
        const med = medicines.find((m) => m.id === id);
        if (med && addedQty > 0) {
          await updateDoc(doc(db, "medicines", id), {
            quantity: med.quantity + addedQty,
            updated_at: Timestamp.now(),
          });
        }
      }

      for (const med of newMedicines) {
        const existing = medicines.find(
          (m) => m.name.trim().toLowerCase() === med.name.trim().toLowerCase()
        );
        if (existing) {
          await updateDoc(doc(db, "medicines", existing.id), {
            quantity: existing.quantity + med.quantity,
            cost_price: med.cost_price,
            retail_price: med.retail_price,
            updated_at: Timestamp.now(),
          });
        } else {
          await addDoc(collection(db, "medicines"), {
            ...med,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          });
        }
      }

      await fetchMedicines();
      setStockChanges({});
      setNewMedicines([]);
      setShowSummary(false);
      setOpenStockDialog(false);
      setStockSearchQuery("");
    } catch (error) {
      console.error("Error confirming stock:", error);
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stockFilteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(stockSearchQuery.toLowerCase())
  );

  const totalMedicines = medicines.length;

  const totalCostValue = medicines.reduce(
    (sum, med) => sum + med.cost_price * med.quantity,
    0
  );

  const totalRetailValue = medicines.reduce(
    (sum, med) => sum + med.retail_price * med.quantity,
    0
  );

  const getStockBadge = (qty: number) => {
    if (qty <= 5)
      return (
        <span className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-sm">
          {/* Low Stock ({qty}) */}
          ({qty})
        </span>
      );
    if (qty <= 15)
      return (
        <span className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold shadow-sm">
          {/* Medium ({qty}) */}
          ({qty})
        </span>
      );
    return (
      <span className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-sm">
        {/* In Stock ({qty}) */}
        ({qty})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-slate-600 mt-1 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage your medicine stock and inventory
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all" asChild>
              <label>
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  hidden
                  onChange={handleExcelImport}
                />
              </label>
            </Button>

            <Button variant="outline" className="gap-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all" onClick={handleBackup}>
              <Download className="w-4 h-4 text-green-600" />
              Backup DB
            </Button>

            <Button variant="outline" className="gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all" asChild>
              <label>
                <Upload className="w-4 h-4 text-blue-600" />
                Restore DB
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleRestore}
                />
              </label>
            </Button>

            <Button 
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transition-all" 
              onClick={() => setOpenStockDialog(true)}
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Medicines</p>
                <p className="text-4xl font-bold mt-2">{totalMedicines}</p>
              </div>
              <Package className="w-12 h-12 text-emerald-200 opacity-80" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Cost Value</p>
                <p className="text-4xl font-bold mt-2">
                  {totalCostValue.toFixed(0)}
                </p>
                <p className="text-xs text-blue-100 mt-1">PKR</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Retail Value</p>
                <p className="text-4xl font-bold mt-2">
                  {totalRetailValue.toFixed(0)}
                </p>
                <p className="text-xs text-purple-100 mt-1">PKR</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                  <th className="p-4 text-left font-semibold">Medicine Name</th>
                  <th className="p-4 text-left font-semibold">Stock Status</th>
                  <th className="p-4 text-left font-semibold">Cost Price</th>
                  <th className="p-4 text-left font-semibold">Retail Price</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine, i) => (
                  <tr
                    key={medicine.id}
                    className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="p-4 font-semibold text-slate-800">{medicine.name}</td>
                    <td className="p-4">{getStockBadge(medicine.quantity)}</td>
                    <td className="p-4 text-slate-700 font-medium">PKR {medicine.cost_price.toFixed(2)}</td>
                    <td className="p-4 text-slate-700 font-medium">PKR {medicine.retail_price.toFixed(2)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-indigo-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
                          <DropdownMenuItem onClick={() => handleEdit(medicine)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2 text-blue-600" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(medicine)}
                            className="text-red-600 cursor-pointer hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editMedicine ? "Edit Medicine" : "Add Medicine"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Medicine Name</label>
                <Input 
                  name="name" 
                  placeholder="Enter medicine name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Quantity</label>
                <Input 
                  name="quantity" 
                  type="number"
                  placeholder="Enter quantity" 
                  value={form.quantity} 
                  onChange={handleChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Cost Price (PKR)</label>
                <Input 
                  name="cost_price" 
                  type="number"
                  placeholder="Enter cost price" 
                  value={form.cost_price} 
                  onChange={handleChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Retail Price (PKR)</label>
                <Input 
                  name="retail_price" 
                  type="number"
                  placeholder="Enter retail price" 
                  value={form.retail_price} 
                  onChange={handleChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {editMedicine ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stock Dialog */}
        <Dialog open={openStockDialog} onOpenChange={setOpenStockDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-0 p-6 text-white rounded-t-2xl">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                {showSummary ? "Review Changes" : "Add Stock"}
              </DialogTitle>
            </DialogHeader>

            {!showSummary ? (
              <div className="space-y-6 mt-6 max-h-[calc(90vh-200px)] overflow-y-auto px-1">
                {/* Search inside dialog */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search medicines..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Existing Medicines Stock Table */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Update Existing Stock
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl shadow-sm bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left font-semibold text-slate-700">Medicine Name</th>
                          <th className="p-3 text-left font-semibold text-slate-700">Current Qty</th>
                          <th className="p-3 text-left font-semibold text-slate-700">Add Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockFilteredMedicines.map((m, i) => (
                          <tr key={m.id} className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                            <td className="p-3 font-medium text-slate-800">{m.name}</td>
                            <td className="p-3">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                                {m.quantity}
                              </span>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                placeholder="0"
                                value={stockChanges[m.id] || ""}
                                onChange={(e) => handleStockInput(m.id, e.target.value)}
                                className="w-28 rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Temporary New Medicines Table */}
                {newMedicines.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-green-600" />
                      New Medicines (Pending)
                    </h3>
                    <div className="border border-slate-200 rounded-xl max-h-[200px] overflow-y-auto shadow-sm bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-100 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">Name</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Qty</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Cost</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Retail</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newMedicines.map((med, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="p-3 font-medium text-slate-800">{med.name}</td>
                              <td className="p-3 text-slate-700">{med.quantity}</td>
                              <td className="p-3 text-slate-700">{med.cost_price}</td>
                              <td className="p-3 text-slate-700">{med.retail_price}</td>
                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveNewMedicine(i)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenNewMedDialog(true)}
                    className="gap-2 border-green-300 hover:bg-green-50 text-green-700 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Medicine
                  </Button>
                  <Button 
                    onClick={handleApplyStock}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 mt-6 max-h-[calc(90vh-200px)] overflow-y-auto px-1">
                {/* Confirmation Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Review Your Changes</h3>
                      <p className="text-sm text-slate-600">Please review the changes before confirming</p>
                    </div>
                  </div>
                </div>

                {/* Section 1: Existing Medicines */}
                {Object.entries(stockChanges).some(([id, addQty]) => {
                  const med = medicines.find((m) => m.id === id);
                  return med && addQty > 0;
                }) && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Updated Existing Medicines
                    </h3>
                    <div className="border border-slate-200 rounded-xl mb-4 max-h-[250px] overflow-y-auto shadow-sm bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">Medicine Name</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Old Qty</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Add</th>
                            <th className="p-3 text-left font-semibold text-slate-700">New Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stockChanges).map(([id, addQty]) => {
                            const med = medicines.find((m) => m.id === id);
                            if (!med || addQty <= 0) return null;
                            const newQty = med.quantity + addQty;
                            return (
                              <tr key={id} className="border-t border-slate-100 hover:bg-blue-50/50 transition-colors">
                                <td className="p-3 font-semibold text-slate-800">{med.name}</td>
                                <td className="p-3">
                                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-medium">
                                    {med.quantity}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow-sm">
                                    +{addQty}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold shadow-sm">
                                    {newQty}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 2: New Medicines */}
                {newMedicines.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-slate-800 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-green-600" />
                      New Medicines (To Be Added)
                    </h3>
                    <div className="border border-slate-200 rounded-xl max-h-[250px] overflow-y-auto shadow-sm bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-semibold text-slate-700">Name</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Qty</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Cost</th>
                            <th className="p-3 text-left font-semibold text-slate-700">Retail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newMedicines.map((m, i) => (
                            <tr key={i} className="border-t border-slate-100 hover:bg-green-50/50 transition-colors">
                              <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                              <td className="p-3">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                                  {m.quantity}
                                </span>
                              </td>
                              <td className="p-3 text-slate-700 font-medium">PKR {m.cost_price}</td>
                              <td className="p-3 text-slate-700 font-medium">PKR {m.retail_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <DialogFooter className="mt-6 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSummary(false)}
                    className="rounded-xl"
                  >
                    Back to Edit
                  </Button>
                  <Button 
                    onClick={handleConfirmStock}
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Save
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Medicine Dialog */}
        <Dialog open={openNewMedDialog} onOpenChange={setOpenNewMedDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="bg-gradient-to-r from-green-600 to-emerald-600 -m-6 mb-0 p-6 text-white rounded-t-2xl">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add New Medicine
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Medicine Name</label>
                <Input 
                  name="name" 
                  placeholder="Enter medicine name" 
                  value={newForm.name} 
                  onChange={handleNewMedicineChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Quantity</label>
                <Input 
                  name="quantity" 
                  type="number" 
                  placeholder="Enter quantity" 
                  value={newForm.quantity} 
                  onChange={handleNewMedicineChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Cost Price (PKR)</label>
                <Input 
                  name="cost_price" 
                  type="number" 
                  placeholder="Enter cost price" 
                  value={newForm.cost_price} 
                  onChange={handleNewMedicineChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Retail Price (PKR)</label>
                <Input 
                  name="retail_price" 
                  type="number" 
                  placeholder="Enter retail price" 
                  value={newForm.retail_price} 
                  onChange={handleNewMedicineChange}
                  className="rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setOpenNewMedDialog(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddNewMedicineTemp}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}