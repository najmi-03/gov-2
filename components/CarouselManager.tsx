
import React, { useState } from 'react';
import { CarouselItem } from '../types';

interface CarouselManagerProps {
  staffName?: string | null;
  slides: CarouselItem[];
  onSave: (slides: CarouselItem[]) => void;
}

const CarouselManager: React.FC<CarouselManagerProps> = ({ staffName, slides, onSave }) => {
  const [localSlides, setLocalSlides] = useState<CarouselItem[]>(slides);
  const [slideIdToDelete, setSlideIdToDelete] = useState<string | null>(null);

  const addSlide = () => {
    const newSlide: CarouselItem = {
      id: 'slide_' + Date.now(),
      imageUrl: 'https://picsum.photos/seed/' + Date.now() + '/1920/1080',
      title: 'Judul Slide Baru',
      subtitle: 'Deskripsi singkat slide ini...',
      updatedBy: staffName || 'System',
      updatedAt: new Date().toISOString()
    };
    setLocalSlides([...localSlides, newSlide]);
  };

  const removeSlide = (id: string) => {
    setLocalSlides(localSlides.filter(s => s.id !== id));
    setSlideIdToDelete(null);
  };

  const updateSlide = (id: string, field: keyof CarouselItem, value: string) => {
    setLocalSlides(localSlides.map(s => s.id === id ? { ...s, [field]: value, updatedBy: staffName || 'System', updatedAt: new Date().toISOString() } : s));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...localSlides];
    if (direction === 'up' && index > 0) {
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
    } else if (direction === 'down' && index < newSlides.length - 1) {
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    }
    setLocalSlides(newSlides);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <span>🖼️</span> Manajemen Carousel
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
            Atur gambar dan teks yang muncul di banner utama halaman depan.
          </p>
        </div>
        <div className="flex gap-3">
            <button onClick={addSlide} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors">
                + Tambah Slide
            </button>
            <button onClick={() => onSave(localSlides)} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-amber-400 transition-colors">
                Simpan Perubahan
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {localSlides.length === 0 && (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                <p className="text-slate-500 text-xs italic">Belum ada slide carousel. Klik "+ Tambah Slide" untuk memulai.</p>
            </div>
        )}

        {localSlides.map((slide, idx) => (
          <div key={slide.id} className="bg-slate-900 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 group">
            <div className="w-full md:w-64 h-36 bg-slate-950 rounded-xl overflow-hidden border border-white/5 relative flex-shrink-0">
                <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] font-bold text-white uppercase">
                    Slide #{idx + 1}
                </div>
                {slide.updatedBy && (
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[8px] font-mono text-amber-500 uppercase">
                      ✏️ {slide.updatedBy}
                  </div>
                )}
            </div>

            <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Judul Slide</label>
                        <input 
                            type="text" 
                            value={slide.title} 
                            onChange={e => updateSlide(slide.id, 'title', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Subtitle / Deskripsi</label>
                        <input 
                            type="text" 
                            value={slide.subtitle || ''} 
                            onChange={e => updateSlide(slide.id, 'subtitle', e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                    <input 
                        type="text" 
                        value={slide.imageUrl} 
                        onChange={e => updateSlide(slide.id, 'imageUrl', e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-400 focus:border-amber-500/50 outline-none font-mono"
                    />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => moveSlide(idx, 'up')} 
                            disabled={idx === 0}
                            className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                        >
                            ▲
                        </button>
                        <button 
                            onClick={() => moveSlide(idx, 'down')} 
                            disabled={idx === localSlides.length - 1}
                            className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                        >
                            ▼
                        </button>
                    </div>
                    {slideIdToDelete === slide.id ? (
                        <div className="flex gap-2">
                            <button onClick={() => setSlideIdToDelete(null)} className="text-[10px] font-bold text-slate-500 uppercase px-4 py-2 border border-white/10 rounded-lg">Batal</button>
                            <button onClick={() => removeSlide(slide.id)} className="text-[10px] font-bold text-white uppercase px-4 py-2 bg-red-600 rounded-lg animate-pulse">Yakin Hapus?</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setSlideIdToDelete(slide.id)}
                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                        >
                            🗑️ Hapus Slide
                        </button>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager;
