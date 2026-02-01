
import React, { useState } from 'react';
import { PermissionConfig } from '../types';
import { sendToDiscord } from '../services/discordService';

interface StaffPermissionPortalProps {
  permissions: PermissionConfig[];
  staffName: string;
}

const StaffPermissionPortal: React.FC<StaffPermissionPortalProps> = ({ permissions, staffName }) => {
  const [selectedPerm, setSelectedPerm] = useState<PermissionConfig | null>(null);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerm) return;

    const webhookUrl = localStorage.getItem(selectedPerm.webhookKey);
    if (!webhookUrl) {
      alert("Sistem error: Webhook belum dikonfigurasi HR.");
      return;
    }

    setIsSending(true);

    const embed = {
      title: `📑 PENGAJUAN: ${selectedPerm.title.toUpperCase()}`,
      color: parseInt(selectedPerm.color.replace('#', ''), 16),
      fields: [
        { name: "👤 Nama Pegawai", value: staffName, inline: true },
        { name: "📋 Jenis Izin", value: selectedPerm.title, inline: true },
        { name: "📝 Alasan", value: reason, inline: false }
      ],
      footer: { text: "Sistem Administrasi Kepegawaian San Andreas" },
      timestamp: new Date().toISOString()
    };

    if (selectedPerm.requireDate) {
        embed.fields.push(
            { name: "📅 Mulai", value: startDate || '-', inline: true },
            { name: "📅 Sampai", value: endDate || '-', inline: true }
        );
    }

    const payload = {
        content: `🔔 **Izin Baru dari ${staffName}**`,
        embeds: [embed]
    };

    const success = await sendToDiscord(webhookUrl, payload);
    
    if (success) {
        alert("Pengajuan izin berhasil dikirim!");
        setReason('');
        setStartDate('');
        setEndDate('');
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
          Halo, <span className="text-white font-bold">{staffName}</span>. Silakan pilih jenis izin yang ingin diajukan.
        </p>
      </div>

      {!selectedPerm ? (
        <div className="grid grid-cols-2 gap-4">
            {permissions.map(perm => (
                <button 
                    key={perm.id}
                    onClick={() => setSelectedPerm(perm)}
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
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alasan Pengajuan</label>
                    <textarea 
                        required
                        rows={4}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                        placeholder="Jelaskan detail keperluan..."
                    />
                </div>

                {selectedPerm.requireDate && (
                    <div className="grid grid-cols-2 gap-4">
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
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                            />
                        </div>
                    </div>
                )}

                <button 
                    disabled={isSending}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 mt-4 disabled:opacity-50"
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
