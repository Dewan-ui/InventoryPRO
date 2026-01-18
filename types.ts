
export interface InventoryRecord {
  date: string;
  branchName: string;
  deviceName: string;
  stockIn: number;
  stockOut: number;
  currentCount: number;
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

export type ViewType = 'dashboard' | 'inventory' | 'metrics' | 'settings';
