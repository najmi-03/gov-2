
import React, { useState, useRef } from 'react';
import { RecruitmentConfig } from '../types';
import { saveToDatabase } from '../services/databaseService';

interface RegistrationFormProps {
  config: RecruitmentConfig; // Sekarang wajib menerima config dari App.tsx
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ config }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ImgBB Upload States
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!config.allowMultipleImages && fileUrls.length >= 1) {
       setUploadError('Anda hanya diizinkan mengunggah 1 foto.');
       return;
    }

    const file = files[0]; // Currently process one by one unless multiple selected not supported easily by native file input without 'multiple'

    if (!file.type.startsWith('image/')) {
        setUploadError('Mohon unggah file berupa gambar (JPG, PNG, dll).');
        return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ukuran gambar maksimal 5MB.');
        return;
    }

    setIsUploadingFile(true);
    setUploadError('');
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Membutuhkan VITE_IMGBB_API_KEY di .env
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        if (!apiKey) {
            throw new Error("ImgBB API Key belum diatur di .env (VITE_IMGBB_API_KEY)");
        }

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
            setFileUrls(prev => [...prev, data.data.url]);
            setUploadError('');
            if (fileInputRef.current) {
               fileInputRef.current.value = ''; // reset so we can upload another
            }
        } else {
            throw new Error(data.error?.message || 'Gagal mengunggah gambar');
        }
    } catch (error: any) {
        console.error("Upload Error:", error);
        setUploadError(error.message || 'Terjadi kesalahan saat mengunggah gambar.');
    } finally {
        setIsUploadingFile(false);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
      setFileUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");
    
    setIsSubmitting(true);

    try {
        // Persiapkan Data Payload Dinamis
        const dynamicData: Record<string, string> = {};
        
        // Tambahkan Timestamp Manual
        dynamicData["Waktu Submit"] = new Date().toLocaleString('id-ID');

        // Loop semua pertanyaan untuk menyusun data JSON
        config.questions.forEach(q => {
            const answer = answers[q.id] || "-";
            dynamicData[q.label] = answer;
        });
        
        if (fileUrls.length > 0) {
            dynamicData["Lampiran Foto (URL)"] = fileUrls.join(', ');
        }
        
        console.log("Data to save:", dynamicData);

        // 2. Simpan ke Turso
        console.log("Calling saveToDatabase...");
        const success = await saveToDatabase('RESPONSES', { data: dynamicData, batch_name: config.targetSheetName });
        console.log("saveToDatabase result:", success);

        alert(`✅ Pendaftaran Berhasil!\n\nData Anda telah dikirim ke database pusat.\nTerima kasih telah mendaftar.`);
        setAnswers({});
        setFileUrls([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Script Error", error);
        alert("❌ Gagal mengirim data. Pastikan koneksi internet stabil atau hubungi admin jika masalah berlanjut.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="recruitment" className="py-24 px-4 bg-transparent">
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
                
                {/* Upload Foto Lampiran */}
                {config.allowImageUpload && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                      <label className="text-xs uppercase tracking-wide block font-medium text-slate-400">
                          Lampiran Foto / Dokumen <span className="text-slate-600 text-[10px] normal-case tracking-normal">(Opsional)</span>
                      </label>
                      {config.imageUploadDescription && (
                          <p className="text-[10px] text-slate-500 mb-2">{config.imageUploadDescription}</p>
                      )}
                      <div className="flex flex-col gap-3">
                          <div className="relative flex items-center h-12 w-full bg-slate-900 border border-white/10 rounded-lg overflow-hidden focus-within:border-amber-500/50 transition-all duration-300">
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  multiple={config.allowMultipleImages}
                                  onChange={handleFileUpload}
                                  ref={fileInputRef}
                                  disabled={isUploadingFile || (!config.allowMultipleImages && fileUrls.length >= 1)}
                                  className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10"
                              />
                              <div className="flex items-center justify-between w-full px-4 py-3 z-0">
                                  <span className="text-sm text-slate-400 truncate">
                                      {isUploadingFile ? 'Mengunggah gambar...' : (!config.allowMultipleImages && fileUrls.length >= 1 ? 'Maksimal gambar tercapai' : 'Klik untuk memilih gambar...')}
                                  </span>
                                  <div className="bg-slate-800 text-slate-300 px-3 py-1 text-xs rounded border border-white/5 whitespace-nowrap">
                                      Pilih File
                                  </div>
                              </div>
                          </div>
                          
                          {uploadError && (
                              <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                          )}
                          
                          {fileUrls.length > 0 && (
                             <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                               {fileUrls.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-lg gap-2">
                                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                                        <img src={url} alt={`Preview ${idx}`} className="w-8 h-8 object-cover rounded bg-slate-800 flex-shrink-0" />
                                        <span className="text-emerald-500 text-[10px] md:text-xs truncate" title={url}>
                                            Gambar {idx + 1} berhasil diunggah
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(idx)}
                                        className="text-red-400 hover:text-red-300 text-[10px] md:text-xs bg-red-950/50 px-2 py-1 rounded whitespace-nowrap"
                                    >
                                        Hapus
                                    </button>
                                </div>
                               ))}
                              </div>
                          )}
                      </div>
                  </div>
                )}

                <button 
                    disabled={isSubmitting || isUploadingFile}
                    className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition-all duration-300 uppercase tracking-widest text-xs disabled:opacity-50 mt-8 active:scale-95 hover:shadow-amber-500/40 hover:-translate-y-1"
                >
                    {isSubmitting ? 'MENGIRIM DATA...' : isUploadingFile ? 'TUNGGU...' : 'KIRIM LAMARAN'}
                </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
