import { SaleRecord, Medicine } from "../types/medical";

export const KARACHI_TIMEZONE = "Asia/Karachi";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type WeekdayName = (typeof WEEKDAYS)[number];

// Standard Dayparts
export interface DaypartBreakdown {
  name: string;
  hoursRange: string;
  revenue: number;
  transactions: number;
  sharePercent: number;
}

// Heatmap Cell
export interface HeatmapCell {
  weekdayIndex: number;
  weekdayName: WeekdayName;
  hour: number;
  revenue: number;
  transactions: number;
  intensity: number; // 0 to 1
}

// Product Performance Metric
export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  marginPercent: number;
  sharePercent: number;
}

// Doctor Performance
export interface DoctorPerformance {
  doctorName: string;
  consultationCount: number;
  totalRevenue: number;
  averageFee: number;
  revenueSharePercent: number;
}

// Executive KPI Summary
export interface ExecutiveKPISummary {
  totalRevenue: number;
  priorRevenue: number;
  revenueGrowthPercent: number | null;

  totalTransactions: number;
  priorTransactions: number;
  transactionGrowthPercent: number | null;

  totalMedicinesSold: number;
  priorMedicinesSold: number;

  totalOtherProductsSold: number;
  priorOtherProductsSold: number;

  doctorConsultationRevenue: number;
  priorDoctorRevenue: number;
  doctorRevenueGrowthPercent: number | null;

  averageTransactionValue: number;
  priorAverageTransactionValue: number;
  atvGrowthPercent: number | null;

  averageDailyRevenue: number;
  priorAverageDailyRevenue: number;

  highestRevenueDay: { date: string; amount: number } | null;
  lowestRevenueDay: { date: string; amount: number } | null;

  totalRefunds: number;
  netRevenue: number;
  totalExpenses: number | null; // null if not recorded
  grossProfit: number;
  profitMarginPercent: number;

  activeDaysCount: number;
  totalPeriodDays: number;
}

// Same-weekday Historical Comparison Entry
export interface WeekdayComparisonEntry {
  label: string;
  date: string;
  revenue: number;
  transactions: number;
  atv: number;
  elapsedHoursRevenue?: number; // for fair intraday comparison
  differenceFromAvgPercent?: number;
}

// Intraday Forecast
export interface IntradayForecast {
  currentHour: number;
  currentLocalTime: string;
  todayActualRevenue: number;
  todayActualTransactions: number;
  historicalSameWeekdayAvg: number;
  expectedDailyRevenue: number;
  remainingExpectedRevenue: number;
  expectedTransactions: number;
  confidence: "High" | "Medium" | "Low";
  confidenceExplanation: string;
  trajectory: Array<{
    hour: number;
    hourLabel: string;
    actual: number | null;
    projected: number | null;
    historicalBaseline: number;
  }>;
  sameWeekdayHistory: WeekdayComparisonEntry[];
  upcomingWeekForecast: Array<{
    date: string;
    weekdayName: WeekdayName;
    expectedRevenue: number;
    isBusyDay: boolean;
  }>;
}

// Automated Insight
export interface BusinessInsight {
  id: string;
  type: "positive" | "caution" | "neutral" | "highlight";
  title: string;
  summary: string;
  metric: string;
  benchmark: string;
  category: "Revenue" | "Timing" | "Products" | "Doctors" | "Operations";
}

// -------------------------------------------------------------
// Timezone and Parsing Utilities
// -------------------------------------------------------------

/**
 * Safely parse a SaleRecord's timestamp or date into a Date object.
 */
