
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
  { pin: "SECSTATE1", name: "Dominic Sterling", role: "SECRETARY_OF_STATE" },

  // 8. Health Admin
  { pin: "1", name: "Admin Health", role: "HEALTH_ADMIN" }
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

export const loginWithSpreadsheet = async (username: string, password: string): Promise<AuthState | null> => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Gagal terhubung ke API Login Turso.", error);
  }

  return null;
};

export const signupUser = async (pin: string, ic_name: string, requested_role: string, requested_department: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, ic_name, requested_role, requested_department })
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: "Gagal terhubung ke server." };
  }
};

export const updateProfile = async (username: string, ic_name: string, password?: string, avatar_url?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, ic_name, password, avatar_url })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: "Gagal terhubung ke server." };
  }
};
