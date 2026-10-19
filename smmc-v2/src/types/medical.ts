export interface Medicine {
  id: string;
  name: string;
  quantity: number;
  cost_price: number;
  retail_price: number;
  category?: string;
  manufacturer?: string;
  expiry_date?: string;
  batch_number?: string;
  created_at?: any;
  updated_at?: any;
}

export interface CartItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  cost: number;
  dosage?: string;
  instructions?: string;
  currentStock?: number;
}

export interface SaleRecord {
  id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  cost_price: number;
  retail_price: number;
  amount: number;
  profit: number;
  date: string;
  timestamp: any;
  doctor_fee?: number;
  customer_name?: string;
}

export interface PatientInfo {
  name?: string;
  referringDoctor?: string;
  age?: string;
  gender?: string;
  phone?: string;
  mrNumber?: string;
}

export interface Prescription {
  id: string;
  patient?: PatientInfo;
  prescription?: Array<{
    id?: string;
    name?: string;
    qty?: number;
    retail_price?: number;
    cost_price?: number;
    dosage?: string;
    instructions?: string;
  }>;
  totalItems?: number;
  totalRetail?: number;
  timestamp?: any;
  processed?: boolean;
  processedAt?: any;
}

export interface SupplierContact {
  id: string;
  name: string;
  phone: string;
  location?: string;
}

export interface ReorderItem {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  costPrice: number;
  retailPrice: number;
  reorderQuantity: number;
}
