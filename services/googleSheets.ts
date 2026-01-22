
import { InventoryRecord } from '../types';
import { APP_CONFIG } from '../config';

export const fetchInventoryData = async (options?: { 
  apiKey?: string; 
  accessToken?: string;
  usePrivateAPI?: boolean 
}): Promise<InventoryRecord[]> => {
  const SHEET_ID = (import.meta.env.VITE_SHEET_ID || APP_CONFIG.DEFAULT_SHEET_ID).trim();
  const systemApiKey = process.env.API_KEY;
  const effectiveApiKey = options?.apiKey || systemApiKey;
  const useV4Api = !!(effectiveApiKey || options?.accessToken);

  try {
    if (useV4Api) {
      const headers: HeadersInit = { 'Accept': 'application/json' };
      if (options?.accessToken) headers['Authorization'] = `Bearer ${options.accessToken}`;
      const queryParams = effectiveApiKey ? `?key=${effectiveApiKey}` : '';
      const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${queryParams}`;
      
      const metaResponse = await fetch(metaUrl, { headers });
      if (!metaResponse.ok) throw new Error(`Access Error: Verify the sheet is shared and your API key is correct.`);
      
      const metaData = await metaResponse.json();
      const allRecords: InventoryRecord[] = [];
      
      if (!metaData || !metaData.sheets) return [];
      const sheetNames = metaData.sheets.map((s: any) => s.properties?.title).filter(Boolean);

      for (const sheetName of sheetNames) {
        // Skip purely informational tabs
        const normalized = sheetName.toLowerCase().trim();
        if (['summary', 'config', 'dashboard', 'settings', 'instructions', 'template'].includes(normalized)) continue;
        
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/'${sheetName}'!A:Z${queryParams}`;
        const dataResponse = await fetch(dataUrl, { headers });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          if (data && data.values && data.values.length > 0) {
            // Force the branch name to be the literal sheet tab name
            allRecords.push(...transformMatrixToRecords(data.values, sheetName));
          }
        }
      }
      return allRecords;
    }

    // CSV Fallback
    const GID = (import.meta.env.VITE_SHEET_GID || APP_CONFIG.DEFAULT_SHEET_GID).trim();
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("CSV Export failed. Is the sheet public?");
    const csvText = await response.text();
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
  if (!rows || rows.length === 0) return [];

  // Find the header row (searching for common inventory keywords)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const rowStr = (rows[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('product') || rowStr.includes('sku') || rowStr.includes('device') || rowStr.includes('item')) {
      headerRowIndex = i;
      break;
    }
  }

  // Fallback if no header keyword is found
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headers = rows[headerRowIndex] || [];
  const records: InventoryRecord[] = [];
  const dateRegex = /(\d{1,2}\/\d{1,2})/;

  // Map critical indices
  const productIdx = headers.findIndex(h => h && /product|device|sku|item|name/i.test(h));
  const remarksIdx = headers.findIndex(h => h && /remark|source|destination|from|to|recipient|supplier/i.test(h));

  if (productIdx === -1) return [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[productIdx]) continue;
    
    const productName = row[productIdx]?.toString().trim();
    if (!productName || /total|s\/n|sn/i.test(productName)) continue;

    const rowRemarks = (remarksIdx !== -1 && row[remarksIdx]) ? row[remarksIdx].toString() : undefined;

    for (let j = 0; j < row.length; j++) {
      if (j === productIdx || j === remarksIdx) continue;

      const header = (headers[j] || '').toLowerCase();
      const cellValue = row[j];
      
      const isDate = dateRegex.test(header);
      const isBalance = /balance|qty|count|stock|on hand/i.test(header);
      const isInbound = /inbound|stock in|received|\+/i.test(header);
      const isOutbound = /outbound|stock out|issued|sold|-/i.test(header);

      if (!isDate && !isBalance && !isInbound && !isOutbound) continue;
      if (cellValue === undefined || cellValue === null || cellValue === '-' || cellValue === '') continue;

      const cleanValue = parseInt(cellValue.toString().replace(/[^\d]/g, '')) || 0;
      const dateMatch = (headers[j] || '').match(dateRegex);
      const date = dateMatch ? dateMatch[1] : 'Recent';

      records.push({
        date,
        branchName: sourceSheet, // This ensures tab-to-branch identity
        deviceName: productName,
        stockIn: isInbound ? cleanValue : 0,
        stockOut: isOutbound ? cleanValue : 0,
        currentCount: isBalance ? cleanValue : 0,
        remarks: rowRemarks,
        category: productName.toLowerCase().includes('station') ? 'power-station' : 'accessory'
      });
    }
  }
  
  // Consolidate duplicates in the same sheet (e.g., multiple entries for same product on same date)
  const grouped: Record<string, InventoryRecord> = {};
  records.forEach(r => {
    const key = `${r.date}-${r.branchName}-${r.deviceName}`;
    if (!grouped[key]) {
      grouped[key] = { ...r };
    } else {
      grouped[key].stockIn += r.stockIn;
      grouped[key].stockOut += r.stockOut;
      if (r.remarks) grouped[key].remarks = r.remarks;
      if (r.currentCount > 0) grouped[key].currentCount = r.currentCount;
    }
  });

  return Object.values(grouped);
}
