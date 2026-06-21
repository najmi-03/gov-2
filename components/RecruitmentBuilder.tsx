
import React, { useState, useEffect } from 'react';
import { RecruitmentConfig, RecruitmentQuestion } from '../types';
import { DEFAULT_RECRUITMENT_CONFIG } from '../constants';
import { fetchFromDatabase } from '../services/databaseService';

interface RecruitmentBuilderProps {
  config: RecruitmentConfig;
  onSave: (config: RecruitmentConfig) => void;
}

const RecruitmentBuilder: React.FC<RecruitmentBuilderProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<RecruitmentConfig>(config);
  const [showGuide, setShowGuide] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [isFetchingResponses, setIsFetchingResponses] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [resetType, setResetType] = useState<'soft' | 'hard' | null>(null);
  const [questionIdToDelete, setQuestionIdToDelete] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleFetchResponses = async (batch?: string) => {
    setIsFetchingResponses(true);
    const data = await fetchFromDatabase('RESPONSES', batch && batch !== 'ALL' ? { batch } : undefined);
    if (data) setResponses(data);
    setIsFetchingResponses(false);
    setShowResponses(true);
  };

  // Get unique batches from responses for the filter dropdown
  const batches = ['ALL', ...Array.from(new Set(responses.map(r => r.batch_name).filter(Boolean)))];

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
    setQuestionIdToDelete(null);
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

  const handleSetThisWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(today);
    monday.setDate(diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };

    setStartDate(formatDate(monday));
    setEndDate(formatDate(sunday));
  };

  const filteredResponses = responses.filter(res => {
    if (!startDate && !endDate) return true;
    
    const resDate = new Date(res.submitted_at);
    resDate.setHours(0, 0, 0, 0);
    
    let isAfterStart = true;
    let isBeforeEnd = true;
    
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        isAfterStart = resDate >= start;
    }
    
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        isBeforeEnd = resDate <= end;
    }
    
    return isAfterStart && isBeforeEnd;
  });

  // AMAN: Hanya mereset layout pertanyaan, tapi mempertahankan Link Database
  const handleSoftReset = () => {
    setLocalConfig(prev => ({
        ...prev,
        questions: DEFAULT_RECRUITMENT_CONFIG.questions,
        title: DEFAULT_RECRUITMENT_CONFIG.title,
        description: DEFAULT_RECRUITMENT_CONFIG.description
    }));
    setResetType(null);
  };

  const exportToCSV = () => {
    if (filteredResponses.length === 0) return;
    
    // Get all unique keys from all response data to build headers
    const allKeys = new Set<string>();
    filteredResponses.forEach(res => {
        Object.keys(res.data).forEach(key => allKeys.add(key));
    });
    const headers = ['ID', 'Submitted At', 'Batch', ...Array.from(allKeys)];
    
    const csvRows = [];
    // Use semicolon as delimiter and wrap headers in quotes
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(';'));
    
    filteredResponses.forEach(res => {
        const row = [
            res.id,
            new Date(res.submitted_at).toLocaleString('id-ID'),
            res.batch_name || 'N/A',
            ...Array.from(allKeys).map(key => res.data[key] || '-')
        ];
        
        // Escape quotes and wrap all values in quotes
        const escapedRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
        csvRows.push(escapedRow.join(';'));
    });
    
    // Add BOM (\uFEFF) so Excel recognizes UTF-8 encoding automatically
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Rekrutmen_${selectedBatch}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // BAHAYA: Mereset total ke pengaturan pabrik
  const handleHardReset = () => {
    setLocalConfig(DEFAULT_RECRUITMENT_CONFIG);
    setResetType(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <span>📝</span> Form Builder (HR Admin)
          </h3>
          <div className="flex gap-2">
            <button onClick={() => handleFetchResponses()} className="text-[9px] font-bold text-green-400 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-600 hover:text-white transition-all uppercase">
                📂 Lihat Responses
            </button>
            
            {resetType === 'soft' ? (
                <div className="flex gap-1">
                    <button onClick={() => setResetType(null)} className="text-[8px] font-bold text-slate-500 px-2 py-1">Batal</button>
                    <button onClick={handleSoftReset} className="text-[8px] font-bold bg-blue-600 text-white px-2 py-1 rounded animate-pulse">Yakin Reset?</button>
                </div>
            ) : resetType === 'hard' ? (
                <div className="flex gap-1">
                    <button onClick={() => setResetType(null)} className="text-[8px] font-bold text-slate-500 px-2 py-1">Batal</button>
                    <button onClick={handleHardReset} className="text-[8px] font-bold bg-red-600 text-white px-2 py-1 rounded animate-pulse">Yakin Factory Reset?</button>
                </div>
            ) : (
                <>
                    <button onClick={() => setResetType('soft')} className="text-[9px] font-bold text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-all uppercase" title="Hanya reset pertanyaan">
                        ↺ Reset
                    </button>
                    <button onClick={() => setResetType('hard')} className="text-[9px] font-bold text-red-500 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-all uppercase" title="Reset Total (Bahaya)">
                        ⚠ Factory
                    </button>
                </>
            )}
          </div>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
          Atur pertanyaan rekrutmen di sini. Formulir akan otomatis diperbarui di halaman publik.
        </p>
      </div>

      {/* PANDUAN KONEKSI */}
      <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                ⚙️ Status Database
            </h4>
        </div>
        <div className="text-[10px] text-slate-300 space-y-3 pl-2 border-l border-blue-500/20">
            <p>Sistem Rekrutmen sekarang terhubung langsung ke <b>Turso Cloud Database</b>. Tidak perlu lagi menggunakan Google Apps Script.</p>
            <p className="text-amber-500 font-bold">Data pendaftaran akan masuk ke tabel 'recruitment_responses' di Turso.</p>
        </div>
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

        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4 md:col-span-2 opacity-50 pointer-events-none">
          <div className="flex justify-between items-center">
             <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Legacy Script URL (Disabled)</label>
          </div>
          <input 
            type="text" 
            value="Turso Database Active"
            disabled
            className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-blue-400 focus:border-amber-500/50 outline-none font-mono break-all"
          />
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

        {/* IMAGE UPLOAD CONFIG */}
        <div className="bg-slate-900 p-5 rounded-xl border border-white/10 space-y-4 md:col-span-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pengaturan Unggah Foto / Lampiran</label>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={localConfig.allowImageUpload || false}
                  onChange={(e) => setLocalConfig({...localConfig, allowImageUpload: e.target.checked})}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${localConfig.allowImageUpload ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localConfig.allowImageUpload ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-xs text-white">Aktifkan Unggah Foto</span>
            </label>
            
            {localConfig.allowImageUpload && (
               <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={localConfig.allowMultipleImages || false}
                    onChange={(e) => setLocalConfig({...localConfig, allowMultipleImages: e.target.checked})}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${localConfig.allowMultipleImages ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localConfig.allowMultipleImages ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-xs text-white">Bolehkan Lebih Dari 1 Foto</span>
              </label>
            )}
          </div>
          {localConfig.allowImageUpload && (
            <div className="pt-2 border-t border-white/5 space-y-2 mt-2">
              <label className="text-xs text-slate-400">Deskripsi / Label Foto</label>
              <input 
                type="text" 
                value={localConfig.imageUploadDescription || ''}
                onChange={e => setLocalConfig({...localConfig, imageUploadDescription: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
                placeholder="(Opsional) Tulis instruksi seperti: 'Unggah Foto Pas dan KTP...'"
              />
            </div>
          )}
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
                            
                            {questionIdToDelete === q.id ? (
                                <div className="flex flex-col gap-1 items-center">
                                    <button onClick={() => setQuestionIdToDelete(null)} className="text-[7px] text-slate-500 uppercase">Batal</button>
                                    <button onClick={() => removeQuestion(q.id)} className="text-[7px] text-red-500 font-bold uppercase animate-pulse">Hapus?</button>
                                </div>
                            ) : (
                                <button onClick={() => setQuestionIdToDelete(q.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 w-8 h-8 rounded flex items-center justify-center md:hidden">✕</button>
                            )}
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

                        {questionIdToDelete === q.id ? (
                            <div className="hidden md:flex flex-col gap-1 items-center self-center">
                                <button onClick={() => setQuestionIdToDelete(null)} className="text-[8px] text-slate-500 uppercase">Batal</button>
                                <button onClick={() => removeQuestion(q.id)} className="text-[8px] text-red-500 font-bold uppercase animate-pulse">Hapus?</button>
                            </div>
                        ) : (
                            <button onClick={() => setQuestionIdToDelete(q.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 w-8 h-8 rounded hidden md:flex items-center justify-center self-center">✕</button>
                        )}
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

      {/* RESPONSES MODAL */}
      {showResponses && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950">
                    <div>
                        <h3 className="text-lg font-bold text-white">Data Pendaftaran (Turso)</h3>
                        <p className="text-xs text-slate-500">Total: {filteredResponses.length} lamaran masuk</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Filter Batch:</span>
                            <select 
                                value={selectedBatch}
                                onChange={(e) => {
                                    setSelectedBatch(e.target.value);
                                    handleFetchResponses(e.target.value);
                                }}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-amber-500/50"
                            >
                                {batches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={() => setShowResponses(false)} className="text-slate-400 hover:text-white text-2xl ml-4">✕</button>
                    </div>
                </div>

                {/* DATE FILTER UI */}
                <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dari Tanggal</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handleSetThisWeek}
                            className="flex-1 sm:flex-none bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        >
                            📅 Minggu Ini
                        </button>
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="flex-1 sm:flex-none bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                ✕ Reset
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    {filteredResponses.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 italic">Belum ada data masuk.</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredResponses.map((res, i) => (
                                <div key={i} className="bg-slate-950 border border-white/5 p-5 rounded-2xl hover:border-amber-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">ID: {res.id} | {new Date(res.submitted_at).toLocaleString('id-ID')}</span>
                                            <span className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest">BATCH: {res.batch_name || 'N/A'}</span>
                                        </div>
                                        <span className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-2 py-1 rounded uppercase">NEW</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(res.data).map(([key, val]: [string, any]) => (
                                            <div key={key} className="space-y-1">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{key}</p>
                                                <p className="text-sm text-slate-200">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-between items-center">
                    <button 
                        onClick={exportToCSV}
                        disabled={filteredResponses.length === 0}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-green-500 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        📥 Export CSV ({selectedBatch})
                    </button>
                    <button onClick={() => setShowResponses(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-700 transition-all">Tutup</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentBuilder;
