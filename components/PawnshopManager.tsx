
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

    const savedUrl = localStorage.getItem('ls_discord_webhook');
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

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

  const handleSync = async () => {
    if (!webhookUrl) return alert("Masukan Webhook!");
    setIsSyncing(true);
    let data = activeTab === 'UMUM' ? commonItems : activeTab === 'HITAM' ? blackItems : pawnItems;
    const success = await sendToDiscord(webhookUrl, formatInventoryEmbed(activeTab, data));
    if (success) alert(`Sync ${activeTab} Berhasil!`);
    setIsSyncing(false);
  };

  const categories: PawnCategory[] = ['PERTANIAN', 'PERTAMBANGAN', 'PERHIASAN', 'ALKOHOL', 'HUNTING', 'RONGSOK'];

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
        {(['UMUM', 'HITAM', 'PAWNSHOP'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[9px] font-black tracking-widest rounded-lg transition-all ${
              activeTab === tab 
              ? (tab === 'UMUM' ? 'bg-blue-600' : tab === 'HITAM' ? 'bg-red-600' : 'bg-amber-600') + ' text-white' 
              : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'PAWNSHOP' ? (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-white/10 p-4 rounded-xl">
             <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 text-[8px] flex justify-between">
                  <span>🔵 1 - 5K (200%)</span>
                  <span className="text-blue-400 font-bold">MENDESAK</span>
                </div>
                <div className="bg-green-500/10 p-2 rounded border border-green-500/20 text-[8px] flex justify-between">
                  <span>🟢 5K - 20K (150%)</span>
                  <span className="text-green-400 font-bold">TINGGI</span>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20 text-[8px] flex justify-between">
                  <span>🟡 20K - 200K (100%)</span>
                  <span className="text-yellow-400 font-bold">STABIL</span>
                </div>
                <div className="bg-red-500/10 p-2 rounded border border-red-500/20 text-[8px] flex justify-between">
                  <span>🔴 200K - 500K (50%)</span>
                  <span className="text-red-400 font-bold">BERLEBIH</span>
                </div>
                <div className="bg-slate-500/10 p-2 rounded border border-white/10 text-[8px] flex justify-between col-span-2">
                  <span>❌ > 500K (0%)</span>
                  <span className="text-slate-400 font-bold">PENERIMAAN DITUTUP</span>
                </div>
             </div>
             <button onClick={handleSync} disabled={isSyncing} className="w-full bg-amber-600 text-white py-2 rounded text-[9px] font-bold uppercase">Sync Discord</button>
          </div>
          {categories.map(cat => (
            <div key={cat} className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-3 bg-white/5 border-b border-white/5">
                <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{cat}</h4>
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-white/5">
                  {pawnItems.filter(i => i.category === cat).map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 text-slate-200 font-medium">{item.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-lg">{statusConfig[item.status].icon}</span>
                           <span className={`text-[9px] font-black ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updatePawnStock(item.id, item.stock - 1000)} className="text-slate-600">-</button>
                          <input 
                            type="number" 
                            value={item.stock}
                            onChange={(e) => updatePawnStock(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 bg-slate-900 border border-white/10 rounded px-1 text-center text-slate-300 text-[10px]"
                          />
                          <button onClick={() => updatePawnStock(item.id, item.stock + 1000)} className="text-slate-600">+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${statusConfig[item.status].color}`}>
                           {item.status === 'BLACK' ? 'CLOSED' : `$${(item.basePrice * statusConfig[item.status].multiplier).toFixed(0)}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-white/5">
             <h3 className="text-[10px] font-bold text-slate-400">LOKER {activeTab}</h3>
             <button onClick={handleSync} className="text-[9px] font-bold bg-white/5 px-4 py-2 rounded">SYNC DISCORD</button>
           </div>
           <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
             <table className="w-full text-left text-xs">
               <tbody className="divide-y divide-white/5">
                 {(activeTab === 'UMUM' ? commonItems : blackItems).map(item => (
                   <tr key={item.id} className="hover:bg-white/[0.01]">
                     <td className="px-6 py-4">
                       <input 
                         type="text" 
                         value={item.name}
                         onChange={e => updateSimpleItem(item.id, 'name', e.target.value)}
                         className="bg-transparent text-slate-200 outline-none w-full"
                         placeholder="Nama barang..."
                       />
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex justify-end items-center gap-4">
                          <button onClick={() => updateSimpleItem(item.id, 'stock', item.stock - 1)} className="text-slate-500">-</button>
                          <input type="number" value={item.stock} onChange={e => updateSimpleItem(item.id, 'stock', parseInt(e.target.value) || 0)} className="w-12 bg-transparent text-center font-bold text-slate-300" />
                          <button onClick={() => updateSimpleItem(item.id, 'stock', item.stock + 1)} className="text-slate-500">+</button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <button onClick={() => {
               const newItem = { id: Date.now().toString(), name: '', stock: 0 };
               if(activeTab === 'UMUM') saveCommon([...commonItems, newItem]); else saveBlack([...blackItems, newItem]);
             }} className="w-full py-4 bg-white/[0.02] text-[9px] font-bold text-slate-500 hover:text-white transition-colors border-t border-white/5">+ TAMBAH ITEM</button>
           </div>
        </div>
      )}
      <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
        <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="Discord Webhook..." className="w-full bg-slate-950 border border-white/10 rounded px-4 py-2 text-[10px] outline-none" />
      </div>
    </div>
  );
};

export default PawnshopManager;