export function parseSaleDate(sale: SaleRecord): Date {
  if (sale.timestamp) {
    if (typeof sale.timestamp.toDate === "function") {
      return sale.timestamp.toDate();
    }
    if (typeof sale.timestamp === "object" && typeof sale.timestamp.seconds === "number") {
      return new Date(sale.timestamp.seconds * 1000);
    }
    const d = new Date(sale.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (sale.date) {
    const d = new Date(`${sale.date}T12:00:00+05:00`);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Get hour of day (0-23) in Asia/Karachi timezone
 */
export function getKarachiHour(date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: KARACHI_TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).formatToParts(date);
    const hPart = parts.find((p) => p.type === "hour");
    if (hPart) {
      const parsed = parseInt(hPart.value, 10);
      return parsed === 24 ? 0 : parsed;
    }
  } catch {}
  return date.getHours();
}

/**
 * Get weekday index (0=Sun, 1=Mon, ..., 6=Sat) in Asia/Karachi timezone
 */
export function getKarachiWeekday(date: Date): number {
  try {
    const str = new Intl.DateTimeFormat("en-US", {
      timeZone: KARACHI_TIMEZONE,
      weekday: "short",
    }).format(date);
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    if (typeof map[str] === "number") return map[str];
  } catch {}
  return date.getDay();
}

/**
 * Get YYYY-MM-DD in Asia/Karachi timezone
 */
export function getKarachiDateString(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: KARACHI_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    return parts;
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Format local time in Asia/Karachi (e.g. "03:45 PM")
 */
export function getKarachiTimeString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: KARACHI_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

/**
 * Calculate the prior equivalent period of the same duration.
 * e.g. If range is 7 days (2026-11-10 to 2026-11-16), prior is 7 days before that (2026-11-03 to 2026-11-09).
 */
export function calculatePriorPeriod(
  startDate: string,
  endDate: string
): { priorStart: string; priorEnd: string; daysDiff: number } {
  const start = new Date(`${startDate}T00:00:00+05:00`);
  const end = new Date(`${endDate}T23:59:59+05:00`);
  const diffMs = Math.max(1, end.getTime() - start.getTime());
  const daysDiff = Math.max(1, Math.round(diffMs / 86400000));

  const priorEndMs = start.getTime() - 86400000;
  const priorStartMs = priorEndMs - (daysDiff - 1) * 86400000;

  return {
    priorStart: getKarachiDateString(new Date(priorStartMs)),
    priorEnd: getKarachiDateString(new Date(priorEndMs)),
    daysDiff,
  };
}

// -------------------------------------------------------------
// Executive KPIs & Period Comparison
// -------------------------------------------------------------

export function computeExecutiveKPIs(
  currentSales: SaleRecord[],
  priorSales: SaleRecord[],
  totalDays: number,
  medicinesMap: Map<string, Medicine>
): ExecutiveKPISummary {
  const sumAmount = (list: SaleRecord[]) => list.reduce((sum, s) => sum + (s.amount || 0), 0);
  const sumProfit = (list: SaleRecord[]) => list.reduce((sum, s) => sum + (s.profit || 0), 0);

  const currentTotal = sumAmount(currentSales);
  const priorTotal = sumAmount(priorSales);
  const revenueGrowthPercent =
    priorTotal > 0 ? ((currentTotal - priorTotal) / priorTotal) * 100 : null;

  // Transactions (we treat each distinct order/timestamp or sale entry as transactions)
  // For POS, each distinct timestamp or grouping is counted; fallback to distinct IDs or count
  const currentTx = currentSales.length;
  const priorTx = priorSales.length;
  const transactionGrowthPercent =
    priorTx > 0 ? ((currentTx - priorTx) / priorTx) * 100 : null;

  // Filter medicines vs other products vs doctor fees
  let currentMedQty = 0;
  let currentOtherQty = 0;
  let currentDocRev = 0;
  let currentRefunds = 0;

  currentSales.forEach((s) => {
    if (s.amount < 0) {
      currentRefunds += Math.abs(s.amount);
      return;
    }
    if (s.medicine_id === "DOCTOR_FEE") {
      currentDocRev += s.doctor_fee || s.amount || 0;
    } else {
      const med = medicinesMap.get(s.medicine_id);
      const cat = (med?.category || "").toLowerCase();
      const isRetail =
        cat.includes("general") ||
        cat.includes("retail") ||
        cat.includes("cosmetic") ||
        cat.includes("supplement") ||
        cat.includes("device") ||
        cat.includes("personal");

      if (isRetail) {
        currentOtherQty += s.quantity || 1;
      } else {
        currentMedQty += s.quantity || 1;
      }
    }
  });

  let priorMedQty = 0;
  let priorOtherQty = 0;
  let priorDocRev = 0;

  priorSales.forEach((s) => {
    if (s.amount < 0) return;
    if (s.medicine_id === "DOCTOR_FEE") {
      priorDocRev += s.doctor_fee || s.amount || 0;
    } else {
      const med = medicinesMap.get(s.medicine_id);
      const cat = (med?.category || "").toLowerCase();
      const isRetail =
        cat.includes("general") ||
        cat.includes("retail") ||
        cat.includes("cosmetic") ||
        cat.includes("supplement") ||
        cat.includes("device") ||
        cat.includes("personal");

      if (isRetail) {
        priorOtherQty += s.quantity || 1;
      } else {
        priorMedQty += s.quantity || 1;
      }
    }
  });

  const doctorRevenueGrowthPercent =
    priorDocRev > 0 ? ((currentDocRev - priorDocRev) / priorDocRev) * 100 : null;

  const averageTransactionValue = currentTx > 0 ? currentTotal / currentTx : 0;
  const priorAverageTransactionValue = priorTx > 0 ? priorTotal / priorTx : 0;
  const atvGrowthPercent =
    priorAverageTransactionValue > 0
      ? ((averageTransactionValue - priorAverageTransactionValue) / priorAverageTransactionValue) * 100
      : null;

  // Day breakdown
  const dailyRevMap = new Map<string, number>();
  currentSales.forEach((s) => {
    if (s.date) {
      dailyRevMap.set(s.date, (dailyRevMap.get(s.date) || 0) + (s.amount || 0));
    }
  });

  const activeDaysCount = Math.max(1, dailyRevMap.size);
  const averageDailyRevenue = currentTotal / Math.max(1, totalDays);
  const priorAverageDailyRevenue = priorTotal / Math.max(1, totalDays);

  let highestRevenueDay: { date: string; amount: number } | null = null;
  let lowestRevenueDay: { date: string; amount: number } | null = null;

  dailyRevMap.forEach((amount, date) => {
    if (!highestRevenueDay || amount > highestRevenueDay.amount) {
      highestRevenueDay = { date, amount };
    }
    if (!lowestRevenueDay || amount < lowestRevenueDay.amount) {
      lowestRevenueDay = { date, amount };
    }
  });

  const netRevenue = Math.max(0, currentTotal - currentRefunds);
  const grossProfit = sumProfit(currentSales);
  const profitMarginPercent = currentTotal > 0 ? (grossProfit / currentTotal) * 100 : 0;

  return {
    totalRevenue: currentTotal,
    priorRevenue: priorTotal,
    revenueGrowthPercent,

    totalTransactions: currentTx,
    priorTransactions: priorTx,
    transactionGrowthPercent,

    totalMedicinesSold: currentMedQty,
    priorMedicinesSold: priorMedQty,

    totalOtherProductsSold: currentOtherQty,
    priorOtherProductsSold: priorOtherQty,

    doctorConsultationRevenue: currentDocRev,
    priorDoctorRevenue: priorDocRev,
    doctorRevenueGrowthPercent,

    averageTransactionValue,
    priorAverageTransactionValue,
    atvGrowthPercent,

    averageDailyRevenue,
    priorAverageDailyRevenue,

    highestRevenueDay,
    lowestRevenueDay,

    totalRefunds: currentRefunds,
    netRevenue,
    totalExpenses: null, // Clearly unrecorded
    grossProfit,
    profitMarginPercent,

    activeDaysCount,
    totalPeriodDays: totalDays,
  };
}

// -------------------------------------------------------------
// Day-of-Week Analysis (Monday through Sunday)
// -------------------------------------------------------------

export interface WeekdayStat {
  index: number;
  name: WeekdayName;
  shortName: string;
  totalRevenue: number;
  averageRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  occurrences: number;
  sharePercent: number;
  isBest: boolean;
  isLowest: boolean;
}

export function computeWeekdayAnalysis(sales: SaleRecord[]): {
  weekdays: WeekdayStat[];
  bestWeekday: WeekdayStat | null;
  lowestWeekday: WeekdayStat | null;
} {
  // 0=Sun, 1=Mon, ..., 6=Sat
  const weekdayTotals = Array.from({ length: 7 }, (_, i) => ({
    index: i,
    name: WEEKDAYS[i],
    shortName: WEEKDAYS[i].slice(0, 3),
    totalRevenue: 0,
    transactionCount: 0,
    dates: new Set<string>(),
  }));

  sales.forEach((s) => {
    const d = parseSaleDate(s);
    const dayIdx = getKarachiWeekday(d);
    const bucket = weekdayTotals[dayIdx];
    if (bucket) {
      bucket.totalRevenue += s.amount || 0;
      bucket.transactionCount += 1;
      if (s.date) bucket.dates.add(s.date);
    }
  });

  const grandTotal = sales.reduce((sum, s) => sum + (s.amount || 0), 0) || 1;

  // Reorder Monday (1) through Sunday (0) for natural business presentation
  const mondayFirstOrder = [1, 2, 3, 4, 5, 6, 0];

  const weekdayStats: WeekdayStat[] = mondayFirstOrder.map((idx) => {
    const raw = weekdayTotals[idx];
    const occurrences = Math.max(1, raw.dates.size);
    const averageRevenue = raw.totalRevenue / occurrences;
    const atv = raw.transactionCount > 0 ? raw.totalRevenue / raw.transactionCount : 0;
    const sharePercent = (raw.totalRevenue / grandTotal) * 100;

    return {
      index: raw.index,
      name: raw.name,
      shortName: raw.shortName,
      totalRevenue: raw.totalRevenue,
      averageRevenue,
      transactionCount: raw.transactionCount,
      averageTransactionValue: atv,
      occurrences,
      sharePercent,
      isBest: false,
      isLowest: false,
    };
  });

  // Identify best and lowest by average revenue (among days with occurrences)
  const activeWeekdays = weekdayStats.filter((w) => w.occurrences > 0);
  let best: WeekdayStat | null = null;
  let lowest: WeekdayStat | null = null;

  activeWeekdays.forEach((w) => {
    if (!best || w.averageRevenue > best.averageRevenue) {
      best = w;
    }
    if (!lowest || w.averageRevenue < lowest.averageRevenue) {
      lowest = w;
    }
  });

  if (best) (best as WeekdayStat).isBest = true;
  if (lowest && lowest !== best) (lowest as WeekdayStat).isLowest = true;

  return {
    weekdays: weekdayStats,
    bestWeekday: best,
    lowestWeekday: lowest,
  };
}

// -------------------------------------------------------------
// 24-Hour Weekday Heatmap (7 Days × 24 Hours)
// -------------------------------------------------------------

export function computeHeatmapMatrix(sales: SaleRecord[]): {
  matrix: HeatmapCell[][];
  maxRevenue: number;
} {
  // 7 rows (Mon-Sun), 24 cols (00-23h)
  const rowsOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
  let maxRevenue = 0;

  const rawGrid: Record<number, Record<number, { revenue: number; tx: number }>> = {};
  rowsOrder.forEach((w) => {
    rawGrid[w] = {};
    for (let h = 0; h < 24; h++) {
      rawGrid[w][h] = { revenue: 0, tx: 0 };
    }
  });

  sales.forEach((s) => {
    const d = parseSaleDate(s);
    const w = getKarachiWeekday(d);
    const h = getKarachiHour(d);
    if (rawGrid[w] && rawGrid[w][h]) {
      rawGrid[w][h].revenue += s.amount || 0;
      rawGrid[w][h].tx += 1;
      if (rawGrid[w][h].revenue > maxRevenue) {
        maxRevenue = rawGrid[w][h].revenue;
      }
    }
  });

  const matrix: HeatmapCell[][] = rowsOrder.map((w) => {
    const rowCells: HeatmapCell[] = [];
    for (let h = 0; h < 24; h++) {
      const cellData = rawGrid[w][h];
      const intensity = maxRevenue > 0 ? cellData.revenue / maxRevenue : 0;
      rowCells.push({
        weekdayIndex: w,
        weekdayName: WEEKDAYS[w],
        hour: h,
        revenue: cellData.revenue,
        transactions: cellData.tx,
        intensity,
      });
    }
    return rowCells;
  });

  return { matrix, maxRevenue };
}

// -------------------------------------------------------------
// Hourly Velocity & Dayparts
// -------------------------------------------------------------

export interface HourlyStat {
  hour: number;
  label: string;
  revenue: number;
  transactions: number;
  averageValue: number;
}

export function computeHourlyVelocity(sales: SaleRecord[]): {
  hourly: HourlyStat[];
  peakHour: HourlyStat | null;
  lowestHour: HourlyStat | null;
  dayparts: DaypartBreakdown[];
} {
  const hoursMap: Record<number, { revenue: number; tx: number }> = {};
  for (let i = 0; i < 24; i++) {
    hoursMap[i] = { revenue: 0, tx: 0 };
  }

  sales.forEach((s) => {
    const d = parseSaleDate(s);
    const h = getKarachiHour(d);
    if (hoursMap[h]) {
      hoursMap[h].revenue += s.amount || 0;
      hoursMap[h].tx += 1;
    }
  });

  const hourly: HourlyStat[] = Array.from({ length: 24 }, (_, h) => {
    const data = hoursMap[h];
    const atv = data.tx > 0 ? data.revenue / data.tx : 0;
    const label = `${String(h).padStart(2, "0")}:00`;
    return {
      hour: h,
      label,
      revenue: data.revenue,
      transactions: data.tx,
      averageValue: atv,
    };
  });

  let peakHour: HourlyStat | null = null;
  let lowestHour: HourlyStat | null = null;

  hourly.forEach((h) => {
    if (!peakHour || h.revenue > peakHour.revenue) {
      peakHour = h;
    }
    if (!lowestHour || h.revenue < lowestHour.revenue) {
      lowestHour = h;
    }
  });

  // Dayparts calculation
  // Morning: 06:00 - 11:59 (hours 6..11)
  // Afternoon: 12:00 - 16:59 (hours 12..16)
  // Evening: 17:00 - 21:59 (hours 17..21)
  // Night: 22:00 - 05:59 (hours 22..23, 0..5)
  const totalRev = sales.reduce((sum, s) => sum + (s.amount || 0), 0) || 1;

  const sumRange = (startH: number, endH: number) => {
    let rev = 0;
    let tx = 0;
    for (let i = startH; i <= endH; i++) {
      rev += hoursMap[i].revenue;
      tx += hoursMap[i].tx;
    }
    return { rev, tx };
  };

  const morning = sumRange(6, 11);
  const afternoon = sumRange(12, 16);
  const evening = sumRange(17, 21);
  const night1 = sumRange(22, 23);
  const night2 = sumRange(0, 5);
  const nightRev = night1.rev + night2.rev;
  const nightTx = night1.tx + night2.tx;

  const dayparts: DaypartBreakdown[] = [
    {
      name: "Morning Rush",
      hoursRange: "06:00 - 12:00",
      revenue: morning.rev,
      transactions: morning.tx,
      sharePercent: (morning.rev / totalRev) * 100,
    },
    {
      name: "Afternoon Peak",
      hoursRange: "12:00 - 17:00",
      revenue: afternoon.rev,
      transactions: afternoon.tx,
      sharePercent: (afternoon.rev / totalRev) * 100,
    },
    {
      name: "Evening Prime",
      hoursRange: "17:00 - 22:00",
      revenue: evening.rev,
      transactions: evening.tx,
      sharePercent: (evening.rev / totalRev) * 100,
    },
    {
      name: "Late Night",
      hoursRange: "22:00 - 06:00",
      revenue: nightRev,
      transactions: nightTx,
      sharePercent: (nightRev / totalRev) * 100,
    },
  ];

  return { hourly, peakHour, lowestHour, dayparts };
}

// -------------------------------------------------------------
// Product & Medicine Analytics
// -------------------------------------------------------------

export function computeProductAnalytics(
  sales: SaleRecord[],
  medicinesMap: Map<string, Medicine>
): {
  topMedicines: ProductPerformance[];
  topOtherProducts: ProductPerformance[];
  leastSellingProducts: ProductPerformance[];
  categoryDistribution: Array<{ category: string; revenue: number; units: number; sharePercent: number }>;
} {
  const prodMap = new Map<
    string,
    {
      id: string;
      name: string;
      category: string;
      quantity: number;
      revenue: number;
      profit: number;
      isPharma: boolean;
    }
  >();

  const categoryMap = new Map<string, { revenue: number; units: number }>();

  let totalSalesRev = 0;

  sales.forEach((s) => {
    if (s.medicine_id === "DOCTOR_FEE") return; // Keep consultation fees separate
    totalSalesRev += s.amount || 0;

    const med = medicinesMap.get(s.medicine_id);
    const category = med?.category || "General Pharma";
    const catLower = category.toLowerCase();
    const isRetail =
      catLower.includes("general") ||
      catLower.includes("retail") ||
      catLower.includes("cosmetic") ||
      catLower.includes("supplement") ||
      catLower.includes("device") ||
      catLower.includes("personal");

    const key = s.medicine_name;
    const existing = prodMap.get(key);

    if (!existing) {
      prodMap.set(key, {
        id: s.medicine_id,
        name: s.medicine_name,
        category,
        quantity: s.quantity || 1,
        revenue: s.amount || 0,
        profit: s.profit || 0,
        isPharma: !isRetail,
      });
    } else {
      existing.quantity += s.quantity || 1;
      existing.revenue += s.amount || 0;
      existing.profit += s.profit || 0;
    }

    // Category aggregation
    const catEntry = categoryMap.get(category) || { revenue: 0, units: 0 };
    catEntry.revenue += s.amount || 0;
    catEntry.units += s.quantity || 1;
    categoryMap.set(category, catEntry);
  });

  const totalBase = Math.max(1, totalSalesRev);

  const allItems: ProductPerformance[] = Array.from(prodMap.values()).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantitySold: item.quantity,
    revenue: item.revenue,
    profit: item.profit,
    marginPercent: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
    sharePercent: (item.revenue / totalBase) * 100,
  }));

  const pharmaItems = allItems.filter((i) => {
    const raw = prodMap.get(i.name);
    return raw?.isPharma;
  });

  const retailItems = allItems.filter((i) => {
    const raw = prodMap.get(i.name);
    return !raw?.isPharma;
  });

  const topMedicines = [...pharmaItems].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const topOtherProducts = [...retailItems].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const leastSellingProducts = [...allItems].sort((a, b) => a.revenue - b.revenue).slice(0, 8);

  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([cat, val]) => ({
      category: cat,
      revenue: val.revenue,
      units: val.units,
      sharePercent: (val.revenue / totalBase) * 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    topMedicines,
    topOtherProducts,
    leastSellingProducts,
    categoryDistribution,
  };
}

// -------------------------------------------------------------
// Doctor Fee Analytics
// -------------------------------------------------------------

export function computeDoctorAnalytics(
  sales: SaleRecord[],
  totalBusinessRevenue: number
): {
  totalRevenue: number;
  consultationCount: number;
  averageFee: number;
  revenueSharePercent: number;
  doctorBreakdown: DoctorPerformance[];
} {
  const docSales = sales.filter((s) => s.medicine_id === "DOCTOR_FEE");
  const totalRevenue = docSales.reduce((sum, s) => sum + (s.doctor_fee || s.amount || 0), 0);
  const consultationCount = docSales.length;
  const averageFee = consultationCount > 0 ? totalRevenue / consultationCount : 0;
  const revenueSharePercent =
    totalBusinessRevenue > 0 ? (totalRevenue / totalBusinessRevenue) * 100 : 0;

  const doctorMap = new Map<string, { count: number; revenue: number }>();

  docSales.forEach((s) => {
    // Extract doctor name from description like "Doctor Consultation (Dr. Tariq Mahmood)"
    let docName = s.medicine_name || "General Practitioner";
    const match = docName.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      docName = match[1];
    } else if (docName.toLowerCase().startsWith("doctor consultation")) {
      docName = docName.replace(/doctor consultation/i, "").trim() || "Consultant Doctor";
    }

    const current = doctorMap.get(docName) || { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += s.doctor_fee || s.amount || 0;
    doctorMap.set(docName, current);
  });

  const totalDocRevBase = Math.max(1, totalRevenue);

  const doctorBreakdown: DoctorPerformance[] = Array.from(doctorMap.entries())
    .map(([name, data]) => ({
      doctorName: name,
      consultationCount: data.count,
      totalRevenue: data.revenue,
      averageFee: data.count > 0 ? data.revenue / data.count : 0,
      revenueSharePercent: (data.revenue / totalDocRevBase) * 100,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    totalRevenue,
    consultationCount,
    averageFee,
    revenueSharePercent,
    doctorBreakdown,
  };
}

// -------------------------------------------------------------
// Intraday Forecasting & Same-Weekday Comparisons
// -------------------------------------------------------------

export function computeIntradayForecast(
  todaySales: SaleRecord[],
  fourWeekHistorySales: SaleRecord[],
  todayDateStr: string = getKarachiDateString(new Date())
): IntradayForecast {
  const now = new Date();
  const currentHour = getKarachiHour(now);
  const currentLocalTime = getKarachiTimeString(now);

  const todayActualRevenue = todaySales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const todayActualTransactions = todaySales.length;

  // Identify today's weekday index
  const todayDate = new Date(`${todayDateStr}T12:00:00+05:00`);
  const todayWeekdayIdx = getKarachiWeekday(todayDate);
  const todayWeekdayName = WEEKDAYS[todayWeekdayIdx];

  // Group historical sales by date for the same weekday
  const sameWeekdayDatesMap = new Map<string, { revenue: number; tx: number; sales: SaleRecord[] }>();

  fourWeekHistorySales.forEach((s) => {
    if (s.date === todayDateStr) return; // exclude today
    const d = parseSaleDate(s);
    if (getKarachiWeekday(d) === todayWeekdayIdx) {
      const entry = sameWeekdayDatesMap.get(s.date) || { revenue: 0, tx: 0, sales: [] };
      entry.revenue += s.amount || 0;
      entry.tx += 1;
      entry.sales.push(s);
      sameWeekdayDatesMap.set(s.date, entry);
    }
  });

  const sortedHistoricalDates = Array.from(sameWeekdayDatesMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // most recent first
    .slice(0, 4);

  // Compute average total revenue of historical completed same weekdays
  const historicalTotals = sortedHistoricalDates.map(([, v]) => v.revenue);
  const historicalAvg =
    historicalTotals.length > 0
      ? historicalTotals.reduce((a, b) => a + b, 0) / historicalTotals.length
      : todayActualRevenue * 1.2 || 20000;

  // Build hourly cumulative distribution baseline across historical same weekdays
  const hourlyCumulativeMap: number[] = new Array(24).fill(0);
  let totalHistoricalSalesCount = 0;

  sortedHistoricalDates.forEach(([, data]) => {
    data.sales.forEach((s) => {
      const h = getKarachiHour(parseSaleDate(s));
      hourlyCumulativeMap[h] += s.amount || 0;
      totalHistoricalSalesCount += 1;
    });
  });

  const totalHistRevenue = hourlyCumulativeMap.reduce((a, b) => a + b, 0) || 1;
  const cumulativePct: number[] = new Array(24).fill(0);
  let running = 0;
  for (let h = 0; h < 24; h++) {
    running += hourlyCumulativeMap[h];
    cumulativePct[h] = running / totalHistRevenue;
  }

  // Current percentage of day completed based on historical pattern
  const accruedPctAtCurrentHour = Math.max(0.05, Math.min(0.98, cumulativePct[currentHour] || 0.5));

  // Run-rate projection
  let expectedDailyRevenue: number;
  let remainingExpectedRevenue: number;

  if (todayActualRevenue > 0) {
    // Weighted combination of actual run-rate pace and historical baseline
    const projectedFromRunRate = todayActualRevenue / accruedPctAtCurrentHour;
    expectedDailyRevenue = Math.round(projectedFromRunRate * 0.6 + historicalAvg * 0.4);
    remainingExpectedRevenue = Math.max(0, expectedDailyRevenue - todayActualRevenue);
  } else {
    expectedDailyRevenue = Math.round(historicalAvg);
    remainingExpectedRevenue = expectedDailyRevenue;
  }

  // Trajectory curve (0 to 23 hours)
  const todayHourlyMap: number[] = new Array(24).fill(0);
  todaySales.forEach((s) => {
    const h = getKarachiHour(parseSaleDate(s));
    todayHourlyMap[h] += s.amount || 0;
  });

  let runningActual = 0;
  const trajectory = Array.from({ length: 24 }, (_, h) => {
    const hourLabel = `${String(h).padStart(2, "0")}:00`;
    runningActual += todayHourlyMap[h];

    const historicalBaseline = Math.round(historicalAvg * cumulativePct[h]);

    let actualVal: number | null = null;
    let projectedVal: number | null = null;

    if (h <= currentHour) {
      actualVal = runningActual;
      projectedVal = runningActual;
    } else {
      // Forecast continuation curve from current actual to expectedDailyRevenue
      const remainingProgress = (cumulativePct[h] - accruedPctAtCurrentHour) / (1 - accruedPctAtCurrentHour);
      projectedVal = Math.round(todayActualRevenue + remainingExpectedRevenue * Math.max(0, remainingProgress));
    }

    return {
      hour: h,
      hourLabel,
      actual: actualVal,
      projected: projectedVal,
      historicalBaseline,
    };
  });

  // Confidence assessment
  let confidence: "High" | "Medium" | "Low" = "Low";
  let confidenceExplanation = "";

  if (sortedHistoricalDates.length >= 3) {
    confidence = "High";
    confidenceExplanation = `Model trained on ${sortedHistoricalDates.length} historical ${todayWeekdayName}s. High statistical reliability.`;
  } else if (sortedHistoricalDates.length >= 1) {
    confidence = "Medium";
    confidenceExplanation = `Based on ${sortedHistoricalDates.length} prior ${todayWeekdayName}. Medium confidence window.`;
  } else {
    confidence = "Low";
    confidenceExplanation = `Limited historical data for ${todayWeekdayName}. Using generalized run-rate baseline.`;
  }

  // Same Weekday History drilldown
  const sameWeekdayHistory: WeekdayComparisonEntry[] = [];

  // Today
  sameWeekdayHistory.push({
    label: `Today (${todayWeekdayName})`,
    date: todayDateStr,
    revenue: todayActualRevenue,
    transactions: todayActualTransactions,
    atv: todayActualTransactions > 0 ? todayActualRevenue / todayActualTransactions : 0,
    elapsedHoursRevenue: todayActualRevenue,
    differenceFromAvgPercent:
      historicalAvg > 0 ? ((todayActualRevenue - historicalAvg) / historicalAvg) * 100 : undefined,
  });

  sortedHistoricalDates.forEach(([date, data], idx) => {
    // Calculate sales up to current hour on that day for fair comparison
    const elapsedRev = data.sales
      .filter((s) => getKarachiHour(parseSaleDate(s)) <= currentHour)
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    sameWeekdayHistory.push({
      label: `${idx + 1} Week${idx > 0 ? "s" : ""} Ago`,
      date,
      revenue: data.revenue,
      transactions: data.tx,
      atv: data.tx > 0 ? data.revenue / data.tx : 0,
      elapsedHoursRevenue: elapsedRev,
      differenceFromAvgPercent:
        historicalAvg > 0 ? ((data.revenue - historicalAvg) / historicalAvg) * 100 : 0,
    });
  });

  // Upcoming 7 Days Forecast
  // Calculate average revenue by weekday from recent history
  const weekdayAvgMap = new Map<number, number>();
  fourWeekHistorySales.forEach((s) => {
    const d = parseSaleDate(s);
    const w = getKarachiWeekday(d);
    weekdayAvgMap.set(w, (weekdayAvgMap.get(w) || 0) + (s.amount || 0));
  });

  // Total occurrences of each weekday in fourWeekHistorySales
  const weekdayOccurrences = new Map<number, Set<string>>();
  fourWeekHistorySales.forEach((s) => {
    const d = parseSaleDate(s);
    const w = getKarachiWeekday(d);
    if (!weekdayOccurrences.has(w)) weekdayOccurrences.set(w, new Set());
    if (s.date) weekdayOccurrences.get(w)?.add(s.date);
  });

  const upcomingWeekForecast = Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(todayDate.getTime() + (i + 1) * 86400000);
    const dateStr = getKarachiDateString(targetDate);
    const wIdx = getKarachiWeekday(targetDate);
    const occurrences = Math.max(1, weekdayOccurrences.get(wIdx)?.size || 1);
    const avgRev = Math.round((weekdayAvgMap.get(wIdx) || 0) / occurrences) || Math.round(historicalAvg);

    return {
      date: dateStr,
      weekdayName: WEEKDAYS[wIdx],
      expectedRevenue: avgRev,
      isBusyDay: avgRev > historicalAvg * 1.1,
    };
  });

  const expectedTransactions =
    todayActualTransactions > 0
      ? Math.round((todayActualTransactions / accruedPctAtCurrentHour))
      : Math.round(expectedDailyRevenue / 800);

  return {
    currentHour,
    currentLocalTime,
    todayActualRevenue,
    todayActualTransactions,
    historicalSameWeekdayAvg: Math.round(historicalAvg),
    expectedDailyRevenue,
    remainingExpectedRevenue,
    expectedTransactions,
    confidence,
    confidenceExplanation,
    trajectory,
    sameWeekdayHistory,
    upcomingWeekForecast,
  };
}

// -------------------------------------------------------------
// Automated Algorithmic Business Insights
// -------------------------------------------------------------

export function generateBusinessInsights(
  kpis: ExecutiveKPISummary,
  weekdayData: { weekdays: WeekdayStat[]; bestWeekday: WeekdayStat | null; lowestWeekday: WeekdayStat | null },
  hourlyData: { hourly: HourlyStat[]; peakHour: HourlyStat | null; dayparts: DaypartBreakdown[] },
  productsData: { topMedicines: ProductPerformance[]; categoryDistribution: Array<{ category: string; sharePercent: number }> },
  doctorData: {
    totalRevenue: number;
    revenueSharePercent: number;
    doctorBreakdown: DoctorPerformance[];
    consultationCount: number;
    averageFee: number;
  },
  forecast: IntradayForecast
): BusinessInsight[] {
  const insights: BusinessInsight[] = [];

  // 1. Day of Week Insight (Best Weekday)
  if (weekdayData.bestWeekday && weekdayData.bestWeekday.averageRevenue > 0) {
    const avgOther =
      weekdayData.weekdays
        .filter((w) => w !== weekdayData.bestWeekday)
        .reduce((sum, w) => sum + w.averageRevenue, 0) / 6;

    const lift = avgOther > 0 ? ((weekdayData.bestWeekday.averageRevenue - avgOther) / avgOther) * 100 : 0;

    insights.push({
      id: "insight-weekday-peak",
      type: "highlight",
      category: "Timing",
      title: `${weekdayData.bestWeekday.name} is Your Top Performing Day`,
      summary: `${weekdayData.bestWeekday.name} generates an average of PKR ${Math.round(weekdayData.bestWeekday.averageRevenue).toLocaleString()} per day, outperforming the rest of the week by +${lift.toFixed(1)}%.`,
      metric: `PKR ${Math.round(weekdayData.bestWeekday.averageRevenue).toLocaleString()} / day`,
      benchmark: `Avg other days: PKR ${Math.round(avgOther).toLocaleString()}`,
    });
  }

  // 2. Sunday Activity Check (Direct user requirement)
  const sundayStat = weekdayData.weekdays.find((w) => w.index === 0);
  if (sundayStat && sundayStat.totalRevenue > 0) {
    insights.push({
      id: "insight-sunday-performance",
      type: "positive",
      category: "Operations",
      title: "Sunday Business Continuity Confirmed",
      summary: `Sundays accounted for PKR ${Math.round(sundayStat.totalRevenue).toLocaleString()} (${sundayStat.sharePercent.toFixed(1)}% of total period revenue) with ${sundayStat.transactionCount} transactions recorded.`,
      metric: `${sundayStat.sharePercent.toFixed(1)}% revenue share`,
      benchmark: `${sundayStat.transactionCount} transactions`,
    });
  }

  // 3. Peak Hourly Velocity Window
  if (hourlyData.peakHour && hourlyData.peakHour.revenue > 0) {
    insights.push({
      id: "insight-peak-hour",
      type: "highlight",
      category: "Timing",
      title: `Prime Dispensing Hour at ${hourlyData.peakHour.label}`,
      summary: `Highest hourly revenue density occurs at ${hourlyData.peakHour.label}, generating PKR ${Math.round(hourlyData.peakHour.revenue).toLocaleString()} with ${hourlyData.peakHour.transactions} sales.`,
      metric: `${hourlyData.peakHour.label}`,
      benchmark: `PKR ${Math.round(hourlyData.peakHour.revenue).toLocaleString()}`,
    });
  }

  // 4. Evening Daypart Contribution
  const eveningPart = hourlyData.dayparts.find((d) => d.name.includes("Evening"));
  if (eveningPart && eveningPart.sharePercent > 25) {
    insights.push({
      id: "insight-daypart-evening",
      type: "positive",
      category: "Timing",
      title: "Evening Sales Window Dominance",
      summary: `The 17:00 to 22:00 evening block delivers ${eveningPart.sharePercent.toFixed(1)}% of daily revenue (PKR ${Math.round(eveningPart.revenue).toLocaleString()}). Optimal window for full counter staffing.`,
      metric: `${eveningPart.sharePercent.toFixed(1)}% volume share`,
      benchmark: "17:00 - 22:00 Window",
    });
  }

  // 5. Doctor Consultation Contribution
  if (doctorData.totalRevenue > 0) {
    const docPercent = doctorData.revenueSharePercent;
    insights.push({
      id: "insight-doctor-share",
      type: docPercent > 15 ? "positive" : "neutral",
      category: "Doctors",
      title: `Doctor Fees Represent ${docPercent.toFixed(1)}% of Revenue`,
      summary: `Clinical consultations brought in PKR ${Math.round(doctorData.totalRevenue).toLocaleString()} across ${doctorData.consultationCount} patient visits at zero inventory cost.`,
      metric: `PKR ${Math.round(doctorData.totalRevenue).toLocaleString()}`,
      benchmark: `${doctorData.consultationCount} consultations (Avg PKR ${Math.round(doctorData.averageFee)})`,
    });
  }

  // 6. Top Medicines Concentration (Pareto check)
  if (productsData.topMedicines.length >= 3) {
    const top3Rev = productsData.topMedicines.slice(0, 3).reduce((s, m) => s + m.revenue, 0);
    const top3Share = productsData.topMedicines.slice(0, 3).reduce((s, m) => s + m.sharePercent, 0);
    const topMedName = productsData.topMedicines[0]?.name || "Lead Medicine";

    insights.push({
      id: "insight-medicine-concentration",
      type: top3Share > 40 ? "caution" : "positive",
      category: "Products",
      title: `High Velocity SKU: ${topMedName}`,
      summary: `Top 3 pharmaceutical items account for ${top3Share.toFixed(1)}% of total medicine revenue (PKR ${Math.round(top3Rev).toLocaleString()}). Ensure safety stock replenishment.`,
      metric: `${top3Share.toFixed(1)}% share in top 3`,
      benchmark: `Top SKU: ${topMedName}`,
    });
  }

  // 7. Average Transaction Value (ATV) Trend
  if (kpis.atvGrowthPercent !== null && Math.abs(kpis.atvGrowthPercent) > 2) {
    const isUp = kpis.atvGrowthPercent > 0;
    insights.push({
      id: "insight-atv-trend",
      type: isUp ? "positive" : "caution",
      category: "Revenue",
      title: `Basket Size (ATV) is ${isUp ? "Up" : "Down"} ${Math.abs(kpis.atvGrowthPercent).toFixed(1)}%`,
      summary: `Average transaction value changed from PKR ${Math.round(kpis.priorAverageTransactionValue).toLocaleString()} to PKR ${Math.round(kpis.averageTransactionValue).toLocaleString()} compared to previous period.`,
      metric: `PKR ${Math.round(kpis.averageTransactionValue).toLocaleString()}`,
      benchmark: `${isUp ? "+" : ""}${kpis.atvGrowthPercent.toFixed(1)}% period-over-period`,
    });
  }

  // 8. Intraday Pace vs Historical Same-Weekday
  if (forecast.todayActualRevenue > 0 && forecast.historicalSameWeekdayAvg > 0) {
    const diff = ((forecast.expectedDailyRevenue - forecast.historicalSameWeekdayAvg) / forecast.historicalSameWeekdayAvg) * 100;
    const ahead = diff >= 0;
    insights.push({
      id: "insight-forecast-pace",
      type: ahead ? "positive" : "neutral",
      category: "Revenue",
      title: `Today is Pacing ${ahead ? "+" : ""}${diff.toFixed(1)}% vs Historical ${WEEKDAYS[getKarachiWeekday(new Date())]} Baseline`,
      summary: `Actual revenue so far is PKR ${Math.round(forecast.todayActualRevenue).toLocaleString()}. Projected daily finish is PKR ${Math.round(forecast.expectedDailyRevenue).toLocaleString()} vs normal baseline of PKR ${Math.round(forecast.historicalSameWeekdayAvg).toLocaleString()}.`,
      metric: `Expected PKR ${Math.round(forecast.expectedDailyRevenue).toLocaleString()}`,
      benchmark: `Historical Avg: PKR ${Math.round(forecast.historicalSameWeekdayAvg).toLocaleString()}`,
    });
  }

  return insights;
}
