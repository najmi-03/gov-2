
import React, { useState, useEffect } from 'react';
import { sendToDiscord, formatInventoryEmbed } from '../services/discordService';
import { PawnItem, PawnStatus, PawnCategory } from '../types';
import { INITIAL_PAWN_DATA, getStatusFromStock } from '../constants';

interface SimpleItem {
  id: string;
  name: string;
  stock: number;
}

const PawnshopManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UMUM' | 'HITAM' | 'PAWNSHOP'>('PAWNSHOP');
  
  const [commonItems, setCommonItems] = useState<SimpleItem[]>([]);
  const [blackItems, setBlackItems] = useState<SimpleItem[]>([]);
  const [pawnItems, setPawnItems] = useState<PawnItem[]>(INITIAL_PAWN_DATA);
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadLocalData();
    const savedUrl = localStorage.getItem('ls_discord_webhook');
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  const loadLocalData = () => {
    const savedCommon = localStorage.getItem('ls_gov_inv_common');
    const savedBlack = localStorage.getItem('ls_gov_inv_black');
    const savedPawn = localStorage.getItem('ls_gov_pawn_market');
    
    if (savedCommon) setCommonItems(JSON.parse(savedCommon));
    if (savedBlack) setBlackItems(JSON.parse(savedBlack));
    
    if (savedPawn) {
      setPawnItems(JSON.parse(savedPawn));
    } else {
      setPawnItems(INITIAL_PAWN_DATA);
    }
  };

  const saveCommon = (items: SimpleItem[]) => {
    setCommonItems(items);
    localStorage.setItem('ls_gov_inv_common', JSON.stringify(items));
  };

  const saveBlack = (items: SimpleItem[]) => {
    setBlackItems(items);
    localStorage.setItem('ls_gov_inv_black', JSON.stringify(items));
  };

  const savePawn = (items: PawnItem[]) => {
    const autoUpdated = items.map(item => ({
      ...item,
      status: getStatusFromStock(item.stock)
    }));
    setPawnItems(autoUpdated);
    localStorage.setItem('ls_gov_pawn_market', JSON.stringify(autoUpdated));
    window.dispatchEvent(new Event('pawn_update'));
  };

  const updateSimpleItem = (id: string, field: 'name' | 'stock', value: any) => {
    if (activeTab === 'UMUM') {
      saveCommon(commonItems.map(i => i.id === id ? { ...i, [field]: value } : i));
    } else {
      saveBlack(blackItems.map(i => i.id === id ? { ...i, [field]: value } : i));
    }
  };

  const updatePawnStock = (id: string, stock: number) => {
    savePawn(pawnItems.map(item => item.id === id ? { ...item, stock: Math.max(0, stock) } : item));
  };

  const statusConfig: Record<PawnStatus, { label: string, multiplier: number, icon: string, color: string, desc: string }> = {
    BLUE: { label: '200%', multiplier: 2.0, icon: '🔵', color: 'text-blue-400', desc: 'Mendesak' },
    GREEN: { label: '150%', multiplier: 1.5, icon: '🟢', color: 'text-green-400', desc: 'Tinggi' },
    YELLOW: { label: '100%', multiplier: 1.0, icon: '🟡', color: 'text-yellow-400', desc: 'Stabil' },
    RED: { label: '50%', multiplier: 0.5, icon: '🔴', color: 'text-red-400', desc: 'Berlebih' },
    BLACK: { label: 'STOP', multiplier: 0, icon: '❌', color: 'text-slate-500', desc: 'Penuh' },
  };

  const handleSyncDiscord = async () => {
    if (!webhookUrl) return alert("Masukan Webhook!");
    setIsSyncing(true);
    let data = activeTab === 'UMUM' ? commonItems : activeTab === 'HITAM' ? blackItems : pawnItems;
    const success = await sendToDiscord(webhookUrl, formatInventoryEmbed(activeTab, data));
    if (success) alert(`Laporan ${activeTab} Terkirim ke Discord!`);
    setIsSyncing(false);
  };

  const categories: PawnCategory[] = ['PERTANIAN', 'PERTAMBANGAN', 'PERHIASAN', 'ALKOHOL', 'HUNTING', 'RONGSOK'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-950 p-1 rounded-xl border border-white/5">
        <div className="flex overflow-x-auto scrollbar-hide flex-1">
          {(['UMUM', 'HITAM', 'PAWNSHOP'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 min-w-[100px] text-[9px] font-black tracking-widest rounded-lg transition-all ${
                activeTab === tab 
                ? (tab === 'UMUM' ? 'bg-blue-600' : tab === 'HITAM' ? 'bg-red-600' : 'bg-amber-600') + ' text-white' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === 'PAWNSHOP' ? (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 text-[8px] flex justify-between items-center">
                  <span>🔵 1 - 5K (200%)</span>
                  <span className="text-blue-400 font-bold uppercase">MENDESAK</span>
                </div>
                <div className="bg-green-500/10 p-2 rounded border border-green-500/20 text-[8px] flex justify-between items-center">
                  <span>🟢 5K - 20K (150%)</span>
                  <span className="text-green-400 font-bold uppercase">TINGGI</span>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20 text-[8px] flex justify-between items-center">
                  <span>🟡 20K - 200K (100%)</span>
                  <span className="text-yellow-400 font-bold uppercase">STABIL</span>
                </div>
                <div className="bg-red-500/10 p-2 rounded border border-red-500/20 text-[8px] flex justify-between items-center">
                  <span>🔴 200K - 500K (50%)</span>
                  <span className="text-red-400 font-bold uppercase">BERLEBIH</span>
                </div>
                <div className="bg-slate-500/10 p-2 rounded border border-white/10 text-[8px] flex justify-between items-center sm:col-span-2">
                  <span>❌ &gt; 500K (0%)</span>
                  <span className="text-slate-400 font-bold uppercase">PENERIMAAN DITUTUP</span>
                </div>
             </div>
             <button onClick={handleSyncDiscord} disabled={isSyncing} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20">
                {isSyncing ? 'MENGIRIM LAPORAN...' : '📢 KIRIM LAPORAN HARGA KE DISCORD'}
             </button>
          </div>
          {categories.map(cat => (
            <div key={cat} className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-white/5 border-b border-white/5">
                <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{cat}</h4>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <tbody className="divide-y divide-white/5">
                    {pawnItems.filter(i => i.category === cat).map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.01]">
                        <td className="px-5 py-4 text-slate-200 font-medium">{item.name}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                             <span className="text-base">{statusConfig[item.status].icon}</span>
                             <span className={`text-[9px] font-black ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updatePawnStock(item.id, item.stock - 1000)} className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-slate-500 hover:text-white">-</button>
                            <input 
                              type="number" 
                              value={item.stock}
                              onChange={(e) => updatePawnStock(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 md:w-20 bg-slate-900 border border-white/10 rounded px-1 text-center text-slate-300 text-[10px] focus:border-amber-500/50 outline-none"
                            />
                            <button onClick={() => updatePawnStock(item.id, item.stock + 1000)} className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-slate-500 hover:text-white">+</button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-black ${statusConfig[item.status].color}`}>
                             {item.status === 'BLACK' ? 'CLOSED' : `$${(item.basePrice * statusConfig[item.status].multiplier).toFixed(0)}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-white/5">
             <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">LOKER {activeTab}</h3>
             <button onClick={handleSyncDiscord} className="text-[9px] font-black bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">SYNC DISCORD</button>
           </div>
           <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
             <table className="w-full text-left text-xs">
               <tbody className="divide-y divide-white/5">
                 {(activeTab === 'UMUM' ? commonItems : blackItems).map(item => (
                   <tr key={item.id} className="hover:bg-white/[0.01]">
                     <td className="px-5 py-4">
                       <input 
                         type="text" 
                         value={item.name}
                         onChange={e => updateSimpleItem(item.id, 'name', e.target.value)}
                         className="bg-transparent text-slate-200 outline-none w-full text-xs font-medium"
                         placeholder="Nama barang..."
                       />
                     </td>
                     <td className="px-5 py-4">
                       <div className="flex justify-end items-center gap-3">
                          <button onClick={() => updateSimpleItem(item.id, 'stock', item.stock - 1)} className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-slate-500">-</button>
                          <input type="number" value={item.stock} onChange={e => updateSimpleItem(item.id, 'stock', parseInt(e.target.value) || 0)} className="w-10 bg-transparent text-center font-black text-slate-300 text-xs" />
                          <button onClick={() => updateSimpleItem(item.id, 'stock', item.stock + 1)} className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-slate-500">+</button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <button onClick={() => {
               const newItem = { id: Date.now().toString(), name: '', stock: 0 };
               if(activeTab === 'UMUM') saveCommon([...commonItems, newItem]); else saveBlack([...blackItems, newItem]);
             }} className="w-full py-4 bg-white/[0.02] text-[9px] font-black text-slate-500 hover:text-white transition-colors border-t border-white/5 uppercase tracking-widest">+ TAMBAH ITEM</button>
           </div>
        </div>
      )}
      <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 block px-1">Webhook URL (Untuk Laporan)</label>
        <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="Discord Webhook..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-amber-500/50" />
      </div>
    </div>
  );
};

export default PawnshopManager;
