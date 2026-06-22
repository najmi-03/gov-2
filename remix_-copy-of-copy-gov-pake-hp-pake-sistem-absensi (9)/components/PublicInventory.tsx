import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchFromDatabase } from '../services/databaseService';

interface SimpleItem {
  id: string;
  name: string;
  stock: number;
  expiryDate?: number;
}

const getRemainingTime = (expiryDate?: number) => {
  if (!expiryDate) return null;
  const now = Date.now();
  const diff = expiryDate - now;

  if (diff <= 0) return { label: 'EXPIRED', color: 'text-red-500 bg-red-500/10' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return { label: `${days} Hari`, color: 'text-emerald-500 bg-emerald-500/10' };
  return { label: `${hours} Jam`, color: 'text-rose-500 bg-rose-500/10' };
};

const PublicInventory: React.FC = () => {
  const [commonItems, setCommonItems] = useState<SimpleItem[]>([]);
  const [blackItems, setBlackItems] = useState<SimpleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UMUM' | 'HITAM'>('UMUM');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const commonData = await fetchFromDatabase('INVENTORY_COMMON');
        const blackData = await fetchFromDatabase('INVENTORY_BLACK');
        
        if (Array.isArray(commonData)) setCommonItems(commonData);
        if (Array.isArray(blackData)) setBlackItems(blackData);
      } catch (error) {
        console.error("Gagal memuat data loker:", error);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const renderItems = (items: SimpleItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loker Kosong</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const expiryInfo = getRemainingTime(item.expiryDate);
          
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-lg">{item.name || 'Item Tanpa Nama'}</h3>
                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-amber-500/20">
                  Stok: {item.stock || 0}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {expiryInfo ? (
                  <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${expiryInfo.color}`}>
                    <span>⏳ Sisa Waktu: {expiryInfo.label}</span>
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5">
                    <span>♾️ Permanen</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <section id="public-inventory" className="py-24 px-4 bg-transparent relative min-h-screen">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            Inventaris Publik
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Loker <span className="text-amber-500">Umum & Hitam</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Informasi ketersediaan barang di Loker Umum dan Loker Hitam (Sitaan).
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 p-1 rounded-xl border border-white/10 inline-flex">
            <button
              onClick={() => setActiveTab('UMUM')}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'UMUM' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loker Umum
            </button>
            <button
              onClick={() => setActiveTab('HITAM')}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'HITAM' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loker Hitam
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {activeTab === 'UMUM' ? renderItems(commonItems) : renderItems(blackItems)}
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicInventory;
