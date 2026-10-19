# SMMC Pharmacy Pro Max (v2.0)
**Next-Generation Medical Store, Clinical POS & Healthcare ERP Management System**

Developed with high-precision **UI Pro Max** standards: consistent visual hierarchy, unified typography, clinical color systems, responsive layouts, and modern pharmacy workflows.

---

## 🌟 Key Upgrades & Features in v2.0

### 1. Consistent Clinical UI & Modern Theme System
- **Unified Design System**: Cohesive medical emerald (`#059669`) and deep clinical slate aesthetic with calibrated contrast ratios.
- **True Dark / Light Mode**: Instant toggle with system preference detection and smooth document-level transitions.
- **Global Privacy Mode**: One-click mask toggle (available in header and mobile drawer) that conceals all financial figures (`••••••`) across the Dashboard, Inventory, POS, and Reports.

### 2. Ultra-Responsive Multi-Device Layout
- **Desktop & Laptop**: Sleek collapsible sidebar with keyboard shortcut (`[`), badge indicators (e.g. low stock counts, pending prescriptions), and system connectivity status.
- **Mobile Experience (< 768px)**:
  - Custom bottom action bar with elevated, thumb-friendly **POS quick-dispensing button**.
  - Safe-area inset support for modern notch/pill smartphones.
  - Native-feeling sliding menu drawer for utilities, WhatsApp supplier dispatch, and backup tools.
  - Mobile card views for inventory items so tables never awkwardly overflow.

### 3. Point of Sale (POS) & Prescription Intake
- **Dual-Pane Register**: Active dispensing cart alongside incoming prescription queue and recent sales audit ticker.
- **Live Search**: Instant keyboard-navigable medicine search with stock and unit price previews.
- **Prescription Queue & History**:
  - Automatically loads patient demographics (Name, Age, Gender, Referring Doctor, Contact).
  - One-click prescription dispensing into the cart.
  - Comprehensive searchable prescription history drawer with status pills.
- **Doctor Consultation Fees**: Dedicated clinical consultation fee input with automatic net profit attribution.
- **Receipt PDF Generator**: Custom branded receipt generator featuring watermark logos, patient clinical cards, itemized dosages, and legal pharmacy exchange disclaimers.
- **1-Click Sale Reversal**: Reverse any accidental sale directly from the register; automatically restocks medicines in inventory.

### 4. Inventory Management & Stock Replenishment
- **Valuation Analytics**: Real-time capital cost valuation, retail sales valuation, and gross markup profit projections.
- **Bulk Stock Refill Modal**: Enter incoming stock quantities, queue new medicines, and review changes side-by-side before committing.
- **Excel Import & Export**: Fast `.xlsx` spreadsheet integration for wholesale stock imports and catalog exports.
- **Database Backup & Restore**: One-click full-database JSON backups and instant restores.

### 5. Financial Reports & Demand Velocity Analytics
- **Executive Reports**: Date range picker with quick presets (*Today, Yesterday, Last 7 Days, Last 30 Days, This Month*).
- **Separated Revenue Streams**: Clear separation of medicine retail margins versus 100% net doctor consultation fees.
- **Interactive Recharts**: Responsive revenue trajectory charts.
- **Demand Analytics**: Ranks top-moving medicines with relative volume share progress bars and demand badges.

### 6. WhatsApp Wholesale Reorder Dispatcher
- **Procurement Integration**: Pre-configured wholesale suppliers (*Murshid Medicos Wholesale #1 & #2, Babar Medical FBA #1 & #2*) plus custom WhatsApp numbers.
- **Auto-Formatted Orders**: Automatically compiles low-stock medicines, quantities, and cost estimates into professional WhatsApp messages ready to send.

---

## 🚀 Quick Start Guide

### Running in Development Mode
```bash
# Navigate to the v2 folder
cd smmc-v2

# Start the high-speed Vite dev server
npm run dev
```

The application will be accessible at: `http://localhost:3000`

### Building for Production
```bash
npm run build
```

---

## 🔐 Authentication & Offline Demo Mode
- **Live Firebase**: Provide credentials in `.env` (refer to `.env.example`).
- **Instant Demo Admin Access**: If Firebase keys are not provided or if testing locally without Google OAuth redirect URIs, clicking **"Instant Admin Demo Login"** on the login page grants full access to all ERP modules with realistic seed data.
