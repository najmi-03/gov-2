
import React, { useState, useRef } from 'react';
import { sendFileToDiscord } from '../services/discordService';
import { motion, AnimatePresence } from 'framer-motion';
import { FormConfig } from '../types';

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
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
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

  const renderFormIcon = (icon: string, className: string) => {
    if (!icon) return null;
    const isImage = icon.startsWith('http') || icon.startsWith('data:image') || icon.includes('.');
    if (isImage) {
      return <img src={icon} alt="" className={className} />;
    }
    return <span className={className.includes('text-4xl') ? 'text-4xl md:text-5xl' : 'text-3xl'}>{icon}</span>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    // AMBIL WEBHOOK SPESIFIK BERDASARKAN KUNCI FORM YANG DIPILIH
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
    <section id="citizen-form" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4 hover:bg-amber-500/20 transition-colors cursor-default"
          >
            Pusat Layanan Terpadu
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Layanan Formulir Digital</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Pilih kategori layanan di bawah ini untuk mengajukan permohonan administrasi secara digital ke departemen terkait.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {forms.map((form) => (
            <motion.div
              key={form.id}
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenForm(form)}
              className="bg-slate-950 border border-white/5 p-6 md:p-8 rounded-3xl cursor-pointer transition-all text-center group flex flex-col items-center justify-center min-h-[220px] hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 hover:bg-slate-900"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {renderFormIcon(form.icon, "text-4xl md:text-5xl w-16 h-16 object-contain mx-auto block drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]")}
              </div>
              <h3 className="text-white font-bold text-xs md:text-sm mb-2 uppercase tracking-tighter leading-tight group-hover:text-amber-500 transition-colors">{form.title}</h3>
              <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                Klik untuk Membuka Form
              </p>
            </motion.div>
          ))}
        </div>

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
                    <div className="w-12 h-12 flex items-center justify-center">
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
                      <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-1`}>
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Unggah Lampiran (Foto Karakter/KTP/Pendukung)</label>
                    {selectedForm.photoRequirement && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 mb-2 text-[10px] text-amber-500 font-medium">
                        <span className="font-bold">Persyaratan Lampiran:</span> {selectedForm.photoRequirement}
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
                          <p className="text-xl">+</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Tambah Foto</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 italic mt-1 px-1">Kamu bisa memilih lebih dari satu foto. Maks total 25MB.</p>
                  </div>

                  <button 
                    disabled={isSending}
                    className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl uppercase tracking-widest shadow-xl shadow-amber-500/10 disabled:opacity-50 transition-all duration-300 hover:bg-amber-400 hover:shadow-amber-500/30 hover:-translate-y-1 active:scale-95"
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
