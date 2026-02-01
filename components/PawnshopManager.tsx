
import React, { useState, useEffect } from 'react';
import { sendToDiscord, formatInventoryEmbed } from '../services/discordService';
import { PawnItem, PawnStatus, PawnCategory, AdminRole } from '../types';
import { INITIAL_PAWN_DATA, getStatusFromStock } from '../constants';

interface SimpleItem {
  id: string;
  name: string;
  stock: number;
  expiryDate?: number; // Timestamp kapan item akan hilang (undefined = permanen)
}

interface PawnshopManagerProps {
  staffName?: string | null;
  userRole?: AdminRole;
}

// Helper untuk menghitung sisa waktu
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

const InventoryRow: React.FC<{
  item: SimpleItem;
  onUpdate: (id: string, field: 'name' | 'stock', value: any) => void;
  onDelete: (id: string) => void;
  onRecordLog: (name: string, type: 'DEPOSIT' | 'WITHDRAW', amount: number) => void;
  categoryName: string;
}> = ({ item, onUpdate, onDelete, onRecordLog }) => {
  const [action, setAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('');
  
  const expiryInfo = getRemainingTime(item.expiryDate);

  const handleExecute = async () => {
    const val = parseInt(amount);
    if (!val || val <= 0) return;
    
    // 1. Update Data Lokal (Stok)
    const currentStock = item.stock || 0;
    const newStock = action === 'DEPOSIT' 
      ? currentStock + val 
      : Math.max(0, currentStock - val);
      
    onUpdate(item.id, 'stock', newStock);

    // 2. Catat Log ke State Parent
    onRecordLog(item.name || 'Item Tanpa Nama', action, val);

    setAmount('');
  };

  return (
    <tr className="hover:bg-white/[0.01] border-b border-white/5 transition-colors group">
      <td className="px-5 py-4 align-top w-full md:w-[40%] block md:table-cell">
        <div className="space-y-2">
           <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block md:hidden">Nama Barang</label>
           <div className="flex flex-col gap-2">
             <div className="flex gap-2">
               <input 
                type="text" 
                value={item.name}
                onChange={e => onUpdate(item.id, 'name', e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white w-full outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600"
                placeholder="Nama Item..."
              />
              <button 
                onClick={() => onDelete(item.id)}
                className="w-10 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
              >
                🗑️
              </button>
             </div>
             {/* Tampilan Durasi / Expired */}
             {expiryInfo && (
               <div className={`self-start px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${expiryInfo.color}`}>
                 <span>⏳ Sisa Waktu: {expiryInfo.label}</span>
               </div>
             )}
             {!item.expiryDate && (
               <div className="self-start px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5">
                 ♾️ Permanen
               </div>
             )}
           </div>
        </div>
      </td>
      <td className="px-5 py-4 align-top w-full md:w-[60%] block md:table-cell">
        <div className="flex flex-col gap-3">
           <div className="flex justify-between items-end">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest md:hidden">Manajemen Stok</label>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/5 w-full md:w-auto text-right">
                Stok: <b className="text-white text-sm ml-1">{(item.stock || 0).toLocaleString()}</b>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <div className="relative flex-[2]">
                <select 
                  value={action} 
                  onChange={(e) => setAction(e.target.value as any)}
                  className={`w-full appearance-none bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-colors ${
                    action === 'DEPOSIT' ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'
                  }`}
                >
                  <option value="DEPOSIT">📥 Deposit</option>
                  <option value="WITHDRAW">📤 Withdraw</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current text-white" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white w-16 md:w-20 text-center outline-none focus:border-amber-500/50 placeholder:text-slate-700"
                min="1"
                placeholder="Jml"
              />
              
              <button 
                onClick={handleExecute}
                className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all shadow-lg active:scale-95 ${
                  action === 'DEPOSIT' 
                    ? 'bg-green-500 hover:bg-green-400 shadow-green-500/20' 
                    : 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
                }`}
              >
                {action === 'DEPOSIT' ? 'SIMPAN' : 'AMBIL'}
              </button>
           </div>
        </div>
      </td>
    </tr>
  );
};

const PawnshopManager: React.FC<PawnshopManagerProps> = ({ staffName, userRole }) => {
  const availableTabs = userRole === 'PAWN_ADMIN' 
    ? ['UMUM', 'HITAM', 'PAWNSHOP'] as const
    : ['UMUM', 'HITAM'] as const;

  const [activeTab, setActiveTab] = useState<'UMUM' | 'HITAM' | 'PAWNSHOP'>(
    userRole === 'PAWN_ADMIN' ? 'PAWNSHOP' : 'UMUM'
  );
  
  const [commonItems, setCommonItems] = useState<SimpleItem[]>([]);
  const [blackItems, setBlackItems] = useState<SimpleItem[]>([]);
  const [pawnItems, setPawnItems] = useState<PawnItem[]>(INITIAL_PAWN_DATA);
  
  // State untuk Log Sesi
  const [sessionLogs, setSessionLogs] = useState<string[]>([]);
  
  // State untuk Form Tambah Item Baru (Pengganti window.prompt)
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('0'); // 0 = Permanen

  const [pawnWebhookUrl, setPawnWebhookUrl] = useState('');
  const [lockerWebhookUrl, setLockerWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadLocalData();
    const savedPawnUrl = localStorage.getItem('ls_gov_pawn_webhook');
    const savedLockerUrl = localStorage.getItem('ls_gov_locker_webhook');
    const savedLogs = localStorage.getItem('ls_gov_session_logs');
    
    if (savedPawnUrl) setPawnWebhookUrl(savedPawnUrl);
    if (savedLockerUrl) setLockerWebhookUrl(savedLockerUrl);
    if (savedLogs) setSessionLogs(JSON.parse(savedLogs));
  }, []);

  const recordLog = (itemName: string, type: 'DEPOSIT' | 'WITHDRAW', amount: number) => {
    const symbol = type === 'DEPOSIT' ? '+' : '-';
    const logEntry = `${symbol} ${amount} ${itemName}`;
    
    const updatedLogs = [...sessionLogs, logEntry];
    setSessionLogs(updatedLogs);
    localStorage.setItem('ls_gov_session_logs', JSON.stringify(updatedLogs));
  };

  const loadLocalData = () => {
    const savedCommon = localStorage.getItem('ls_gov_inv_common');
    const savedBlack = localStorage.getItem('ls_gov_inv_black');
    const savedPawn = localStorage.getItem('ls_gov_pawn_market');
    
    const filterExpired = (items: SimpleItem[]) => {
      const now = Date.now();
      return items.filter(item => !item.expiryDate || item.expiryDate > now);
    };

    const safeParse = (json: string): SimpleItem[] => {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            // Gunakan random string agar ID unik dan tidak crash saat map loop cepat
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || '',
            stock: typeof item.stock === 'number' ? item.stock : (typeof item.count === 'number' ? item.count : 0),
            expiryDate: item.expiryDate 
          }));
        }
        return [];
      } catch (e) {
        return [];
      }
    };

    if (savedCommon) {
      const parsedCommon = safeParse(savedCommon);
      const activeCommon = filterExpired(parsedCommon);
      setCommonItems(activeCommon);
      if (activeCommon.length !== parsedCommon.length) {
         localStorage.setItem('ls_gov_inv_common', JSON.stringify(activeCommon));
      }
    }

    if (savedBlack) {
      const parsedBlack = safeParse(savedBlack);
      const activeBlack = filterExpired(parsedBlack);
      setBlackItems(activeBlack);
      if (activeBlack.length !== parsedBlack.length) {
         localStorage.setItem('ls_gov_inv_black', JSON.stringify(activeBlack));
      }
    }
    
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

  const deleteSimpleItem = (id: string) => {
    if (activeTab === 'UMUM') {
      saveCommon(commonItems.filter(i => i.id !== id));
    } else {
      saveBlack(blackItems.filter(i => i.id !== id));
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      alert("Nama item tidak boleh kosong!");
      return;
    }

    const days = parseInt(newItemDuration);
    // Hitung expiry date
    const expiryDate = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : undefined;

    const newItem: SimpleItem = {
      // Buat ID yang benar-benar unik
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName,
      stock: 0,
      expiryDate: expiryDate
    };

    if (activeTab === 'UMUM') {
      saveCommon([...commonItems, newItem]);
    } else {
      saveBlack([...blackItems, newItem]);
    }

    // Reset Form
    setNewItemName('');
    setNewItemDuration('0');
    setIsAddingItem(false);
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
    let targetWebhook = '';
    let data: any[] = [];
    
    if (activeTab === 'PAWNSHOP') {
      if (!pawnWebhookUrl) return alert("Masukkan Webhook Market Price!");
      targetWebhook = pawnWebhookUrl;
      data = pawnItems;
    } else {
      if (!lockerWebhookUrl) return alert("Masukkan Webhook Loker (Digunakan untuk Umum & Hitam)!");
      targetWebhook = lockerWebhookUrl;
      data = activeTab === 'UMUM' ? commonItems : blackItems;
    }

    setIsSyncing(true);
    const success = await sendToDiscord(targetWebhook, formatInventoryEmbed(activeTab, data, staffName, userRole, sessionLogs));
    
    if (success) {
      alert(`Laporan ${activeTab} berhasil dikirim!`);
      setSessionLogs([]);
      localStorage.removeItem('ls_gov_session_logs');
    } else {
      alert("Gagal mengirim laporan. Cek URL Webhook.");
    }
    setIsSyncing(false);
  };

  const categories: PawnCategory[] = ['PERTANIAN', 'PERTAMBANGAN', 'PERHIASAN', 'ALKOHOL', 'HUNTING', 'RONGSOK'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-950 p-1 rounded-xl border border-white/5">
        <div className="flex overflow-x-auto scrollbar-hide flex-1">
          {availableTabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 min-w-[100px] text-[10px] font-black tracking-widest rounded-lg transition-all ${
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
      
      {activeTab === 'PAWNSHOP' && userRole === 'PAWN_ADMIN' ? (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {/* Legend UI */}
                <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 text-[10px] flex justify-between items-center">
                  <span>🔵 1 - 5K (200%)</span>
                  <span className="text-blue-400 font-bold uppercase">MENDESAK</span>
                </div>
                <div className="bg-green-500/10 p-2 rounded border border-green-500/20 text-[10px] flex justify-between items-center">
                  <span>🟢 5K - 20K (150%)</span>
                  <span className="text-green-400 font-bold uppercase">TINGGI</span>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20 text-[10px] flex justify-between items-center">
                  <span>🟡 20K - 200K (100%)</span>
                  <span className="text-yellow-400 font-bold uppercase">STABIL</span>
                </div>
                <div className="bg-red-500/10 p-2 rounded border border-red-500/20 text-[10px] flex justify-between items-center">
                  <span>🔴 200K - 500K (50%)</span>
                  <span className="text-red-400 font-bold uppercase">BERLEBIH</span>
                </div>
                <div className="bg-slate-500/10 p-2 rounded border border-white/10 text-[10px] flex justify-between items-center sm:col-span-2">
                  <span>❌ &gt; 500K (0%)</span>
                  <span className="text-slate-400 font-bold uppercase">PENERIMAAN DITUTUP</span>
                </div>
             </div>
             
             <button onClick={handleSyncDiscord} disabled={isSyncing} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 mb-4">
                {isSyncing ? 'MENGIRIM LAPORAN...' : '📢 KIRIM LAPORAN HARGA KE DISCORD'}
             </button>

             <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">Webhook Market Price</label>
                <input 
                  type="text" 
                  value={pawnWebhookUrl} 
                  onChange={e => {
                    setPawnWebhookUrl(e.target.value);
                    localStorage.setItem('ls_gov_pawn_webhook', e.target.value);
                  }} 
                  placeholder="https://discord.com/api/webhooks/..." 
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none" 
                />
              </div>
          </div>

          {categories.map(cat => (
            <div key={cat} className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-white/5 border-b border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{cat}</h4>
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
                             <span className={`text-[10px] font-black ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span>
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
             <div>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MANAJEMEN {activeTab}</h3>
               <p className="text-[9px] text-slate-600 uppercase">Petugas: <span className="text-amber-500">{staffName || 'Guest'}</span></p>
             </div>
             <button onClick={handleSyncDiscord} className="text-[10px] font-black bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10 text-amber-500">
               {isSyncing ? 'SENDING...' : 'SYNC REPORT (DISCORD)'}
             </button>
           </div>
           
           <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Webhook Loker (Report Center)</label>
              <input 
                type="text" 
                value={lockerWebhookUrl} 
                onChange={e => {
                  setLockerWebhookUrl(e.target.value);
                  localStorage.setItem('ls_gov_locker_webhook', e.target.value);
                }} 
                placeholder="https://discord.com/api/webhooks/..." 
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none focus:border-amber-500/50" 
              />
              <p className="text-[10px] text-slate-500 mt-2 italic">*Link ini digunakan untuk mengirim Laporan Inventaris + History Log Aktivitas saat tombol Sync ditekan.</p>
           </div>
           
           {sessionLogs.length > 0 && (
             <div className="bg-slate-950 border border-amber-500/20 p-4 rounded-xl">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Aktivitas Sesi Ini (Belum Disync)</h4>
                  <button onClick={() => { setSessionLogs([]); localStorage.removeItem('ls_gov_session_logs'); }} className="text-[9px] text-red-500 hover:text-white uppercase">Reset Log</button>
               </div>
               <div className="bg-slate-900/50 p-3 rounded-lg max-h-32 overflow-y-auto text-[10px] font-mono text-slate-400 border border-white/5">
                 {sessionLogs.map((log, idx) => (
                   <div key={idx} className="border-b border-white/5 last:border-0 py-0.5">{log}</div>
                 ))}
               </div>
             </div>
           )}

           <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <table className="w-full text-left text-[11px] md:text-xs whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/5 hidden md:table-header-group">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[40%]">Item</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[60%]">Stok & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {(activeTab === 'UMUM' ? commonItems : blackItems).map(item => (
                      <InventoryRow 
                        key={item.id} 
                        item={item} 
                        onUpdate={updateSimpleItem} 
                        onDelete={deleteSimpleItem} 
                        onRecordLog={recordLog}
                        categoryName={`LOKER ${activeTab}`}
                      />
                   ))}
                   {(activeTab === 'UMUM' ? commonItems : blackItems).length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center text-slate-600 font-bold uppercase tracking-widest">
                          Loker Kosong
                        </td>
                      </tr>
                   )}
                </tbody>
              </table>
              
              {/* UI TAMBAH ITEM (MENGGANTIKAN WINDOW.PROMPT) */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                 {!isAddingItem ? (
                   <button 
                     onClick={() => setIsAddingItem(true)} 
                     className="w-full py-3 border-2 border-dashed border-white/10 text-slate-500 hover:border-amber-500 hover:text-amber-500 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
                   >
                      + Tambah Item Baru
                   </button>
                 ) : (
                   <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Item Baru</h4>
                        <button onClick={() => setIsAddingItem(false)} className="text-slate-500 hover:text-white">✕</button>
                      </div>
                      
                      <div className="space-y-3">
                         <input 
                           type="text" 
                           value={newItemName}
                           onChange={e => setNewItemName(e.target.value)}
                           placeholder="Nama Item (misal: Radio, Borgol)"
                           className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none"
                         />
                         
                         <div className="flex items-center gap-3">
                           <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">Durasi / Expired:</label>
                           <select 
                             value={newItemDuration}
                             onChange={e => setNewItemDuration(e.target.value)}
                             className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none"
                           >
                             <option value="0">♾️ Permanen (Selamanya)</option>
                             <option value="1">⏳ 1 Hari</option>
                             <option value="3">⏳ 3 Hari</option>
                             <option value="7">⏳ 7 Hari</option>
                             <option value="30">⏳ 30 Hari</option>
                           </select>
                         </div>
                      </div>

                      <div className="flex gap-3">
                         <button 
                           onClick={handleAddItem}
                           className="flex-1 bg-green-500 hover:bg-green-400 text-slate-950 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest"
                         >
                           SIMPAN
                         </button>
                         <button 
                           onClick={() => setIsAddingItem(false)}
                           className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest"
                         >
                           BATAL
                         </button>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PawnshopManager;
