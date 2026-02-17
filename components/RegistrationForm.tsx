
import React, { useState } from 'react';
import { RecruitmentConfig } from '../types';

interface RegistrationFormProps {
  config: RecruitmentConfig; // Sekarang wajib menerima config dari App.tsx
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ config }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.scriptUrl) {
      alert("Sistem Rekrutmen Sedang Offline (Admin belum mengatur Script URL).");
      return;
    }
    
    setIsSubmitting(true);

    try {
        // Persiapkan Data Payload Dinamis
        // Kunci object adalah LABEL PERTANYAAN
        const dynamicData: Record<string, string> = {};
        
        // Tambahkan Timestamp Manual
        dynamicData["Waktu Submit"] = new Date().toLocaleString('id-ID');

        // Pastikan nama sheet bersih dari spasi berlebih
        const cleanSheetName = (config.targetSheetName || "Rekrutmen_Responses").trim();

        // Loop semua pertanyaan untuk menyusun data JSON
        // Menggunakan label sebagai key agar di Google Sheet header-nya sesuai label
        config.questions.forEach(q => {
            const answer = answers[q.id] || "-";
            dynamicData[q.label] = answer;
        });

        // Struktur Payload yang Benar untuk Script Google Apps Generic
        const payload = {
            sheetName: cleanSheetName,
            action: "submit_form", // Flag opsional untuk script tertentu
            data: dynamicData
        };

        // Debugging di Console
        console.log("Mengirim ke Sheet:", cleanSheetName, payload);

        await fetch(config.scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk bypass CORS Google Script
            headers: { 
                'Content-Type': 'application/json' // Ubah ke JSON agar script lebih mudah parsing
            },
            body: JSON.stringify(payload)
        });

        // Karena mode no-cors, kita asumsikan sukses jika tidak ada network error
        alert(`✅ Pendaftaran Berhasil!\n\nData Anda telah dikirim ke database: ${cleanSheetName}.\nTerima kasih telah mendaftar.`);
        
        setAnswers({});
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Script Error", error);
        alert("❌ Gagal mengirim data. Pastikan koneksi internet stabil atau hubungi admin jika masalah berlanjut.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="recruitment" className="py-24 px-4 bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start bg-slate-900/40 p-6 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-amber-500/20">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>

          <div className="md:w-1/3 relative z-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Karir <br/> <span className="text-amber-500">Pemerintahan</span>
            </h2>
            <div className="p-4 bg-white/5 border-l-4 border-amber-500 rounded-r-lg mb-6 hover:bg-white/10 transition-colors">
              <p className="text-sm text-slate-300 italic font-medium">
                "{config.title}"
              </p>
            </div>
            
            {config.description && (
                <div className="mb-4 p-4 bg-slate-950/50 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Persyaratan & Informasi</h4>
                    <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">
                        {config.description}
                    </p>
                </div>
            )}

            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Silakan lengkapi formulir di samping dengan data yang jujur dan valid. Data Anda akan masuk ke database <b>{config.targetSheetName?.replace(/_/g, ' ') || 'Pusat'}</b>.
            </p>
            <div className="text-[10px] text-slate-500 mt-4 border-t border-white/5 pt-4">
                <p>Info Teknis:</p>
                <p>Status Form: {config.isOpen ? '🟢 Dibuka' : '🔴 Ditutup'}</p>
                <p>Total Pertanyaan: {config.questions.length}</p>
            </div>
          </div>
          
          <div className="md:w-2/3 w-full bg-slate-950 border border-white/10 rounded-2xl p-6 relative z-10 hover:border-white/20 transition-all duration-300">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
              Formulir Pendaftaran Digital
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {config.questions.map((q) => (
                    <div key={q.id} className="space-y-2">
                        <label className={`text-xs uppercase tracking-wide block ${q.isBold ? 'font-bold text-white' : 'font-medium text-slate-400'}`}>
                            {q.label} {q.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {q.type === 'SHORT' && (
                            <input 
                                type="text" 
                                required={q.required}
                                placeholder={q.placeholder}
                                value={answers[q.id] || ''}
                                onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none placeholder:text-slate-700 transition-all duration-300 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            />
                        )}

                        {q.type === 'PARAGRAPH' && (
                            <textarea 
                                required={q.required}
                                rows={4}
                                placeholder={q.placeholder}
                                value={answers[q.id] || ''}
                                onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none placeholder:text-slate-700 transition-all duration-300 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            />
                        )}

                        {q.type === 'CHOICE' && (
                            <div className="relative">
                                <select 
                                    required={q.required}
                                    value={answers[q.id] || ''}
                                    onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none transition-all duration-300 cursor-pointer"
                                >
                                    <option value="">-- Pilih Opsi --</option>
                                    {q.options?.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                            </div>
                        )}
                    </div>
                ))}

                <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all duration-300 uppercase tracking-widest text-xs disabled:opacity-50 mt-8 active:scale-95 hover:shadow-amber-500/40 hover:-translate-y-1"
                >
                    {isSubmitting ? 'MENGIRIM DATA...' : 'KIRIM LAMARAN'}
                </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
