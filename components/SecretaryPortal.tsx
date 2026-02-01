
import React, { useState, useEffect } from 'react';
import { sendToDiscord } from '../services/discordService';
import { AdminRole } from '../types';

interface SecretaryPortalProps {
  staffName: string;
  role: AdminRole;
}

const SecretaryPortal: React.FC<SecretaryPortalProps> = ({ staffName, role }) => {
  const [activeTab, setActiveTab] = useState<'AGENDA' | 'EVALUASI' | 'CATATAN'>('AGENDA');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Form States
  const [agenda, setAgenda] = useState({ title: '', date: '', location: '', details: '', participants: '' });
  const [evalData, setEvalData] = useState({ dept: '', topic: '', result: '', improvement: '' });
  const [note, setNote] = useState({ subject: '', content: '' });

  useEffect(() => {
    const savedWebhook = localStorage.getItem('ls_gov_sec_webhook');
    if (savedWebhook) setWebhookUrl(savedWebhook);
  }, []);

  const handleConfigSave = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('ls_gov_sec_webhook', url);
  };

  const handleAgendaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return alert("Webhook belum diatur oleh Secretary of State!");
    setIsSending(true);

    const embed = {
      title: "📅 AGENDA KEGIATAN PEMERINTAH",
      color: 3447003, // Blue
      fields: [
        { name: "Nama Kegiatan", value: agenda.title, inline: true },
        { name: "Waktu & Tanggal", value: agenda.date, inline: true },
        { name: "Lokasi", value: agenda.location, inline: true },
        { name: "Peserta/Departemen", value: agenda.participants || "-", inline: false },
        { name: "Detail Kegiatan", value: agenda.details, inline: false },
        { name: "Notulen", value: staffName, inline: true }
      ],
      footer: { text: "Sekretariat Negara San Andreas" },
      timestamp: new Date().toISOString()
    };

    const success = await sendToDiscord(webhookUrl, { embeds: [embed] });
    if (success) {
        alert("Agenda berhasil dikirim!");
        setAgenda({ title: '', date: '', location: '', details: '', participants: '' });
    } else {
        alert("Gagal mengirim laporan.");
    }
    setIsSending(false);
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return alert("Webhook belum diatur!");
    setIsSending(true);

    const embed = {
      title: "⚖️ LAPORAN EVALUASI DEPARTEMEN",
      color: 15105570, // Orange
      fields: [
        { name: "Departemen Terkait", value: evalData.dept, inline: true },
        { name: "Topik Evaluasi", value: evalData.topic, inline: true },
        { name: "Hasil/Temuan", value: evalData.result, inline: false },
        { name: "Saran Perbaikan", value: evalData.improvement, inline: false },
        { name: "Evaluator", value: staffName, inline: true }
      ],
      footer: { text: "Divisi Pengawasan Internal" },
      timestamp: new Date().toISOString()
    };

    const success = await sendToDiscord(webhookUrl, { embeds: [embed] });
    if (success) {
        alert("Evaluasi berhasil dikirim!");
        setEvalData({ dept: '', topic: '', result: '', improvement: '' });
    } else {
        alert("Gagal mengirim laporan.");
    }
    setIsSending(false);
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return alert("Webhook belum diatur!");
    setIsSending(true);

    const embed = {
      title: "📝 CATATAN INTERNAL / NOTULENSI",
      color: 9807270, // Grey
      description: note.content,
      fields: [
        { name: "Subjek", value: note.subject, inline: true },
        { name: "Penulis", value: staffName, inline: true }
      ],
      footer: { text: "Arsip Sekretariat" },
      timestamp: new Date().toISOString()
    };

    const success = await sendToDiscord(webhookUrl, { embeds: [embed] });
    if (success) {
        alert("Catatan tersimpan!");
        setNote({ subject: '', content: '' });
    } else {
        alert("Gagal menyimpan.");
    }
    setIsSending(false);
  };

  const isSecState = role === 'SECRETARY_OF_STATE';

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <span>📠</span> Portal Sekretariat Negara
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
            Selamat datang, <b>{staffName}</b>. Kelola administrasi negara di sini.
            </p>
        </div>
        {isSecState && (
            <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/20 w-full md:w-auto">
                <label className="text-[8px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Konfigurasi Webhook (Secretary of State)</label>
                <input 
                    type="text" 
                    value={webhookUrl}
                    onChange={(e) => handleConfigSave(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-amber-500/50"
                />
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
        <button onClick={() => setActiveTab('AGENDA')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'AGENDA' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>📅 Agenda Kegiatan</button>
        <button onClick={() => setActiveTab('EVALUASI')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'EVALUASI' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>⚖️ Evaluasi Dept</button>
        <button onClick={() => setActiveTab('CATATAN')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'CATATAN' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>📝 Catatan Internal</button>
      </div>

      <div className="bg-slate-950 border border-white/10 rounded-2xl p-6">
        {/* AGENDA FORM */}
        {activeTab === 'AGENDA' && (
            <form onSubmit={handleAgendaSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nama Kegiatan</label>
                        <input type="text" required value={agenda.title} onChange={e => setAgenda({...agenda, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waktu & Tanggal</label>
                        <input type="text" required placeholder="Contoh: Senin, 20 Mei - 19:00 WIB" value={agenda.date} onChange={e => setAgenda({...agenda, date: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lokasi</label>
                    <input type="text" required value={agenda.location} onChange={e => setAgenda({...agenda, location: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Peserta / Departemen Terkait</label>
                    <input type="text" value={agenda.participants} onChange={e => setAgenda({...agenda, participants: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Detail Rangkaian Acara</label>
                    <textarea required rows={5} value={agenda.details} onChange={e => setAgenda({...agenda, details: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Deskripsikan rundown atau detail kegiatan..."></textarea>
                </div>
                <button disabled={isSending} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400">
                    {isSending ? 'Mengirim...' : 'Publikasikan Agenda'}
                </button>
            </form>
        )}

        {/* EVALUASI FORM */}
        {activeTab === 'EVALUASI' && (
            <form onSubmit={handleEvalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Departemen Target</label>
                        <select required value={evalData.dept} onChange={e => setEvalData({...evalData, dept: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50">
                            <option value="">-- Pilih --</option>
                            <option value="Home Affairs">Home Affairs</option>
                            <option value="Homeland Defense">Homeland Defense</option>
                            <option value="Health Services">Health Services</option>
                            <option value="Social Affairs">Social Affairs</option>
                            <option value="Treasury">Treasury</option>
                            <option value="Human Resource">Human Resource</option>
                            <option value="All Departments">Semua Departemen</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Topik / Isu</label>
                        <input type="text" required value={evalData.topic} onChange={e => setEvalData({...evalData, topic: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hasil Temuan / Masalah</label>
                    <textarea required rows={4} value={evalData.result} onChange={e => setEvalData({...evalData, result: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Jelaskan kondisi lapangan..."></textarea>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saran Perbaikan / Instruksi</label>
                    <textarea required rows={4} value={evalData.improvement} onChange={e => setEvalData({...evalData, improvement: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Langkah yang harus diambil..."></textarea>
                </div>
                <button disabled={isSending} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400">
                    {isSending ? 'Mengirim...' : 'Kirim Laporan Evaluasi'}
                </button>
            </form>
        )}

        {/* CATATAN FORM */}
        {activeTab === 'CATATAN' && (
            <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Subjek Catatan</label>
                    <input type="text" required value={note.subject} onChange={e => setNote({...note, subject: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Contoh: Notulensi Rapat Kabinet..." />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Isi Catatan</label>
                    <textarea required rows={10} value={note.content} onChange={e => setNote({...note, content: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Tulis catatan lengkap di sini..."></textarea>
                </div>
                <button disabled={isSending} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400">
                    {isSending ? 'Menyimpan...' : 'Simpan ke Arsip'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default SecretaryPortal;
