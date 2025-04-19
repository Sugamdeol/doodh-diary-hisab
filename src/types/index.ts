
export interface Vendor {
  id: string;
  name: string;
  defaultRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface MilkEntry {
  id: string;
  date: string;
  quantity: number;
  rate: number;
  vendorId: string;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySettings {
  id: string;
  month: string; // Format: YYYY-MM
  defaultRate: number;
  defaultVendorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyStats {
  totalQuantity: number;
  totalAmount: number;
  totalPaid: number;
  pendingAmount: number;
  missedDays: number;
  entries: MilkEntry[];
}

export interface VendorWithStats extends Vendor {
  totalQuantity: number;
  totalAmount: number;
  pendingAmount: number;
}

export type TimeFrame = 'all' | 'month' | 'year';
