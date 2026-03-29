
import React, { useState, useEffect } from 'react';
import { fetchWebhooks, saveWebhooks } from '../services/webhookService';
import { motion } from 'framer-motion';

interface WebhookManagerProps {
  webhooks: Record<string, string>;
  setWebhooks: (webhooks: Record<string, string>) => void;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({ webhooks, setWebhooks }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookKeyToDelete, setWebhookKeyToDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const loadWebhooks = async () => {
    setIsLoading(true);
    const data = await fetchWebhooks();
    
    // Ensure default keys exist
    const defaultKeys = [
      'ls_gov_webhook_ktp',
      'ls_gov_webhook_skck',
      'ls_gov_webhook_rekrutmen',
      'ls_gov_webhook_cuti',
      'ls_gov_webhook_sakit',
      'ls_gov_webhook_resign',
      'ls_gov_webhook_lembur',
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
      alert("Webhook configuration saved to database!");
    } else {
      alert("Failed to save webhook configuration.");
    }
  };

  const updateWebhook = (key: string, value: string) => {
    setWebhooks(prev => ({ ...prev, [key]: value }));
  };

  const addNewWebhook = () => {
    if (newKeyName && !webhooks[newKeyName]) {
      setWebhooks(prev => ({ ...prev, [newKeyName]: '' }));
      setNewKeyName('');
      setShowAddModal(false);
    }
  };

  const removeWebhook = (key: string) => {
    const updated = { ...webhooks };
    delete updated[key];
    setWebhooks(updated);
    setWebhookKeyToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Group webhooks for better UI
  const availableKeys = Object.keys(webhooks).filter(k => !k.startsWith('map_'));
  
  const groups = {
    'Layanan Warga (Form)': availableKeys.filter(k => k.startsWith('ls_gov_webhook_')),
    'Internal Staff & Gaji': availableKeys.filter(k => k.includes('sec') || k.includes('salary') || k.includes('discord') || k.includes('feedback')),
    'Pawnshop & Locker': availableKeys.filter(k => k.includes('pawn') || k.includes('locker')),
    'Lainnya': availableKeys.filter(k => 
      !k.startsWith('ls_gov_webhook_') && 
      !k.includes('sec') && !k.includes('salary') && !k.includes('discord') && !k.includes('feedback') &&
      !k.includes('pawn') && !k.includes('locker')
    )
  };

  const FEATURE_MAPPINGS = [
    { id: 'map_pawnshop', label: 'Pawnshop Market Price', defaultKey: 'ls_gov_pawn_webhook' },
    { id: 'map_locker', label: 'Loker & Inventory', defaultKey: 'ls_gov_locker_webhook' },
    { id: 'map_salary', label: 'Slip Gaji & Keuangan', defaultKey: 'ls_gov_salary_webhook' },
    { id: 'map_secretary', label: 'Secretary Portal', defaultKey: 'ls_gov_sec_webhook' },
    { id: 'map_feedback_public', label: 'Feedback Warga (Public)', defaultKey: 'ls_gov_feedback_public' },
    { id: 'map_feedback_staff', label: 'Feedback Pegawai (Staff)', defaultKey: 'ls_gov_feedback_staff' },
  ];

  // Dynamically add mappings for permissions if they exist in webhooks
  const permissionKeys = Object.keys(webhooks).filter(k => k.startsWith('map_permission_'));
  permissionKeys.forEach(k => {
      if (!FEATURE_MAPPINGS.find(m => m.id === k)) {
          FEATURE_MAPPINGS.push({ id: k, label: `Izin: ${k.replace('map_permission_', '')}`, defaultKey: '' });
      }
  });

  return (
    <div className="space-y-8">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <span>🔗</span> Centralized Webhook Management
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
            Manage all Discord Webhook URLs and Feature Mappings in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors">
            + Add Key
          </button>
          <button onClick={loadWebhooks} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors">
            🔄 Refresh
          </button>
          <button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-slate-950 px-6 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
            {isSaving ? 'Saving...' : '💾 Save to Database'}
          </button>
        </div>
      </div>

      {/* FEATURE MAPPING SECTION */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2">Feature to Webhook Mapping</h4>
        <p className="text-[10px] text-slate-400 mb-4">Pilih Key Webhook mana yang akan digunakan oleh masing-masing fitur di bawah ini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_MAPPINGS.map(feature => (
            <div key={feature.id} className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{feature.label}</label>
              <select 
                value={webhooks[feature.id] || feature.defaultKey}
                onChange={(e) => updateWebhook(feature.id, e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500/50"
              >
                {availableKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {Object.entries(groups).map(([groupName, keys]) => (
          keys.length > 0 && (
            <div key={groupName} className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">{groupName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keys.map(key => (
                  <div key={key} className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2 relative group">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{key.replace('ls_gov_webhook_', '').replace('ls_gov_', '').replace('ls_', '').replace('_', ' ')}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-slate-700">{key}</span>
                        {webhookKeyToDelete === key ? (
                            <div className="flex gap-1">
                                <button onClick={() => setWebhookKeyToDelete(null)} className="text-[7px] text-slate-500 uppercase">Batal</button>
                                <button onClick={() => removeWebhook(key)} className="text-[7px] text-red-500 font-bold uppercase animate-pulse">Hapus?</button>
                            </div>
                        ) : (
                            <button onClick={() => setWebhookKeyToDelete(key)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">✕</button>
                        )}
                      </div>
                    </div>
                    <input 
                      type="text" 
                      value={webhooks[key] || ''} 
                      onChange={(e) => updateWebhook(key, e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* ADD KEY MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Add New Webhook Key</h3>
                  <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Key Name</label>
                      <input 
                        type="text" 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="ls_gov_webhook_custom"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                      />
                      {webhooks[newKeyName] !== undefined && <p className="text-[8px] text-red-500 uppercase">Key already exists!</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 text-white py-2 rounded-xl text-xs font-bold uppercase">Cancel</button>
                      <button 
                        onClick={addNewWebhook} 
                        disabled={!newKeyName || webhooks[newKeyName] !== undefined}
                        className="flex-1 bg-amber-500 text-slate-950 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50"
                      >
                        Add Key
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WebhookManager;
