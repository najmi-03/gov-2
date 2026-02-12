
import React, { useState } from 'react';
import { PermissionConfig, FormField } from '../types';

interface PermissionManagerProps {
  permissions: PermissionConfig[];
  setPermissions: (permissions: PermissionConfig[]) => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ permissions, setPermissions }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const updatePermission = (id: string, field: keyof PermissionConfig, value: any) => {
    const updated = permissions.map(p => p.id === id ? { ...p, [field]: value } : p);
    setPermissions(updated);
    
    // Save webhook directly if it's the field being edited
    if (field === 'webhookKey' && value) {
        localStorage.setItem(value, localStorage.getItem(value) || '');
    }
  };

  const getWebhookUrl = (key: string) => localStorage.getItem(key) || '';
  const setWebhookUrl = (key: string, url: string) => localStorage.setItem(key, url);

  const addNewPermission = () => {
    const newPerm: PermissionConfig = {
      id: `perm_${Date.now()}`,
      title: 'Izin Baru',
      icon: '📝',
      color: '#3b82f6',
      webhookKey: `ls_gov_webhook_${Date.now()}`,
      requireDate: false,
      fields: [
        { id: `f_${Date.now()}`, label: 'Alasan', type: 'textarea', placeholder: 'Keterangan...', required: true }
      ]
    };
    setPermissions([...permissions, newPerm]);
    setEditingId(newPerm.id);
  };

  const deletePermission = (id: string) => {
    if (confirm("Hapus jenis izin ini secara permanen?")) {
      setPermissions(permissions.filter(p => p.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  // --- FIELD MANAGEMENT ---
  const addField = (permId: string) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      label: 'Pertanyaan Baru',
      type: 'text',
      placeholder: 'Jawaban...',
      required: true
    };
    const updated = permissions.map(p => p.id === permId ? { ...p, fields: [...(p.fields || []), newField] } : p);
    setPermissions(updated);
  };

  const removeField = (permId: string, fieldId: string) => {
    const updated = permissions.map(p => p.id === permId ? { ...p, fields: p.fields.filter(f => f.id !== fieldId) } : p);
    setPermissions(updated);
  };

  const updateField = (permId: string, fieldId: string, key: keyof FormField, value: any) => {
    const updated = permissions.map(p => {
      if (p.id !== permId) return p;
      return {
        ...p,
        fields: p.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f)
      };
    });
    setPermissions(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex justify-between items-center">
        <div>
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span>⚙️</span> Konfigurasi Izin Pegawai
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
            Atur jenis izin, pertanyaan, dan Webhook Discord untuk setiap laporan.
            </p>
        </div>
        <button onClick={addNewPermission} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg">
            + Buat Izin Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {permissions.map((perm) => (
          <div key={perm.id} className={`bg-slate-900 border ${editingId === perm.id ? 'border-amber-500/50' : 'border-white/5'} p-4 rounded-xl transition-all`}>
             <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl bg-white/5">
                        {perm.icon}
                     </div>
                     <div>
                         <h4 className="font-bold text-white text-sm">{perm.title}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: perm.color }}></div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">{perm.webhookKey}</span>
                         </div>
                     </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setEditingId(editingId === perm.id ? null : perm.id)} 
                        className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded uppercase hover:bg-amber-500 hover:text-slate-950 transition-all"
                    >
                        {editingId === perm.id ? 'Tutup' : 'Edit'}
                    </button>
                    <button onClick={() => deletePermission(perm.id)} className="text-slate-600 hover:text-red-500 px-2">✕</button>
                 </div>
             </div>
             
             {editingId === perm.id && (
                 <div className="space-y-6 pt-4 border-t border-white/5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Judul Izin</label>
                            <input type="text" value={perm.title} onChange={e => updatePermission(perm.id, 'title', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Icon (Emoji)</label>
                            <input type="text" value={perm.icon} onChange={e => updatePermission(perm.id, 'icon', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Warna Embed (Hex)</label>
                            <input type="color" value={perm.color} onChange={e => updatePermission(perm.id, 'color', e.target.value)} className="w-full h-9 bg-slate-950 border border-white/10 rounded cursor-pointer" />
                        </div>
                        <div className="space-y-1 flex flex-col justify-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={perm.requireDate} onChange={e => updatePermission(perm.id, 'requireDate', e.target.checked)} className="rounded bg-slate-900 border-white/10 text-amber-500" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Wajib Tanggal (Mulai - Sampai)</span>
                            </label>
                        </div>
                    </div>

                    {/* Webhook */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-blue-500/20">
                        <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Webhook Discord URL</label>
                        <input 
                            type="text" 
                            value={getWebhookUrl(perm.webhookKey)}
                            onChange={(e) => setWebhookUrl(perm.webhookKey, e.target.value)} // Update LS directly
                            placeholder="https://discord.com/api/webhooks/..."
                            className="w-full bg-slate-900 border border-white/10 rounded px-2 py-2 text-[10px] text-white outline-none focus:border-blue-500/50"
                        />
                    </div>

                    {/* Custom Fields Builder */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Daftar Pertanyaan Custom</label>
                            <button onClick={() => addField(perm.id)} className="text-[9px] text-amber-500 hover:text-white uppercase font-bold">+ Tambah Pertanyaan</button>
                        </div>
                        <div className="space-y-2">
                            {perm.fields?.map((field, idx) => (
                                <div key={field.id} className="flex gap-2 items-start bg-white/5 p-2 rounded border border-white/5">
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <input 
                                            type="text" 
                                            value={field.label} 
                                            onChange={e => updateField(perm.id, field.id, 'label', e.target.value)} 
                                            placeholder="Label Pertanyaan"
                                            className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                                        />
                                        <input 
                                            type="text" 
                                            value={field.placeholder} 
                                            onChange={e => updateField(perm.id, field.id, 'placeholder', e.target.value)} 
                                            placeholder="Placeholder..."
                                            className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-[10px] text-slate-400"
                                        />
                                        <select 
                                            value={field.type} 
                                            onChange={e => updateField(perm.id, field.id, 'type', e.target.value)}
                                            className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                                        >
                                            <option value="text">Teks Singkat</option>
                                            <option value="textarea">Paragraf</option>
                                            <option value="number">Angka</option>
                                        </select>
                                    </div>
                                    <button onClick={() => removeField(perm.id, field.id)} className="text-red-500 hover:text-red-400 p-1">✕</button>
                                </div>
                            ))}
                            {(!perm.fields || perm.fields.length === 0) && (
                                <p className="text-[9px] text-slate-600 italic text-center py-2">Belum ada pertanyaan kustom.</p>
                            )}
                        </div>
                    </div>
                 </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionManager;
