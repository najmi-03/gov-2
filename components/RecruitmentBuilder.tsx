
import React, { useState, useEffect } from 'react';
import { RecruitmentConfig, RecruitmentQuestion } from '../types';
import { DEFAULT_RECRUITMENT_CONFIG } from '../constants';

interface RecruitmentBuilderProps {
  config: RecruitmentConfig;
  onSave: (config: RecruitmentConfig) => void;
}

const RecruitmentBuilder: React.FC<RecruitmentBuilderProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<RecruitmentConfig>(config);
  const [showGuide, setShowGuide] = useState(false);
  
  // Update local state when parent prop changes (real-time sync)
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const addQuestion = () => {
    const newQ: RecruitmentQuestion = {
      id: `q-${Date.now()}`,
      label: 'Pertanyaan Baru',
      type: 'SHORT',
      required: true,
      isBold: false
    };
    setLocalConfig(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
  };

  const removeQuestion = (id: string) => {
    setLocalConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const updateQuestion = (id: string, field: keyof RecruitmentQuestion, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...localConfig.questions];
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < newQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    setLocalConfig(prev => ({ ...prev, questions: newQuestions }));
  };

  // AMAN: Hanya mereset layout pertanyaan, tapi mempertahankan Link Database
  const handleSoftReset = () => {
    if (confirm("Hapus semua pertanyaan dan kembali ke template dasar? (Link Database TIDAK akan dihapus)")) {
        setLocalConfig(prev => ({
            ...prev,
            questions: DEFAULT_RECRUITMENT_CONFIG.questions,
            title: DEFAULT_RECRUITMENT_CONFIG.title,
            description: DEFAULT_RECRUITMENT_CONFIG.description
        }));
    }
  };

  // BAHAYA: Mereset total ke pengaturan pabrik
  const handleHardReset = () => {
    if (confirm("⚠️ PERINGATAN: Ini akan menghapus Link Database, Nama Sheet, dan semua Pertanyaan ke pengaturan awal developer. Lanjutkan?")) {
        setLocalConfig(DEFAULT_RECRUITMENT_CONFIG);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <span>📝</span> Form Builder (HR Admin)
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
          Atur pertanyaan rekrutmen di sini. Formulir akan otomatis diperbarui di halaman publik.
        </p>
      </div>

      {/* PANDUAN KONEKSI */}
      <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                ⚙️ Panduan Koneksi Database
            </h4>
            <button onClick={() => setShowGuide(!showGuide)} className="text-[9px] text-slate-400 underline hover:text-white">
                {showGuide ? 'Sembunyikan' : 'Tampilkan Cara Setup'}
            </button>
        </div>

        {showGuide && (
            <div className="text-[10px] text-slate-300 space-y-3 pl-2 border-l border-blue-500/20">
                <p>Agar data masuk otomatis, ikuti langkah ini:</p>
                <ol className="list-decimal pl-4 space-y-2">
                    <li>Buka <a href="https://sheets.new" target="_blank" className="text-amber-500 underline">Google Spreadsheet Baru</a>. Beri nama (misal: "Database Gov").</li>
                    <li>Di menu atas Spreadsheet, klik <b>Extensions (Ekstensi) {'>'} Apps Script</b>.</li>
                    <li>Hapus semua kode di sana, Paste kode script yang diberikan developer.</li>
                    <li>Simpan, lalu klik tombol biru <b>Deploy {'>'} New Deployment</b>.</li>
                    <li>Pilih type: <b>Web App</b>.</li>
                    <li>
                        <b>PENTING:</b> Set "Execute as" = <b>Me</b>, dan "Who has access" = <b>Anyone (Siapa Saja)</b>.
                    </li>
                    <li>Klik Deploy. Salin URL yang berakhiran <b>/exec</b> ke kolom "Script URL" di bawah ini.</li>
                </ol>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Judul Sesi Rekrutmen</label>
          <input 
            type="text" 
            value={localConfig.title}
            onChange={e => setLocalConfig({...localConfig, title: e.target.value})}
            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
          />
        </div>
        
        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Target Nama Sheet (Excel)</label>
          <input 
            type="text" 
            value={localConfig.targetSheetName}
            onChange={e => setLocalConfig({...localConfig, targetSheetName: e.target.value})}
            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-amber-400 focus:border-amber-500/50 outline-none"
            placeholder="Contoh: Batch_6"
          />
          <p className="text-[8px] text-slate-500">Jika nama sheet belum ada di Excel, sistem akan mencoba membuatnya otomatis.</p>
        </div>

        {/* Description Field */}
        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4 md:col-span-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi / Persyaratan</label>
          <textarea 
            rows={3}
            value={localConfig.description || ''}
            onChange={e => setLocalConfig({...localConfig, description: e.target.value})}
            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
            placeholder="Jelaskan persyaratan umum atau informasi tambahan..."
          />
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4 md:col-span-2">
          <div className="flex justify-between items-center">
             <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Google Apps Script Web App URL</label>
             <div className="flex gap-2">
                <button onClick={handleSoftReset} className="text-[9px] font-bold text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-all uppercase" title="Hanya reset pertanyaan">
                    ↺ Reset Pertanyaan
                </button>
                <button onClick={handleHardReset} className="text-[9px] font-bold text-red-500 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-all uppercase" title="Reset Total (Bahaya)">
                    ⚠ Factory Reset
                </button>
             </div>
          </div>
          <input 
            type="text" 
            value={localConfig.scriptUrl}
            onChange={e => setLocalConfig({...localConfig, scriptUrl: e.target.value})}
            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-blue-400 focus:border-amber-500/50 outline-none font-mono break-all"
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <p className="text-[8px] text-slate-500">Pastikan URL berakhiran <b>/exec</b>.</p>
        </div>

        {/* INPUT LINK VIEW SPREADSHEET */}
        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4 md:col-span-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Link Google Spreadsheet (Utama)</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
                type="text" 
                value={localConfig.spreadsheetUrl || ''}
                onChange={e => setLocalConfig({...localConfig, spreadsheetUrl: e.target.value})}
                className="flex-1 bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-green-400 focus:border-amber-500/50 outline-none"
                placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            {localConfig.spreadsheetUrl && (
                <a 
                    href={localConfig.spreadsheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20 whitespace-nowrap"
                >
                    📂 Buka Data
                </a>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Daftar Pertanyaan ({localConfig.questions.length})</h4>
                <button onClick={addQuestion} className="bg-amber-500 text-slate-950 px-3 py-2 md:px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-amber-400">
                    + Tambah
                </button>
            </div>

            {/* SCROLLABLE AREA UNTUK BANYAK PERTANYAAN */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 border border-white/5 rounded-xl p-2">
                {localConfig.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-900 border border-white/10 p-3 md:p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start group">
                        <div className="flex flex-row md:flex-col gap-2 md:gap-1 pt-1 w-full md:w-auto justify-between md:justify-start">
                            <span className="text-[9px] font-bold text-slate-500 md:hidden">#{idx + 1}</span>
                            <div className="flex gap-2">
                                <button onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-20 px-2 py-1 bg-white/5 rounded">▲</button>
                                <button onClick={() => moveQuestion(idx, 'down')} disabled={idx === localConfig.questions.length - 1} className="text-slate-500 hover:text-white disabled:opacity-20 px-2 py-1 bg-white/5 rounded">▼</button>
                            </div>
                            <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 w-8 h-8 rounded flex items-center justify-center md:hidden">✕</button>
                        </div>

                        <div className="flex-1 space-y-3 w-full">
                            <div className="flex flex-col md:flex-row gap-2">
                                <input 
                                    type="text" 
                                    value={q.label}
                                    onChange={e => updateQuestion(q.id, 'label', e.target.value)}
                                    className={`flex-1 bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none ${q.isBold ? 'font-bold' : ''}`}
                                    placeholder={`Pertanyaan #${idx + 1}...`}
                                />
                                <select 
                                    value={q.type}
                                    onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                                    className="bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 outline-none"
                                >
                                    <option value="SHORT">Teks Singkat</option>
                                    <option value="PARAGRAPH">Paragraf</option>
                                    <option value="CHOICE">Pilihan Ganda</option>
                                </select>
                            </div>

                            {q.type === 'CHOICE' && (
                                <div className="bg-slate-950/50 p-3 rounded border border-white/5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Opsi Pilihan (Pisahkan dengan koma)</label>
                                    <textarea 
                                        value={q.options?.join(', ')}
                                        onChange={e => updateQuestion(q.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 h-16"
                                        placeholder="Contoh: Pria, Wanita, Tidak Menyebutkan"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-2 py-1 rounded border border-white/5">
                                    <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.id, 'required', e.target.checked)} />
                                    <span className="text-[9px] text-slate-400 uppercase font-bold">Wajib</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-2 py-1 rounded border border-white/5">
                                    <input type="checkbox" checked={q.isBold} onChange={e => updateQuestion(q.id, 'isBold', e.target.checked)} />
                                    <span className="text-[9px] text-slate-400 uppercase font-bold">Bold</span>
                                </label>
                            </div>
                        </div>

                        <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 w-8 h-8 rounded hidden md:flex items-center justify-center self-center">✕</button>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
         <button onClick={() => onSave(localConfig)} className="flex-1 bg-amber-500 text-slate-950 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
            Simpan Konfigurasi
         </button>
      </div>
    </div>
  );
};

export default RecruitmentBuilder;
