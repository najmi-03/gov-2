
import React, { useState, useRef, useMemo } from 'react';
import { sendFileToDiscord } from '../services/discordService';
import { motion, AnimatePresence } from 'framer-motion';
import { FormConfig } from '../types';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronRight } from 'lucide-react';

interface CitizenIdentityFormProps {
  forms: FormConfig[];
  webhooks: Record<string, string>;
}

const GovernmentFormSection: React.FC<CitizenIdentityFormProps> = ({ forms, webhooks }) => {
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- NEW STATES FOR FILTER & SEARCH ---
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const categories = useMemo(() => {
    const cats = new Set(forms.map(f => f.category).filter(Boolean) as string[]);
    return ['Semua', ...Array.from(cats)];
  }, [forms]);

  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = activeCategory === 'Semua' || form.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [forms, searchQuery, activeCategory]);

  const handleOpenForm = (form: FormConfig) => {
    setSelectedForm(form);
    setFormData({});
    setFiles([]);
    setPreviews([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      const newFiles = [...files, ...selectedFiles];
      
      const totalSize = newFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > 25 * 1024 * 1024) {
        alert("Total ukuran semua file terlalu besar! Maksimal 25MB.");
        return;
      }

      setFiles(newFiles);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file as any));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const renderFormIcon = (iconName: string, className: string) => {
    if (!iconName) return null;
    const isImage = iconName.startsWith('http') || iconName.startsWith('data:image') || iconName.includes('.');
    if (isImage) {
      return <img src={iconName} alt="" className={className} />;
    }
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} strokeWidth={1.5} />;
    }
  
    // Fallback context: handle emojis safely
    return <span className={className.includes('w-') ? 'text-4xl md:text-5xl' : 'text-3xl'}>{iconName}</span>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    const mappedKey = webhooks[`map_form_${selectedForm.id}`] || selectedForm.webhookKey;
    const webhookUrl = webhooks[mappedKey] || webhooks[selectedForm.webhookKey];
    if (!webhookUrl) {
      alert(`Layanan ${selectedForm.title} sedang tidak aktif (Webhook belum diatur di Database).`);
      return;
    }

    if (files.length === 0) {
      alert("Harap unggah bukti foto pendukung!");
      return;
    }

    setIsSending(true);

    const discordFormData = new FormData();
    const fields = selectedForm.fields.map(field => ({
      name: field.label.toUpperCase(),
      value: formData[field.id] || "Tidak diisi",
      inline: field.type !== 'textarea'
    }));

    const payload = {
      content: `🔔 **PENGAJUAN BARU: ${selectedForm.title.toUpperCase()}**`,
      embeds: [{
        title: `📑 DOKUMEN ${selectedForm.title.toUpperCase()}`,
        color: 16753920,
        fields: fields,
        image: { url: `attachment://file_0_${files[0].name}` },
        timestamp: new Date().toISOString(),
        footer: { text: "Sistem Administrasi Pemerintah San Andreas" }
      }]
    };

    discordFormData.append('payload_json', JSON.stringify(payload));
    
    files.forEach((file, index) => {
      discordFormData.append(`files[${index}]`, file, `file_${index}_${file.name}`);
    });

    const success = await sendFileToDiscord(webhookUrl, discordFormData);

    if (success) {
      alert("Permohonan berhasil dikirim! Silakan tunggu kabar selanjutnya.");
      setSelectedForm(null);
    } else {
      alert("Gagal mengirim data. Coba lagi nanti.");
    }
    setIsSending(false);
  };

  return (
    <section id="citizen-form" className="py-24 px-4 bg-slate-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4 hover:bg-amber-500/20 transition-colors cursor-default"
          >
            Pusat Layanan Terpadu
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Layanan Formulir Digital</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-10">
            Akses layanan administrasi secara digital, proses cepat dan transparan untuk seluruh Warga Negara San Andreas.
          </p>

          {/* SEARCH BAR MENONJOL */}
          <div className="max-w-2xl mx-auto relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="block w-full pl-12 pr-4 py-4 md:py-5 border-2 border-white/5 bg-slate-900/80 backdrop-blur-md rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-xl text-base md:text-lg"
              placeholder="Cari Layanan atau Formulir Digital..."
            />
            
            {/* SUGGESTION DROPDOWN */}
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-64 overflow-y-auto text-left">
                {filteredForms.length > 0 ? (
                   filteredForms.slice(0, 5).map(f => (
                     <div 
                        key={f.id}
                        className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-white/5 last:border-0"
                        onClick={() => {
                           setSearchQuery(""); // clear search query on select if desired, or keep title
                           setShowSuggestions(false);
                           handleOpenForm(f);
                        }}
                     >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                            {renderFormIcon(f.icon, "w-5 h-5 object-contain")}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm tracking-wide">{f.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">{f.description || "Formulir administrasi resmi"}</p>
                          </div>
                       </div>
                     </div>
                   ))
                ) : (
                   <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                      Lembarkan tidak ditemukan.
                   </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABS KATEGORI */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((category) => (
             <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  activeCategory === category 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105' 
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                }`}
             >
                {category}
             </button>
          ))}
        </div>

        {/* GRID LAYOUT KARTU */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredForms.map((form) => (
              <motion.div
                key={form.id}
                whileHover={{ y: -8 }}
                onClick={() => handleOpenForm(form)}
                className="bg-slate-900/50 border border-white/5 p-6 md:p-8 rounded-3xl cursor-pointer transition-all flex flex-col group hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5 hover:bg-slate-800/50"
              >
                <div className="mb-6 flex items-center justify-between">
                  {/* ICON AREA */}
                  <div className="bg-slate-800/80 p-4 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-500 text-slate-300 transition-colors">
                    {renderFormIcon(form.icon, "w-8 h-8")}
                  </div>
                  {/* CATEGORY BADGE */}
                  {form.category && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-white/5 group-hover:border-amber-500/20 group-hover:text-amber-500/80 transition-colors">
                      {form.category}
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-bold text-lg md:text-xl mb-3 leading-tight group-hover:text-white transition-colors">
                  {form.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
                  {form.description || "Formulir administrasi resmi pemerintahan San Andreas."}
                </p>
                
                <div className="mt-auto border-t border-white/5 pt-5 flex items-center justify-between text-amber-500 font-bold text-xs uppercase tracking-widest">
                  <span className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Buka Formulir
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Layanan Tidak Ditemukan</h3>
            <p className="text-slate-400">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        )}

        <AnimatePresence>
          {selectedForm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedForm(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl m-4"
              >
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center text-amber-500">
                      {renderFormIcon(selectedForm.icon, "w-full h-full object-contain")}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedForm.title}</h2>
                      <p className="text-[10px] text-amber-500 uppercase tracking-widest font-black">Formulir Resmi Pemerintah</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedForm(null)} className="text-slate-500 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedForm.fields.map((field) => (
                      <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-2`}>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            required={field.required}
                            rows={4}
                            value={formData[field.id] || ''}
                            onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all duration-300 focus:shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                          />
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all duration-300 focus:shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Unggah Lampiran (Foto / KTP / Pendukung)</label>
                    {selectedForm.photoRequirement && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/80">
                        <span className="font-bold text-amber-500">Persyaratan Lampiran:</span> {selectedForm.photoRequirement}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {previews.map((previewUrl, idx) => (
                        <div key={idx} className="relative group w-24 h-24 sm:w-32 sm:h-32">
                          <img src={previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl shadow-lg border border-white/10" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group cursor-pointer border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-slate-950 hover:bg-slate-900 rounded-xl w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300"
                      >
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <div className="text-slate-500 group-hover:text-amber-500 transition-colors">
                          <p className="text-2xl font-light">+</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Tambah Foto</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-2 px-1">Bisa lebih dari satu, maks total 25MB.</p>
                  </div>

                  <button 
                    disabled={isSending}
                    className="w-full py-4 mt-4 bg-amber-500 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 transition-all duration-300 hover:bg-amber-400 hover:-translate-y-1 active:scale-95"
                  >
                    {isSending ? "MENGIRIM..." : "KIRIM PERMOHONAN"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GovernmentFormSection;
