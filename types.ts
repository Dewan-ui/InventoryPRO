export type ProductCategory = 'power-stations' | 'accessories' | 'both';

export interface InventoryRecord {
  date: string;
  branchName: string;
  deviceName: string;
  stockIn: number;
  stockOut: number;
  currentCount: number;
  remarks?: string; // Captured from "Source", "Destination", or "Remarks" columns
  category?: 'power-station' | 'accessory'; // Derived during processing
}

export interface BranchInventory {
  branchName: string;
  totalItems: number;
  totalStockIn: number;
  totalStockOut: number;
  avgRetention: number;
  items: Record<string, number>;
}

export interface DailyStats {
  date: string;
  stockIn: number;
  stockOut: number;
  count: number;
}

export type ViewType = 'dashboard' | 'branches' | 'metrics' | 'settings';