import { Medicine, Sale, DashboardStats, LowStockAlert } from '@/types/medical';

export const medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    quantity: 150,
    costPrice: 5,
    retailPrice: 8,
    category: 'Analgesic',
    manufacturer: 'MedCorp',
    expiryDate: '2025-12-31',
    batchNumber: 'PC001'
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    quantity: 8,
    costPrice: 12,
    retailPrice: 20,
    category: 'Antibiotic',
    manufacturer: 'PharmaCo',
    expiryDate: '2025-08-15',
    batchNumber: 'AM002'
  },
  {
    id: '3',
    name: 'Ibuprofen 400mg',
    quantity: 75,
    costPrice: 8,
    retailPrice: 15,
    category: 'Anti-inflammatory',
    manufacturer: 'HealthMed',
    expiryDate: '2025-10-20',
    batchNumber: 'IB003'
  },
  {
    id: '4',
    name: 'Cough Syrup 100ml',
    quantity: 5,
    costPrice: 15,
    retailPrice: 25,
    category: 'Respiratory',
    manufacturer: 'CoughCure',
    expiryDate: '2025-06-30',
    batchNumber: 'CS004'
  },
  {
    id: '5',
    name: 'Vitamin D3 1000IU',
    quantity: 200,
    costPrice: 3,
    retailPrice: 6,
    category: 'Supplement',
    manufacturer: 'VitaHealth',
    expiryDate: '2026-03-15',
    batchNumber: 'VD005'
  },
  {
    id: '6',
    name: 'Aspirin 325mg',
    quantity: 3,
    costPrice: 4,
    retailPrice: 7,
    category: 'Analgesic',
    manufacturer: 'CardioMed',
    expiryDate: '2025-09-10',
    batchNumber: 'AS006'
  }
];

export const todaysSales: Sale[] = [
  {
    id: 's1',
    medicines: [
      { medicineId: '1', medicineName: 'Paracetamol 500mg', quantity: 2, price: 8, cost: 5 },
      { medicineId: '3', medicineName: 'Ibuprofen 400mg', quantity: 1, price: 15, cost: 8 }
    ],
    totalAmount: 31,
    profit: 14,
    date: new Date().toISOString(),
    customerName: 'John Smith'
  },
  {
    id: 's2',
    medicines: [
      { medicineId: '5', medicineName: 'Vitamin D3 1000IU', quantity: 3, price: 6, cost: 3 }
    ],
    totalAmount: 18,
    profit: 9,
    date: new Date().toISOString(),
    customerName: 'Sarah Johnson'
  }
];

export const dashboardStats: DashboardStats = {
  todaysSales: todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
  todaysProfit: todaysSales.reduce((sum, sale) => sum + sale.profit, 0),
  totalMedicines: medicines.reduce((sum, med) => sum + med.quantity, 0),
  lowStockCount: medicines.filter(med => med.quantity <= 10).length
};

export const lowStockAlerts: LowStockAlert[] = medicines
  .filter(med => med.quantity <= 10)
  .map(med => ({
    medicineId: med.id,
    medicineName: med.name,
    currentStock: med.quantity,
    threshold: 10
  }));

export const topMedicines = [
  { name: 'Paracetamol 500mg', sales: 45, trend: '+12%' },
  { name: 'Vitamin D3 1000IU', sales: 38, trend: '+8%' },
  { name: 'Ibuprofen 400mg', sales: 32, trend: '+5%' },
  { name: 'Amoxicillin 250mg', sales: 28, trend: '-2%' },
  { name: 'Cough Syrup 100ml', sales: 22, trend: '+15%' }
];