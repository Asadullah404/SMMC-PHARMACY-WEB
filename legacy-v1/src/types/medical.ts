export interface Medicine {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  retailPrice: number;
  category: string;
  manufacturer: string;
  expiryDate: string;
  batchNumber: string;
}

export interface Sale {
  id: string;
  medicines: SaleItem[];
  totalAmount: number;
  profit: number;
  date: string;
  customerName?: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface DashboardStats {
  todaysSales: number;
  todaysProfit: number;
  totalMedicines: number;
  lowStockCount: number;
}

export interface LowStockAlert {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  threshold: number;
}