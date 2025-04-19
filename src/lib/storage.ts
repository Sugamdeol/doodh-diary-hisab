
import { MilkEntry, MonthlySettings, Vendor } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  VENDORS: 'mera-doodh-hisab-vendors',
  MILK_ENTRIES: 'mera-doodh-hisab-entries',
  MONTHLY_SETTINGS: 'mera-doodh-hisab-monthly-settings'
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} to localStorage:`, error);
  }
};

// Vendors
export const getVendors = (): Vendor[] => {
  return getItem<Vendor[]>(STORAGE_KEYS.VENDORS, []);
};

export const saveVendor = (vendor: Vendor): Vendor => {
  const vendors = getVendors();
  const existingIndex = vendors.findIndex(v => v.id === vendor.id);
  
  if (existingIndex >= 0) {
    vendors[existingIndex] = { ...vendor, updatedAt: new Date().toISOString() };
  } else {
    vendors.push(vendor);
  }
  
  setItem(STORAGE_KEYS.VENDORS, vendors);
  return vendor;
};

export const deleteVendor = (id: string): boolean => {
  const vendors = getVendors();
  const newVendors = vendors.filter(v => v.id !== id);
  
  if (newVendors.length !== vendors.length) {
    setItem(STORAGE_KEYS.VENDORS, newVendors);
    return true;
  }
  return false;
};

// Milk Entries
export const getMilkEntries = (): MilkEntry[] => {
  return getItem<MilkEntry[]>(STORAGE_KEYS.MILK_ENTRIES, []);
};

export const saveMilkEntry = (entry: MilkEntry): MilkEntry => {
  const entries = getMilkEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    entries.push(entry);
  }
  
  setItem(STORAGE_KEYS.MILK_ENTRIES, entries);
  return entry;
};

export const deleteMilkEntry = (id: string): boolean => {
  const entries = getMilkEntries();
  const newEntries = entries.filter(e => e.id !== id);
  
  if (newEntries.length !== entries.length) {
    setItem(STORAGE_KEYS.MILK_ENTRIES, newEntries);
    return true;
  }
  return false;
};

// Get entries for a specific month
export const getMilkEntriesForMonth = (year: number, month: number): MilkEntry[] => {
  const entries = getMilkEntries();
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const yearMonthPrefix = `${year}-${monthStr}`;
  
  return entries.filter(entry => entry.date.startsWith(yearMonthPrefix));
};

// Monthly Settings
export const getMonthlySettings = (): MonthlySettings[] => {
  return getItem<MonthlySettings[]>(STORAGE_KEYS.MONTHLY_SETTINGS, []);
};

export const getMonthlySettingByMonth = (yearMonth: string): MonthlySettings | undefined => {
  const settings = getMonthlySettings();
  return settings.find(s => s.month === yearMonth);
};

export const saveMonthlySettings = (settings: MonthlySettings): MonthlySettings => {
  const allSettings = getMonthlySettings();
  const existingIndex = allSettings.findIndex(s => s.id === settings.id);
  
  if (existingIndex >= 0) {
    allSettings[existingIndex] = { ...settings, updatedAt: new Date().toISOString() };
  } else {
    allSettings.push(settings);
  }
  
  setItem(STORAGE_KEYS.MONTHLY_SETTINGS, allSettings);
  return settings;
};

// Backup & Restore
export const exportData = (): string => {
  const data = {
    vendors: getVendors(),
    milkEntries: getMilkEntries(),
    monthlySettings: getMonthlySettings(),
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(data);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.vendors) setItem(STORAGE_KEYS.VENDORS, data.vendors);
    if (data.milkEntries) setItem(STORAGE_KEYS.MILK_ENTRIES, data.milkEntries);
    if (data.monthlySettings) setItem(STORAGE_KEYS.MONTHLY_SETTINGS, data.monthlySettings);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Helper for CSV export
export const exportEntriesAsCSV = (entries: MilkEntry[]): string => {
  const vendors = getVendors();
  const vendorMap = vendors.reduce((acc, vendor) => {
    acc[vendor.id] = vendor.name;
    return acc;
  }, {} as Record<string, string>);

  // CSV Header
  let csv = 'Date,Quantity (L),Rate (₹),Amount (₹),Vendor,Paid,Notes\n';
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Add entry rows
  sortedEntries.forEach(entry => {
    const formattedDate = new Date(entry.date).toLocaleDateString();
    const amount = entry.quantity * entry.rate;
    const vendorName = vendorMap[entry.vendorId] || 'Unknown';
    const paid = entry.isPaid ? 'Yes' : 'No';
    const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';
    
    csv += `${formattedDate},${entry.quantity},${entry.rate},${amount.toFixed(2)},${vendorName},${paid},${notes}\n`;
  });
  
  return csv;
};
