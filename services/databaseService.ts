
import { DATABASE_SCRIPT_URL, ATTENDANCE_SCRIPT_URL, ATTENDANCE_CSV_URL } from '../constants';

// Tipe data yang bisa dikirim
// Ditambahkan: CAROUSEL agar slide bisa diatur admin
type ConfigType = 'NEWS' | 'DEPTS' | 'LEADERSHIP' | 'DOCS' | 'RECRUITMENT' | 'PAWN' | 'TERMS' | 'FORMS' | 'ATTENDANCE' | 'INVENTORY_COMMON' | 'INVENTORY_BLACK' | 'PERMISSIONS' | 'CAROUSEL' | 'RESPONSES' | 'WEBHOOKS';

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
  CAROUSEL: 'Database_Carousel',
  RESPONSES: 'Database_Responses',
  WEBHOOKS: 'Database_Webhooks'
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
 * Mengambil data terbaru dari Database (Turso via Express API)
 */
export const fetchFromDatabase = async (type: ConfigType, params?: any) => {
  try {
    let url = `/api/${type.toLowerCase()}`;
    
    // Special mapping for generic configs
    const genericConfigs = ['DEPTS', 'LEADERSHIP', 'DOCS', 'FORMS', 'TERMS', 'PERMISSIONS', 'CAROUSEL', 'PAWN', 'WEBHOOKS'];
    if (genericConfigs.includes(type)) {
      url = `/api/config/${type}`;
    } else if (type === 'RESPONSES') {
      url = '/api/responses';
      if (params?.batch) {
        url += `?batch=${encodeURIComponent(params.batch)}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[Database Error] Gagal load ${type} dari Turso.`, error);
    return null;
  }
};

/**
 * Menyimpan data ke Database (Turso via Express API)
 */
export const saveToDatabase = async (type: ConfigType, data: any) => {
  try {
    let url = `/api/${type.toLowerCase()}`;
    let payload = data;

    // Special mapping for generic configs
    const genericConfigs = ['DEPTS', 'LEADERSHIP', 'DOCS', 'FORMS', 'TERMS', 'PERMISSIONS', 'CAROUSEL', 'PAWN', 'WEBHOOKS'];
    if (genericConfigs.includes(type)) {
      url = `/api/config/${type}`;
      payload = { value: data };
    } else if (type === 'RESPONSES') {
      url = '/api/responses';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (error) {
    console.error(`Gagal menyimpan ${type} ke Turso:`, error);
    return false;
  }
};
