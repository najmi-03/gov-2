
import { DATABASE_SCRIPT_URL } from '../constants';

// Tipe data yang bisa dikirim
// Ditambahkan: PERMISSIONS agar setting izin bisa online
type ConfigType = 'NEWS' | 'DEPTS' | 'LEADERSHIP' | 'DOCS' | 'RECRUITMENT' | 'PAWN' | 'TERMS' | 'FORMS' | 'ATTENDANCE' | 'INVENTORY_COMMON' | 'INVENTORY_BLACK' | 'PERMISSIONS';

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
  PERMISSIONS: 'Database_Config_Izin' // Tab baru untuk izin
};

/**
 * Mengambil data terbaru dari Google Sheet (Load)
 */
export const fetchFromDatabase = async (type: ConfigType) => {
  if (!DATABASE_SCRIPT_URL) return null;
  
  const sheetName = SHEET_MAPPING[type];

  try {
    // Tambahkan sheetName ke parameter GET agar script tahu tab mana yang dibaca
    const response = await fetch(`${DATABASE_SCRIPT_URL}?action=GET&sheetName=${sheetName}&type=${type}&_t=${Date.now()}`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    
    const json = await response.json();
    return json.data;
  } catch (error) {
    // console.warn(`[Offline Mode] Gagal load ${type} dari server (${sheetName}).`);
    return null;
  }
};

/**
 * Menyimpan data ke Google Sheet (Save)
 * Menggunakan Content-Type text/plain dan menyertakan sheetName.
 */
export const saveToDatabase = async (type: ConfigType, data: any) => {
  if (!DATABASE_SCRIPT_URL) {
    alert("Database URL belum disetting!");
    return false;
  }

  const sheetName = SHEET_MAPPING[type];

  try {
    await fetch(DATABASE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({
        action: 'SAVE',
        type: type,
        sheetName: sheetName, // PERBAIKAN: Mengirim nama sheet secara eksplisit
        data: data
      })
    });
    return true;
  } catch (error) {
    console.error(`Gagal menyimpan ${type}:`, error);
    // alert("Gagal terhubung ke server. Periksa internet Anda.");
    return false;
  }
};
