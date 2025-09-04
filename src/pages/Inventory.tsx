"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Upload,
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
  created_at: any;
  updated_at: any;
}

export default function Inventory() {
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

  // fetch medicines
  const fetchMedicines = async () => {
    try {
      const snapshot = await getDocs(collection(db, "medicines"));
      const meds = snapshot.docs.map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...docSnap.data(),
          } as Medicine)
      );
      setMedicines(meds);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // add / edit submit
  const handleSubmit = async () => {
    try {
      const medicineData = {
        name: form.name,
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price),
        retail_price: Number(form.retail_price),
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
      fetchMedicines();
    } catch (error) {
      console.error("Error saving medicine:", error);
    }
  };

  // edit
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

  // delete
  const handleDelete = async (medicine: Medicine) => {
    try {
      await deleteDoc(doc(db, "medicines", medicine.id));
      setMedicines((prev) => prev.filter((m) => m.id !== medicine.id));
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  // import excel
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

  // backup db
  const handleBackup = async () => {
    try {
      const collections = ["medicines", "sales"]; // add your collection names
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

  // restore db
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await setDoc(doc(db, colName, id), data); // restore with original IDs
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

  // filter
  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMedicines = medicines.length;
  const totalValue = medicines.reduce(
    (sum, med) => sum + med.cost_price * med.quantity,
    0
  );

  // stock badge
  const getStockBadge = (qty: number) => {
    if (qty <= 5)
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
          Low ({qty})
        </span>
      );
    if (qty <= 15)
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
          Medium ({qty})
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
        In Stock ({qty})
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your medicine stock and inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                hidden
                onChange={handleExcelImport}
              />
            </label>
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleBackup}>
            <Download className="w-4 h-4" />
            Backup DB
          </Button>

          <Button variant="outline" className="gap-2" asChild>
            <label>
              <Upload className="w-4 h-4" />
              Restore DB
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleRestore}
              />
            </label>
          </Button>

          <Button className="gap-2" onClick={() => setOpenDialog(true)}>
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="bg-gradient-to-r from-primary/90 to-purple-500/90 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Cost</th>
              <th className="p-3 text-left">Retail</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map((medicine, i) => (
              <tr
                key={medicine.id}
                className={i % 2 === 0 ? "bg-muted/30" : "bg-background"}
              >
                <td className="p-3 font-medium">{medicine.name}</td>
                <td className="p-3">{getStockBadge(medicine.quantity)}</td>
                <td className="p-3">PKR {medicine.cost_price.toFixed(2)}</td>
                <td className="p-3">PKR {medicine.retail_price.toFixed(2)}</td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(medicine)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(medicine)}
                        className="text-destructive"
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

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-gradient-to-r from-green-100 to-green-200">
          <p className="text-sm text-green-800">Total Medicines</p>
          <p className="text-3xl font-bold text-green-900">{totalMedicines}</p>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-100 to-blue-200">
          <p className="text-sm text-blue-800">Total Stock Value</p>
          <p className="text-3xl font-bold text-blue-900">
            PKR {totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMedicine ? "Edit Medicine" : "Add Medicine"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Medicine Name
              </label>
              <Input
                name="name"
                placeholder="Medicine Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price
              </label>
              <Input
                name="cost_price"
                placeholder="Cost Price"
                value={form.cost_price}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Retail Price
              </label>
              <Input
                name="retail_price"
                placeholder="Retail Price"
                value={form.retail_price}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>
              {editMedicine ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
