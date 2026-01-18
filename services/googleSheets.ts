
import { InventoryRecord } from '../types';
import { APP_CONFIG } from '../config';

export const fetchInventoryData = async (options?: { 
  apiKey?: string; 
  accessToken?: string;
  usePrivateAPI?: boolean 
}): Promise<InventoryRecord[]> => {
  const SHEET_ID = import.meta.env.VITE_SHEET_ID || APP_CONFIG.DEFAULT_SHEET_ID;
  const GID = import.meta.env.VITE_SHEET_GID || APP_CONFIG.DEFAULT_SHEET_GID;

  try {
    // --- MODE: Official Google Sheets API v4 (Private or Multi-Tab) ---
    if (options?.usePrivateAPI && (options?.apiKey || options?.accessToken)) {
      const headers: HeadersInit = {};
      if (options.accessToken) {
        headers['Authorization'] = `Bearer ${options.accessToken}`;
      }

      const queryParams = options.apiKey ? `?key=${options.apiKey}` : '';
      const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${queryParams}`;
      
      const metaResponse = await fetch(metaUrl, { headers });
      
      if (metaResponse.status === 403) {
        throw new Error('ACCESS_DENIED: The sheet is private. Step 1: Create a Service Account. Step 2: Ask the owner to share the sheet with that email.');
      }
      
      if (metaResponse.status === 401) {
        throw new Error('TOKEN_EXPIRED: Your OAuth Access Token has expired. Please refresh it in the Cloud Console.');
      }

      if (!metaResponse.ok) throw new Error(`Google API Error: ${metaResponse.statusText}`);
      
      const metaData = await metaResponse.json();
      const allRecords: InventoryRecord[] = [];
      const sheetNames = metaData.sheets.map((s: any) => s.properties.title);

      for (const sheetName of sheetNames) {
        if (sheetName.toLowerCase().includes('summary') || sheetName.toLowerCase().includes('config')) continue;

        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/'${sheetName}'!A:Z${queryParams}`;
        const dataResponse = await fetch(dataUrl, { headers });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          allRecords.push(...transformMatrixToRecords(data.values, sheetName));
        }
      }
      return allRecords;
    }

    // --- MODE: Public CSV Export (Fallback) ---
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch public sheet data');
    
    const csvText = await response.text();
    if (csvText.trim().toLowerCase().startsWith('<!doctype html')) {
      throw new Error('PRIVATE_SHEET_DETECTED: This sheet is not public. Please enable "Secure Sync" in Settings.');
    }

    const rows = parseCSV(csvText);
    return transformMatrixToRecords(rows, 'Main Hub');

  } catch (error: any) {
    console.error('Inventory Sync Engine Error:', error.message);
    throw error;
  }
};

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

function transformMatrixToRecords(rows: string[][], sourceSheet: string): InventoryRecord[] {
  if (!rows || rows.length < 1) return [];

  const headers = rows[0];
  const records: InventoryRecord[] = [];
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const productName = row[1];
    
    if (!productName || ['products', 's/n', 'total'].includes(productName.toLowerCase().trim())) continue;

    for (let j = 2; j < row.length; j++) {
      const cellValue = row[j];
      if (!cellValue || cellValue === '-' || cellValue === '0' || cellValue === '') continue;

      const header = headers[j] || '';
      const dateMatch = header.match(dateRegex);
      const date = dateMatch ? dateMatch[1] : 'Recent';
      
      const cleanValue = parseInt(cellValue.replace(/[^\d]/g, '')) || 0;

      const isClosingBalance = header.toLowerCase().includes('closing balance');
      const isInbound = header.toLowerCase().includes('inbound');
      
      let branchName = header.replace(dateRegex, '').replace(/[()]/g, '').trim();
      if (!branchName || branchName === '') branchName = sourceSheet;

      if (isClosingBalance) {
        records.push({
          date,
          branchName: sourceSheet,
          deviceName: productName,
          stockIn: 0,
          stockOut: 0,
          currentCount: cleanValue
        });
      } else if (isInbound) {
        records.push({
          date,
          branchName: 'Logistics/Central',
          deviceName: productName,
          stockIn: cleanValue,
          stockOut: 0,
          currentCount: 0
        });
      } else {
        records.push({
          date,
          branchName: branchName,
          deviceName: productName,
          stockIn: cleanValue,
          stockOut: 0,
          currentCount: cleanValue
        });
      }
    }
  }
  return records;
}
