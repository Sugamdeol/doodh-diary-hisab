
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MilkEntry, MonthlyStats, Vendor, VendorWithStats } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthYearString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthName(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
}

export function calculateMonthlyStats(entries: MilkEntry[]): MonthlyStats {
  let totalQuantity = 0;
  let totalAmount = 0;
  let totalPaid = 0;
  let pendingAmount = 0;
  
  entries.forEach(entry => {
    const amount = entry.quantity * entry.rate;
    totalQuantity += entry.quantity;
    totalAmount += amount;
    
    if (entry.isPaid) {
      totalPaid += amount;
    } else {
      pendingAmount += amount;
    }
  });
  
  // Calculate missed days in the month
  const firstEntry = entries[0];
  if (!firstEntry) {
    return {
      totalQuantity,
      totalAmount,
      totalPaid,
      pendingAmount,
      missedDays: 0,
      entries: []
    };
  }
  
  const entryMonth = new Date(firstEntry.date).getMonth();
  const entryYear = new Date(firstEntry.date).getFullYear();
  const daysInMonth = new Date(entryYear, entryMonth + 1, 0).getDate();
  
  const daysWithEntries = new Set(
    entries.map(entry => new Date(entry.date).getDate())
  );
  
  const missedDays = daysInMonth - daysWithEntries.size;
  
  return {
    totalQuantity,
    totalAmount,
    totalPaid,
    pendingAmount,
    missedDays,
    entries
  };
}

export function calculateVendorStats(vendor: Vendor, entries: MilkEntry[]): VendorWithStats {
  const vendorEntries = entries.filter(entry => entry.vendorId === vendor.id);
  
  let totalQuantity = 0;
  let totalAmount = 0;
  let pendingAmount = 0;
  
  vendorEntries.forEach(entry => {
    const amount = entry.quantity * entry.rate;
    totalQuantity += entry.quantity;
    totalAmount += amount;
    
    if (!entry.isPaid) {
      pendingAmount += amount;
    }
  });
  
  return {
    ...vendor,
    totalQuantity,
    totalAmount,
    pendingAmount
  };
}

export function downloadFile(content: string, fileName: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getWeekdayName(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', { weekday: 'short' });
}

export function hasEntryForToday(entries: MilkEntry[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return entries.some(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
}

export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
}

export function getMissedDaysForMonth(entries: MilkEntry[], year: number, month: number): number[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysWithEntries = new Set(
    entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
      })
      .map(entry => new Date(entry.date).getDate())
  );
  
  const missedDays: number[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    if (!daysWithEntries.has(day)) {
      missedDays.push(day);
    }
  }
  
  return missedDays;
}
