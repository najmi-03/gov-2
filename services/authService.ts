
import { AuthState, AdminRole } from '../types';

// ============================================================================
// KONFIGURASI SPREADSHEET (DATA STAFF TAMBAHAN)
// ============================================================================
// Link publikasi Google Sheet dalam format CSV untuk pembacaan data staff
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT67eGpJTmGET9tJnPSZQY3jL5qmSWdu8u0TCvgdaPXcf4YMZMalIqrdFcMKnPQ4StNd3TzgW83bCm3/pub?output=csv'; 

// ============================================================================
// DATABASE ADMIN UTAMA (LOKAL - SESUAI KEPALA DEPARTEMEN)
// ============================================================================
const LOCAL_STAFF_DATABASE = [
  // 1. Social Affairs (Humas/Media)
  { pin: "NEWS1", name: "Clara Beaumont", role: "NEWS_ADMIN" },

  // 2. Treasury - Bendahara Negara (Logistik & Harga Pasar)
  { pin: "PAWN1", name: "Victoria Glass", role: "PAWN_ADMIN" }, 

  // 3. Human Resource (Rekrutmen & Struktural)
  { pin: "HRD1", name: "Katherine Pierce", role: "HR_ADMIN" },

  // 4. Treasury - Kepala Dept (Penggajian/Keuangan)
  { pin: "MONEY1", name: "Julian Sterling", role: "TREASURY_ADMIN" },

  // 5. Home Affairs (Legislatif, Form & Perizinan)
  { pin: "DHA1", name: "Alaric Thorne", role: "DHA_ADMIN" },

  // 6. Super Admin (Presiden - AKSES PENUH KE SEMUA PANEL)
  { pin: "PRES1", name: "Marcus Vane", role: "SUPER_ADMIN" },

  // 7. Secretary of State (Super Admin Sekretariat)
  { pin: "SECSTATE1", name: "Dominic Sterling", role: "SECRETARY_OF_STATE" }
];

const GENERIC_STAFF_TITLES = [
  'presiden',
  'wakil presiden',
  'hom',
  'head of ministry',
  'dm',
  'deputy minister',
  'deputy of ministry',
  'executive',
  'staff senior',
  'senior staff',
  'senior',
  'staff',
  'intern',
  'magang',
  'minister',
  'governor'
];

export const loginWithSpreadsheet = async (pin: string): Promise<AuthState | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const localAdmin = LOCAL_STAFF_DATABASE.find(s => s.pin === pin);
  if (localAdmin) {
    return {
      isAdmin: true,
      staffName: localAdmin.name,
      role: localAdmin.role as AdminRole,
      nip: localAdmin.pin // Simpan PIN lokal sebagai NIP
    };
  }

  if (GOOGLE_SHEET_CSV_URL.startsWith('http')) {
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (response.ok) {
        const text = await response.text();
        const rows = text.split('\n');
        
        for (let i = 0; i < rows.length; i++) {
          if (i === 0 && (rows[i].toLowerCase().includes('pin') || rows[i].toLowerCase().includes('name'))) continue;

          const cols = rows[i].split(',');
          const rowPin = cols[0]?.replace(/["\r]/g, '').trim();
          
          if (rowPin === pin) {
            let col1 = cols[1]?.replace(/["\r]/g, '').trim() || '';
            let col2 = cols[2]?.replace(/["\r]/g, '').trim() || '';

            let detectedName = col1;
            let detectedRole = col2;

            const col1Lower = col1.toLowerCase();
            const col2Lower = col2.toLowerCase();

            const isCol1Role = GENERIC_STAFF_TITLES.some(t => col1Lower.includes(t)) || col1Lower.includes('admin') || col1Lower.includes('humas') || col1Lower.includes('secretary') || col1Lower.includes('sekretaris');
            const isCol2Role = GENERIC_STAFF_TITLES.some(t => col2Lower.includes(t)) || col2Lower.includes('admin') || col2Lower.includes('humas') || col2Lower.includes('secretary') || col2Lower.includes('sekretaris');

            if (isCol1Role && !isCol2Role) {
               detectedRole = col1;
               detectedName = col2;
            } else if (!isCol1Role && isCol2Role) {
               detectedRole = col2;
               detectedName = col1;
            } else {
               detectedRole = col2;
               detectedName = col1;
            }

            let assignedRole: AdminRole = 'NONE';
            const normalizedRole = detectedRole.toLowerCase();

            if (normalizedRole.includes('presiden') || normalizedRole.includes('president')) {
                assignedRole = 'SUPER_ADMIN';
            }
            else if (normalizedRole.includes('secretary') || normalizedRole.includes('sekretaris')) {
                assignedRole = 'SECRETARY_ADMIN';
            }
            // STAFF KHUSUS LOGISTIK/PAWN
            else if (normalizedRole.includes('pawn') || normalizedRole.includes('logistik') || normalizedRole.includes('inventory')) {
                assignedRole = 'PAWN_STAFF';
            }
            // STAFF UMUM (TANPA AKSES INVENTORY)
            else if (GENERIC_STAFF_TITLES.some(title => normalizedRole.includes(title))) {
              assignedRole = 'STAFF';
            } else {
              assignedRole = (detectedRole as AdminRole) || 'NONE';
            }

            return {
              isAdmin: true,
              staffName: detectedName || 'Staff',
              role: assignedRole,
              nip: rowPin // Simpan PIN dari spreadsheet sebagai NIP
            };
          }
        }
      }
    } catch (error) {
      console.warn("Gagal terhubung ke Google Sheet, namun akun lokal tidak ditemukan.", error);
    }
  }

  return null;
};
