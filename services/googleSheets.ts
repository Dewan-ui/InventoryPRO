
import { InventoryRecord } from '../types';

// Use environment variables for production security
// In Vercel, you would add VITE_SHEET_ID and VITE_SHEET_GID in the project settings
const SHEET_ID = (import.meta as any).env?.VITE_SHEET_ID || '1-Cx94W5UBqGQRe-75ipAujtOn88vf6a4Ee0TmQpJ1lU';
const GID = (import.meta as any).env?.VITE_SHEET_GID || '1507375445';

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  const lines = text.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let cur = "";
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(cur.trim().replace(/^"|"$/g, ''));
        cur = "";
      } else {
        cur += char;
      }
    }
    row.push(cur.trim().replace(/^"|"$/g, ''));
    result.push(row);
  }
  return result;
}

export const fetchInventoryData = async (): Promise<InventoryRecord[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch sheet data');
    
    const csvText = await response.text();
    
    if (csvText.trim().toLowerCase().startsWith('<!doctype html') || csvText.includes('<html')) {
      console.error("DATA ACCESS ERROR: Sheet is not public.");
      return [];
    }

    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const idx = {
      date: headers.findIndex(h => h.includes('date')),
      branch: headers.findIndex(h => h.includes('branch')),
      device: headers.findIndex(h => h.includes('device') || h.includes('item')),
      in: headers.findIndex(h => h.includes('stock in') || h.includes('inflow')),
      out: headers.findIndex(h => h.includes('stock out') || h.includes('outflow')),
      count: headers.findIndex(h => h.includes('count') || h.includes('current') || h.includes('stock'))
    };

    const cleanNum = (val: string) => {
      if (!val) return 0;
      const sanitized = val.replace(/[^\d.-]/g, '');
      return parseInt(sanitized) || 0;
    };

    return rows.slice(1).map(values => ({
      date: idx.date !== -1 ? values[idx.date] : '',
      branchName: idx.branch !== -1 ? values[idx.branch] : 'Unknown',
      deviceName: idx.device !== -1 ? values[idx.device] : 'Unknown',
      stockIn: idx.in !== -1 ? cleanNum(values[idx.in]) : 0,
      stockOut: idx.out !== -1 ? cleanNum(values[idx.out]) : 0,
      currentCount: idx.count !== -1 ? cleanNum(values[idx.count]) : 0,
    })).filter(record => record.branchName && record.branchName !== 'Unknown' && record.branchName !== '');

  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
};
