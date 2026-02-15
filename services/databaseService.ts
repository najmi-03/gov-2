
import { DATABASE_SCRIPT_URL, ATTENDANCE_SCRIPT_URL, ATTENDANCE_CSV_URL } from '../constants';

// Tipe data yang bisa dikirim
// Ditambahkan: CAROUSEL agar slide bisa diatur admin
type ConfigType = 'NEWS' | 'DEPTS' | 'LEADERSHIP' | 'DOCS' | 'RECRUITMENT' | 'PAWN' | 'TERMS' | 'FORMS' | 'ATTENDANCE' | 'INVENTORY_COMMON' | 'INVENTORY_BLACK' | 'PERMISSIONS' | 'CAROUSEL';

// MAPPING PENTING: Menentukan nama Tab/Sheet di Google Spreadsheet tujuan.
// Admin WAJIB membuat Tab dengan nama-nama ini di Spreadsheet Database.
const SHEET_MAPPING: Record<ConfigType, string> = {
  NEWS: 'Database_Berita',
  DEPTS: 'Database_Departemen',
  LEADERSHIP: 'Database_Struktural',
  DOCS: 'Database_Dokumen',
  RECRUITMENT: 'Database_Config_Rekrutmen',
  PAWN: 'Database_Harga_Pawn',
  TERMS: 'Database_Terms',
  FORMS: 'Database_Layanan_Form',
  ATTENDANCE: 'Database_Absensi',
  INVENTORY_COMMON: 'Database_Loker_Umum',
  INVENTORY_BLACK: 'Database_Loker_Hitam',
  PERMISSIONS: 'Database_Config_Izin',
  CAROUSEL: 'Database_Carousel' // Tab baru
};

// Helper untuk parsing CSV text menjadi Array of Object (JSON)
const csvToJson = (csv: string) => {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Logic split CSV yang menangani koma di dalam tanda kutip
    const row: string[] = [];
    let inQuote = false;
    let token = '';
    
    for(let j=0; j<line.length; j++) {
        const char = line[j];
        if(char === '"') {
            if(inQuote && line[j+1] === '"') {
                // Escape quote "" menjadi "
                token += '"';
                j++;
            } else {
                inQuote = !inQuote;
            }
        } else if(char === ',' && !inQuote) {
            row.push(token);
            token = '';
        } else {
            token += char;
        }
    }
    row.push(token); // Push token terakhir

    const obj: any = {};
    headers.forEach((header, index) => {
      let val = row[index] ? row[index].trim() : '';
      obj[header] = val;
    });
    result.push(obj);
  }
  return result;
};

/**
 * Mengambil data terbaru dari Google Sheet (Load)
 * customSheetName (opsional): Untuk override nama sheet target (misal: Absensi_Februari_2026)
 */
export const fetchFromDatabase = async (type: ConfigType, customSheetName?: string) => {
  // KHUSUS ATTENDANCE (READ): Gunakan CSV URL jika tersedia untuk Treasury Admin
  if (type === 'ATTENDANCE' && ATTENDANCE_CSV_URL && !customSheetName) {
      try {
          const response = await fetch(ATTENDANCE_CSV_URL, { cache: 'no-store' });
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
          const text = await response.text();
          if(text.trim().startsWith('<') || text.trim().length === 0) throw new Error("Format CSV Invalid");
          return csvToJson(text);
      } catch (error) {
          console.warn(`[Offline/Error] Gagal load CSV Absensi. Mencoba fallback ke Script URL.`, error);
      }
  }

  // KHUSUS ATTENDANCE (FALLBACK/DYNAMIC): Gunakan Script URL terpisah
  const targetUrl = (type === 'ATTENDANCE' && ATTENDANCE_SCRIPT_URL) 
    ? ATTENDANCE_SCRIPT_URL 
    : DATABASE_SCRIPT_URL;

  if (!targetUrl) return null;
  
  const sheetName = customSheetName || SHEET_MAPPING[type];

  try {
    // KOREKSI: Menghapus custom headers untuk menghindari CORS Preflight Error pada Google Apps Script
    // Menggunakan timestamp (_t) saja sudah cukup untuk bypass cache browser
    const response = await fetch(`${targetUrl}?action=GET&sheetName=${sheetName}&type=${type}&_t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
    });
    
    if (!response.ok) throw new Error("Gagal mengambil data");
    
    // IMPORTANT: Parse as text first to check for HTML errors (Google Error Pages)
    const text = await response.text();
    
    // Check if response is HTML (Error page)
    if (text.trim().startsWith('<')) {
        console.error(`[Database Error] Server returned HTML instead of JSON for ${sheetName}. Possible reasons: Script Error, Wrong Sheet Name, or Auth Issue.`);
        return null; 
    }

    try {
        const json = JSON.parse(text);
        return Array.isArray(json) ? json : (json.data || []);
    } catch (parseError) {
        console.error(`[Database Error] Invalid JSON format from ${sheetName}:`, text.substring(0, 100));
        return null;
    }

  } catch (error) {
    console.warn(`[Offline/Error] Gagal load ${type} dari server (${sheetName}).`, error);
    return null;
  }
};

/**
 * Menyimpan data ke Google Sheet (Save)
 * Menggunakan Content-Type text/plain dan menyertakan sheetName.
 */
export const saveToDatabase = async (type: ConfigType, data: any) => {
  const targetUrl = (type === 'ATTENDANCE' && ATTENDANCE_SCRIPT_URL) 
    ? ATTENDANCE_SCRIPT_URL 
    : DATABASE_SCRIPT_URL;

  if (!targetUrl) {
    alert("Database URL belum disetting!");
    return false;
  }

  const sheetName = SHEET_MAPPING[type];

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({
        action: 'SAVE',
        type: type,
        sheetName: sheetName,
        data: data
      })
    });
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan ${type}:`, error);
    return false;
  }
};
