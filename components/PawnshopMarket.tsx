
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PawnItem, PawnStatus, PawnCategory } from '../types';
import { INITIAL_PAWN_DATA, getStatusFromStock } from '../constants';

const PawnshopMarket: React.FC = () => {
  const [items, setItems] = useState<PawnItem[]>(INITIAL_PAWN_DATA);
  const [lastUpdate, setLastUpdate] = useState<string>('Default');

  const loadData = () => {
    const saved = localStorage.getItem('ls_gov_pawn_market');
    if (saved) {
      setItems(JSON.parse(saved));
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
    } else {
      setItems(INITIAL_PAWN_DATA);
      setLastUpdate('Database Pusat');
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pawn_update', loadData);
    return () => window.removeEventListener('pawn_update', loadData);
  }, []);

  const statusConfig: Record<PawnStatus, { label: string, color: string, multiplier: number, icon: string, bg: string, desc: string }> = {
    BLUE: { label: '200%', color: 'text-blue-400', multiplier: 2.0, icon: '🔵', bg: 'bg-blue-500/10', desc: 'Kebutuhan Mendesak' },
    GREEN: { label: '150%', color: 'text-green-400', multiplier: 1.5, icon: '🟢', bg: 'bg-green-500/10', desc: 'Kebutuhan Tinggi' },
    YELLOW: { label: '100%', color: 'text-yellow-400', multiplier: 1.0, icon: '🟡', bg: 'bg-yellow-500/10', desc: 'Persediaan Stabil' },
    RED: { label: '50%', color: 'text-red-400', multiplier: 0.5, icon: '🔴', bg: 'bg-red-500/10', desc: 'Persediaan Berlebih' },
    BLACK: { label: 'STOP', color: 'text-slate-500', multiplier: 0, icon: '❌', bg: 'bg-slate-500/20', desc: 'Penerimaan Ditutup' },
  };

  const categories: PawnCategory[] = ['PERTANIAN', 'PERTAMBANGAN', 'PERHIASAN', 'ALKOHOL', 'HUNTING', 'RONGSOK'];

  return (
    <section id="pawnshop-market" className="py-24 px-4 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4">
              Portal Ekonomi Publik
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Indikator Harga <span className="text-amber-500">Pawnshop</span>
            </h2>
            <p className="text-slate-400 text-lg font-light">
              Pantau harga jual barang ke negara secara real-time. Harga ditentukan berdasarkan tingkat kebutuhan material di gudang logistik pemerintah San Andreas.
            </p>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-lg bg-white/5">
            Sumber Data: {lastUpdate}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {['BLUE', 'GREEN', 'YELLOW', 'RED', 'BLACK'].map(s => (
            <div key={s} className={`p-4 rounded-xl border border-white/5 ${statusConfig[s as PawnStatus].bg} flex flex-col items-center text-center`}>
               <span className="text-2xl mb-2">{statusConfig[s as PawnStatus].icon}</span>
               <span className={`text-[12px] font-black uppercase tracking-widest ${statusConfig[s as PawnStatus].color}`}>{statusConfig[s as PawnStatus].label}</span>
               <div className="mt-1 flex flex-col items-center">
                 <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Gudang:</span>
                 <span className="text-[10px] text-slate-300 font-medium">{statusConfig[s as PawnStatus].desc}</span>
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <motion.div 
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm"
              >
                <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-black text-white tracking-[0.3em] uppercase">{cat}</h3>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4 h-[400px] overflow-y-auto custom-scrollbar">
                  {catItems.map(item => {
                    const status = getStatusFromStock(item.stock);
                    return (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{statusConfig[status].icon}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{item.name}</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-widest">{statusConfig[status].desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col items-end">
                            {status === 'BLACK' ? (
                              <span className="text-[10px] font-black text-red-500/80 bg-red-500/10 px-2 py-1 rounded">X CLOSED</span>
                            ) : (
                              <>
                                <span className={`text-lg font-black tracking-tighter ${statusConfig[status].color}`}>
                                  ${Math.floor(item.basePrice * statusConfig[status].multiplier)}
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase">Per Unit</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
          <p className="text-xs text-slate-500 italic">
            *Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya tergantung pada arus logistik masuk dan keluar gudang negara. Indikator ❌ berarti gudang sudah tidak sanggup menampung material tersebut.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PawnshopMarket;
