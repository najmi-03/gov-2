
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendToDiscord } from '../services/discordService';
import { AuthState } from '../types';

interface FeedbackFloatingProps {
  auth: AuthState;
}

const FeedbackFloating: React.FC<FeedbackFloatingProps> = ({ auth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Saran');
  const [isSending, setIsSending] = useState(false);

  const isStaff = !!auth.staffName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tentukan Webhook berdasarkan status login
    const webhookKey = isStaff ? 'ls_gov_feedback_staff' : 'ls_gov_feedback_public';
    const webhookUrl = localStorage.getItem(webhookKey);

    if (!webhookUrl) {
      alert("Sistem Aspirasi belum dikonfigurasi oleh Departemen Social Affairs.");
      return;
    }

    setIsSending(true);

    const embed = {
      title: isStaff ? "📢 ASPIRASI INTERNAL STAFF" : "📩 KOTAK SARAN WARGA",
      description: message,
      color: isStaff ? 3447003 : 5763719, // Blue for Staff, Green for Public
      fields: [
        { name: "Kategori", value: category, inline: true },
        { name: "Pengirim", value: isStaff ? `${auth.staffName} (${auth.role})` : "Warga Sipil (Anonim)", inline: true },
      ],
      footer: { text: "Sistem Layanan Aspirasi & Pengaduan Online" },
      timestamp: new Date().toISOString()
    };

    const success = await sendToDiscord(webhookUrl, { embeds: [embed] });

    if (success) {
      alert("Terima kasih! Masukan Anda telah kami terima.");
      setMessage('');
      setIsOpen(false);
    } else {
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    }
    setIsSending(false);
  };

  return (
    <>
      {/* TOMBOL FLOATING */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 md:w-14 md:h-14 bg-slate-900 border border-amber-500/50 text-amber-500 rounded-full shadow-2xl shadow-amber-500/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-amber-500 hover:text-slate-950 group active:scale-95 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        title="Kritik & Saran"
      >
        <span className="text-xl md:text-2xl group-hover:animate-bounce">💬</span>
        {/* Label on Hover (Desktop) */}
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-white/10 uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block shadow-xl">
          Kritik & Saran
        </span>
      </button>

      {/* MODAL FORM */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    Kritik & Saran
                  </h3>
                  <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">
                    {isStaff ? `Logged as: ${auth.staffName}` : 'Layanan Publik'}
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 text-slate-500 hover:text-white flex items-center justify-center transition-all hover:bg-white/10">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Kategori</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50 transition-all"
                  >
                    <option value="Saran">💡 Saran Pengembangan</option>
                    <option value="Kritik">⚠️ Kritik Kinerja</option>
                    <option value="Apresiasi">👏 Apresiasi</option>
                    <option value="Laporan Bug">🐛 Laporan Bug Portal</option>
                    {isStaff && <option value="Pengaduan Internal">🔒 Pengaduan Internal (Confidential)</option>}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pesan Anda</label>
                  <textarea 
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isStaff ? "Sampaikan masukan untuk kemajuan departemen..." : "Tulis kritik atau saran Anda untuk pemerintah..."}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 placeholder:text-slate-700 transition-all focus:shadow-inner"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    disabled={isSending}
                    className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 hover:-translate-y-1"
                  >
                    {isSending ? 'MENGIRIM...' : 'KIRIM MASUKAN'}
                  </button>
                  <p className="text-[9px] text-slate-600 text-center mt-3">
                    {isStaff 
                      ? "Identitas Anda akan tercatat demi akuntabilitas." 
                      : "Pesan dikirim secara anonim (kecuali Anda menuliskannya)."}
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackFloating;
