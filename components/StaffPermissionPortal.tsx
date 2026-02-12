
import React, { useState } from 'react';
import { PermissionConfig } from '../types';
import { sendToDiscord } from '../services/discordService';

interface StaffPermissionPortalProps {
  permissions: PermissionConfig[];
  staffName: string;
}

const StaffPermissionPortal: React.FC<StaffPermissionPortalProps> = ({ permissions, staffName }) => {
  const [selectedPerm, setSelectedPerm] = useState<PermissionConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleOpenForm = (perm: PermissionConfig) => {
      setSelectedPerm(perm);
      setFormData({});
      setStartDate('');
      setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerm) return;

    const webhookUrl = localStorage.getItem(selectedPerm.webhookKey);
    if (!webhookUrl) {
      alert("Sistem error: Webhook belum dikonfigurasi HR.");
      return;
    }

    setIsSending(true);

    // Build Fields from Custom Questions
    const embedFields = selectedPerm.fields?.map(field => ({
        name: field.label,
        value: formData[field.id] || '-',
        inline: field.type !== 'textarea'
    })) || [];

    // Add Metadata Fields (Name, Type)
    const finalFields = [
        { name: "👤 Nama Pegawai", value: staffName, inline: true },
        { name: "📋 Jenis Izin", value: selectedPerm.title, inline: true },
        ...embedFields
    ];

    // Add Dates if Required
    if (selectedPerm.requireDate) {
        finalFields.push(
            { name: "📅 Mulai", value: startDate || '-', inline: true },
            { name: "📅 Sampai", value: endDate || '-', inline: true }
        );
    }

    const embed = {
      title: `📑 PENGAJUAN: ${selectedPerm.title.toUpperCase()}`,
      color: parseInt(selectedPerm.color.replace('#', ''), 16),
      fields: finalFields,
      footer: { text: "Sistem Administrasi Kepegawaian San Andreas" },
      timestamp: new Date().toISOString()
    };

    const payload = {
        content: `🔔 **Izin Baru dari ${staffName}**`,
        embeds: [embed]
    };

    const success = await sendToDiscord(webhookUrl, payload);
    
    if (success) {
        alert("Pengajuan izin berhasil dikirim!");
        setSelectedPerm(null);
    } else {
        alert("Gagal mengirim. Cek koneksi atau hubungi HR.");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-blue-500">
        <h3 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <span>🎫</span> Loket Izin Pegawai
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
          Halo, <span className="text-white font-bold">{staffName.toUpperCase()}</span>. Silakan pilih jenis izin yang ingin diajukan.
        </p>
      </div>

      {!selectedPerm ? (
        <div className="grid grid-cols-2 gap-4">
            {permissions.map(perm => (
                <button 
                    key={perm.id}
                    onClick={() => handleOpenForm(perm)}
                    className="bg-slate-900 hover:bg-slate-800 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 group"
                >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{perm.icon}</span>
                    <span className="text-xs font-bold text-white uppercase text-center">{perm.title}</span>
                </button>
            ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedPerm.icon}</span>
                    <h4 className="text-lg font-bold text-white">{selectedPerm.title}</h4>
                </div>
                <button onClick={() => setSelectedPerm(null)} className="text-slate-500 hover:text-white text-xs uppercase font-bold">Batal</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* DYNAMIC FIELDS RENDERING */}
                {selectedPerm.fields?.map(field => (
                    <div key={field.id} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea 
                                required={field.required}
                                rows={4}
                                value={formData[field.id] || ''}
                                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                placeholder={field.placeholder}
                            />
                        ) : (
                            <input 
                                type={field.type}
                                required={field.required}
                                value={formData[field.id] || ''}
                                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                                placeholder={field.placeholder}
                            />
                        )}
                    </div>
                ))}

                {/* DATE FIELDS IF REQUIRED */}
                {selectedPerm.requireDate && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 mt-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tanggal Mulai</label>
                            <input 
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sampai Tanggal</label>
                            <input 
                                type="date"
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                            />
                        </div>
                    </div>
                )}

                <button 
                    disabled={isSending}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 mt-6 disabled:opacity-50"
                >
                    {isSending ? 'MENGIRIM...' : 'KIRIM PENGAJUAN'}
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default StaffPermissionPortal;
