
import React from 'react';
import { LegislativeDocument } from '../types';

interface LegislativeManagerProps {
  docs: LegislativeDocument[];
  setDocs: (docs: LegislativeDocument[]) => void;
}

const LegislativeManager: React.FC<LegislativeManagerProps> = ({ docs, setDocs }) => {
  const updateDoc = (id: string, field: keyof LegislativeDocument, value: string) => {
    const updated = docs.map(doc => doc.id === id ? { ...doc, [field]: value } : doc);
    setDocs(updated);
  };

  const addNewDoc = () => {
    const newDoc: LegislativeDocument = {
      id: `doc-${Date.now()}`,
      title: 'Dokumen Baru',
      icon: '📜',
      desc: 'Deskripsi singkat...',
      link: '#'
    };
    setDocs([...docs, newDoc]);
  };

  const deleteDoc = (id: string) => {
    if (confirm("Hapus dokumen ini dari daftar?")) {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex justify-between items-center">
        <div>
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span>⚖️</span> Manajemen Dokumen Legislatif
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
            Atur kartu sorotan yang muncul di section "Sorotan Legislatif & Hukum". 
            Pastikan link dokumen adalah URL yang valid (Google Drive/Docs).
            </p>
        </div>
        <button onClick={addNewDoc} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg hover:bg-amber-400 transition-all">
            + Tambah Dokumen
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {docs.length === 0 && (
            <p className="text-center text-slate-500 text-xs py-10">Belum ada dokumen legislatif.</p>
        )}

        {docs.map((doc, idx) => (
          <div key={doc.id} className="bg-slate-950 border border-white/5 rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
               <div className="flex items-center gap-3">
                   <h4 className="text-[10px] font-black text-white tracking-widest uppercase">KARTU #{idx + 1}</h4>
                   <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-lg">
                     {doc.icon.startsWith('http') ? <img src={doc.icon} alt="icon" className="w-5 h-5 object-contain" /> : doc.icon}
                   </div>
               </div>
               <button onClick={() => deleteDoc(doc.id)} className="text-[9px] font-bold text-red-500 hover:text-white bg-red-500/10 px-3 py-1.5 rounded uppercase transition-colors">
                   Hapus
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Judul Dokumen</label>
                <input 
                  type="text" 
                  value={doc.title}
                  onChange={e => updateDoc(doc.id, 'title', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Emoji / URL Icon Gambar</label>
                <input 
                  type="text" 
                  value={doc.icon}
                  onChange={e => updateDoc(doc.id, 'icon', e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                  placeholder="📜 atau https://..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi Singkat</label>
              <input 
                type="text" 
                value={doc.desc}
                onChange={e => updateDoc(doc.id, 'desc', e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Link Dokumen (URL)</label>
              <input 
                type="text" 
                value={doc.link}
                onChange={e => updateDoc(doc.id, 'link', e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-blue-400 outline-none focus:border-amber-500/50"
                placeholder="https://docs.google.com/..."
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">
          Perubahan akan langsung tersimpan ke database portal warga.
        </p>
      </div>
    </div>
  );
};

export default LegislativeManager;
