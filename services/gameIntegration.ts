
import { PawnItem } from '../types';

// Konfigurasi URL API Server Game Anda di sini
// Contoh: 'https://api.kota-anda.com/v1/inventory'
const API_BASE_URL = process.env.REACT_APP_GAME_API_URL || ''; 

export const fetchGameInventory = async (type: 'UMUM' | 'HITAM' | 'PAWNSHOP'): Promise<any[] | null> => {
  // JIKA API URL SUDAH ADA (Integrasi Real):
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gov_api_token')}`, // Jika butuh token
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Gagal mengambil data dari Game Server:", error);
      return null;
    }
  }

  // SIMULASI (Mock Data untuk saat ini):
  // Ini mensimulasikan delay jaringan seolah-olah sedang mengambil data dari database kota
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mengembalikan null agar komponen tetap menggunakan localStorage untuk demo
      // Nanti, ini akan diganti dengan data real dari response.json() di atas
      resolve(null); 
    }, 1500);
  });
};

export const syncStockToGame = async (itemId: string, newStock: number): Promise<boolean> => {
   if (API_BASE_URL) {
    try {
      await fetch(`${API_BASE_URL}/inventory/update`, {
        method: 'POST',
        body: JSON.stringify({ itemId, stock: newStock })
      });
      return true;
    } catch (e) {
      return false;
    }
   }
   return true; // Simulasi sukses
};
