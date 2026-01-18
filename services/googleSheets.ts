
import { InventoryRecord } from '../types';
import { APP_CONFIG } from '../config';

/**
 * FETCHING MODES:
 * 1. CSV Export (Public): Fast, no API key needed, but sheet MUST be public.
 * 2. Sheets API v4 (Private): Requires API Key. Works with private sheets 
 *    if the sheet is shared with the API Key's service account or restricted correctly.
 */

export const fetchInventoryData = async (options?: { apiKey?: string; usePrivateAPI?: boolean }): Promise<InventoryRecord[]> => {
  const SHEET_ID = (import.meta as any).env?.VITE_SHEET_ID || APP_CONFIG.DEFAULT_SHEET_ID;
  const GID = (import.meta as any).env?.VITE_SHEET_GID || APP_CONFIG.DEFAULT_SHEET_GID;

  try {
    // MODE: Official Google Sheets API v4 (JSON)
    if (options?.usePrivateAPI && options?.apiKey) {
      const RANGE = 'A:Z'; // Fetch the whole sheet
      const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${options.apiKey}`;
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API Connection Failed');
      }
      
      const data = await response.json();
      return transformAPIV4(data.values);
    }

    // MODE: CSV Export (Legacy/Public)
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch public sheet data');
    
    const csvText = await response.text();
    
    // Safety check for private sheet HTML response
    if (csvText.trim().toLowerCase().startsWith('<!doctype html') || csvText.includes('<html')) {
      throw new Error('ACCESS_DENIED: Sheet is private. Use Secure Sync mode.');
    }

    const rows = parseCSV(csvText);
    return transformRowsToRecords(rows);

  } catch (error: any) {
    console.error('Data Service Error:', error.message);
    throw error;
  }
};

// --- UTILITIES ---

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
      if (char === '"') inQuote = !inQuote;
      else if (char === ',' && !inQuote) {
        row.push(cur.trim().replace(/^"|"$/g, ''));
        cur = "";
      } else cur += char;
    }
    row.push(cur.trim().replace(/^"|"$/g, ''));
    result.push(row);
  }
  return result;
}

function transformAPIV4(rows: string[][]): InventoryRecord[] {
  if (!rows || rows.length < 2) return [];
  return transformRowsToRecords(rows);
}

function transformRowsToRecords(rows: string[][]): InventoryRecord[] {
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
    const sanitized = String(val).replace(/[^\d.-]/g, '');
    return parseInt(sanitized) || 0;
  };

  return rows.slice(1).map(values => ({
    date: idx.date !== -1 ? values[idx.date] : '',
    branchName: idx.branch !== -1 ? values[idx.branch] : 'Unknown',
    deviceName: idx.device !== -1 ? values[idx.device] : 'Unknown',
    stockIn: idx.in !== -1 ? cleanNum(values[idx.in]) : 0,
    stockOut: idx.out !== -1 ? cleanNum(values[idx.out]) : 0,
    currentCount: idx.count !== -1 ? cleanNum(values[idx.count]) : 0,
  })).filter(record => record.branchName && record.branchName !== 'Unknown');
}
