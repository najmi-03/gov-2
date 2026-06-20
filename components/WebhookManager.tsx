import React, { useState, useEffect } from 'react';
import { fetchWebhooks, saveWebhooks } from '../services/webhookService';
import { motion } from 'framer-motion';
import { Link as LinkIcon, ArrowRightLeft, Plus, Trash2, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

interface WebhookManagerProps {
  webhooks: Record<string, string>;
  setWebhooks: (webhooks: Record<string, string>) => void;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({ webhooks, setWebhooks }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, isError: boolean} | null>(null);

  const showNotification = (message: string, isError: boolean = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadWebhooks = async () => {
    setIsLoading(true);
    const data = await fetchWebhooks();
    
    // Ensure default keys exist
    const defaultKeys = [
      'ls_gov_webhook_ktp',
      'ls_gov_webhook_skck',
      'ls_gov_webhook_rekrutmen',
      'ls_gov_cuti',
      'ls_gov_sakit',
      'ls_gov_resign',
      'ls_gov_lembur',
      'ls_gov_sec_webhook',
      'ls_gov_salary_webhook',
      'ls_gov_pawn_webhook',
      'ls_gov_locker_webhook',
      'ls_gov_feedback_public',
      'ls_gov_feedback_staff',
      'ls_discord_webhook'
    ];

    const merged = { ...data };
    defaultKeys.forEach(key => {
      if (!merged[key]) merged[key] = '';
    });

    setWebhooks(merged);
    setIsLoading(false);
  };

  useEffect(() => {
    if (Object.keys(webhooks).length === 0) {
      loadWebhooks();
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveWebhooks(webhooks);
    setIsSaving(false);
    if (success) {
      showNotification("Integrasi Webhook berhasil disimpan!");
    } else {
      showNotification("Gagal menyimpan konfigurasi webhook.", true);
    }
  };

  const updateWebhook = (key: string, value: string) => {
    setWebhooks(prev => ({ ...prev, [key]: value }));
  };

  const addNewChannel = () => {
    if (newChannelName && newChannelUrl) {
      // Create a safe key from the name
      const safeKey = 'wh_custom_' + newChannelName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
      setWebhooks(prev => ({ ...prev, [safeKey]: newChannelUrl }));
      setNewChannelName('');
      setNewChannelUrl('');
      setShowAddModal(false);
    }
  };

  const removeChannel = (key: string) => {
    if (confirmDeleteKey === key) {
      const updated = { ...webhooks };
      delete updated[key];
      // Also remove any mappings that use this key
      Object.keys(updated).forEach(k => {
        if (k.startsWith('map_') && updated[k] === key) {
          updated[k] = '';
        }
      });
      setWebhooks(updated);
      setConfirmDeleteKey(null);
    } else {
      setConfirmDeleteKey(key);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDeleteKey(current => current === key ? null : current);
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Separate Channels (URLs) and Mappings
  const channelKeys = Object.keys(webhooks).filter(k => !k.startsWith('map_'));
  
  // Helper to make keys human readable
  const formatKeyName = (key: string) => {
    if (key.startsWith('wh_custom_')) return key.replace('wh_custom_', '').replace(/_[0-9]+$/, '').replace(/_/g, ' ').toUpperCase();
    return key.replace('ls_gov_webhook_', '').replace('ls_gov_', '').replace('ls_', '').replace(/_/g, ' ').toUpperCase();
  };

  const FEATURE_MAPPINGS = [
    { id: 'map_pawnshop', label: 'Pawnshop Market Price', desc: 'Notifikasi saat harga barang gadai berubah', defaultKey: 'ls_gov_pawn_webhook' },
    { id: 'map_locker', label: 'Loker & Inventory', desc: 'Log aktivitas pengambilan/penyimpanan barang', defaultKey: 'ls_gov_locker_webhook' },
    { id: 'map_salary', label: 'Slip Gaji & Keuangan', desc: 'Notifikasi pembayaran gaji pegawai', defaultKey: 'ls_gov_salary_webhook' },
    { id: 'map_secretary', label: 'Secretary Portal', desc: 'Log aktivitas sekretariat', defaultKey: 'ls_gov_sec_webhook' },
    { id: 'map_feedback_public', label: 'Feedback Warga (Public)', desc: 'Pesan masuk dari warga', defaultKey: 'ls_gov_feedback_public' },
    { id: 'map_feedback_staff', label: 'Feedback Pegawai (Staff)', desc: 'Pesan masuk dari internal pegawai', defaultKey: 'ls_gov_feedback_staff' },
  ];

  // Add dynamic permission mappings
  const permissionKeys = Object.keys(webhooks).filter(k => k.startsWith('map_permission_'));
  permissionKeys.forEach(k => {
      if (!FEATURE_MAPPINGS.find(m => m.id === k)) {
          FEATURE_MAPPINGS.push({ id: k, label: `Izin: ${k.replace('map_permission_', '')}`, desc: 'Notifikasi pengajuan izin', defaultKey: '' });
      }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <LinkIcon className="w-5 h-5" /> Integrasi Webhook (Visual Mapper)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Kelola saluran Discord dan hubungkan dengan fitur internal tanpa pusing memikirkan kode.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={loadWebhooks} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50">
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border ${notification.isError ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'} flex items-center justify-center gap-2 font-bold text-sm shadow-lg`}>
          {notification.isError ? '❌' : <CheckCircle2 className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CHANNELS (SALURAN) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">1. Daftar Saluran (Channel)</h4>
            <button onClick={() => setShowAddModal(true)} className="text-amber-500 hover:text-amber-400 p-1">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Daftarkan URL Webhook Discord di sini. Anda bisa menggunakannya berkali-kali untuk fitur yang berbeda.
          </p>

          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {channelKeys.map(key => (
              <div key={key} className={`p-4 rounded-xl border transition-colors group ${confirmDeleteKey === key ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-900/80 border-white/5 hover:border-white/10'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] ${confirmDeleteKey === key ? 'bg-red-500 shadow-none' : 'bg-green-500'}`}></div>
                    <span className={`text-xs font-bold ${confirmDeleteKey === key ? 'text-red-400' : 'text-slate-200'}`}>{formatKeyName(key)}</span>
                  </div>
                  <button 
                    onClick={() => removeChannel(key)} 
                    className={`transition-colors text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${confirmDeleteKey === key ? 'bg-red-500 text-white opacity-100 hover:bg-red-600' : 'text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-red-500/10'}`}
                  >
                    {confirmDeleteKey === key ? 'YAKIN?' : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <input 
                  type="text" 
                  value={webhooks[key] || ''} 
                  onChange={(e) => updateWebhook(key, e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-[10px] outline-none transition-colors ${confirmDeleteKey === key ? 'border-red-500/30 text-red-200 focus:border-red-500 focus:text-white' : 'border-white/10 text-slate-400 focus:border-amber-500/50 focus:text-white'}`}
                />
              </div>
            ))}
            {channelKeys.length === 0 && (
              <div className="text-center p-6 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-slate-500">Belum ada saluran.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MAPPING */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">2. Pasangkan Fitur (Mapping)</h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Pilih saluran mana yang akan menerima notifikasi dari fitur-fitur di bawah ini.
          </p>

          <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-950/50 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="col-span-5">Fitur Internal</div>
              <div className="col-span-2 flex justify-center"><ArrowRightLeft className="w-4 h-4 opacity-50" /></div>
              <div className="col-span-5">Kirim Ke Saluran</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {FEATURE_MAPPINGS.map(feature => {
                const currentChannel = webhooks[feature.id] || feature.defaultKey;
                const isMapped = !!currentChannel && !!webhooks[currentChannel];

                return (
                  <div key={feature.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                    {/* Left: Feature */}
                    <div className="col-span-5">
                      <h5 className="text-xs font-bold text-slate-200">{feature.label}</h5>
                      <p className="text-[9px] text-slate-500 mt-0.5">{feature.desc}</p>
                    </div>

                    {/* Middle: Icon */}
                    <div className="col-span-2 flex justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMapped ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Right: Dropdown */}
                    <div className="col-span-5">
                      <select 
                        value={currentChannel}
                        onChange={(e) => updateWebhook(feature.id, e.target.value)}
                        className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 text-xs outline-none transition-colors appearance-none ${isMapped ? 'border-amber-500/50 text-amber-400 font-medium' : 'border-white/10 text-slate-400'}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                      >
                        <option value="">-- Tidak Dikirim Kemana-mana --</option>
                        {channelKeys.map(key => (
                          <option key={key} value={key}>{formatKeyName(key)}</option>
                        ))}
                      </select>
                      {isMapped && (
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-amber-500/80">
                          <CheckCircle2 className="w-3 h-3" /> Terhubung
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
            <div className="text-blue-400 text-xl">💡</div>
            <div>
              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Tips Untuk Form Layanan Warga / Loket</h5>
              <p className="text-[10px] text-blue-300/70 mt-1 leading-relaxed">
                Anda bisa menghubungkan Webhook Discord ke Form Layanan Warga dengan lebih mudah: cukup tambahkan daftar <strong>"Saluran"</strong> di atas. Setelah itu pergi ke tab <strong>"Manajemen Form"</strong>, lalu Anda dapat memilih dan mengaitkan saluran webhook tersebut pada loket form yang diinginkan.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ADD CHANNEL MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
              >
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Tambah Saluran Webhook</h3>
                  
                  <div className="space-y-4">
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Saluran (Bebas)</label>
                          <input 
                            type="text" 
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            placeholder="Contoh: Channel Laporan Warga"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
                          />
                      </div>
                      
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Webhook Discord</label>
                          <input 
                            type="text" 
                            value={newChannelUrl}
                            onChange={(e) => setNewChannelUrl(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 transition-colors"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors">Batal</button>
                      <button 
                        onClick={addNewChannel} 
                        disabled={!newChannelName || !newChannelUrl}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl text-xs font-bold uppercase disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20"
                      >
                        Simpan Saluran
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default WebhookManager;
