
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselItem } from '../types';

interface CityCarouselProps {
  slides: CarouselItem[];
}

const CityCarousel: React.FC<CityCarouselProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. SAFETY GUARD: Reset index jika slide dihapus atau index di luar batas
  useEffect(() => {
    if (slides && slides.length > 0) {
        if (currentIndex >= slides.length) {
            setCurrentIndex(0);
        }
    }
  }, [slides, currentIndex]);

  // 2. Timer Logic
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        // Cek lagi length di dalam interval untuk memastikan data terbaru
        if (slides.length === 0) return 0;
        return (prev + 1) % slides.length;
      });
    }, 7000); // 7 Seconds per slide
    
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    if (slides && slides.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides && slides.length > 0) {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // 3. FALLBACK VIEW (Tampilan Cadangan Anti-Crash)
  // Jika slide kosong atau undefined, tampilkan placeholder agar web TIDAK BLACK SCREEN
  if (!slides || slides.length === 0) {
    return (
        <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900">
                <img 
                    src="https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I" 
                    alt="Default Background" 
                    className="w-full h-full object-cover opacity-30 grayscale"
                />
            </div>
            <div className="relative z-10 text-center px-4">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-lg">San Andreas Government</h2>
                <p className="text-slate-400 uppercase tracking-widest text-sm">Portal Resmi Pemerintahan</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/80"></div>
        </section>
    );
  }

  // 4. SAFE ACCESSOR
  // Memastikan kita tidak pernah mengakses index yang tidak ada
  const safeIndex = (currentIndex >= 0 && currentIndex < slides.length) ? currentIndex : 0;
  const currentItem = slides[safeIndex];

  // Double protection jika currentItem entah kenapa undefined
  if (!currentItem) return null;

  return (
    <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-slate-950 group">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentItem.id || safeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }} // Smoother Crossfade
          className="absolute inset-0"
        >
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="w-full h-full object-cover"
            onError={(e) => {
                // Fallback jika URL gambar rusak (404)
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/1920x1080/0f172a/94a3b8?text=Image+Not+Found";
            }}
          />
          {/* Enhanced Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content Layer - Static Position to prevent text jumping */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-24 max-w-7xl mx-auto pointer-events-none">
        <motion.div
          key={`text-${currentItem.id || safeIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="w-16 h-1 bg-amber-500 mb-6 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight drop-shadow-lg leading-tight">
            {currentItem.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed mb-8 drop-shadow-md border-l-2 border-white/20 pl-4 line-clamp-3">
            {currentItem.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-24 z-20 flex items-center gap-4">
            <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all hover:scale-110 active:scale-95 bg-black/20 backdrop-blur-sm"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </button>
            <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all hover:scale-110 active:scale-95 bg-black/20 backdrop-blur-sm"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
        </div>
      )}

      {/* Progress Bars */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex h-1.5">
            {slides.map((_, i) => (
            <div key={i} className="flex-1 bg-white/10 relative overflow-hidden">
                {i === safeIndex && (
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 7, ease: "linear" }}
                    className="absolute inset-0 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
                )}
            </div>
            ))}
        </div>
      )}
    </section>
  );
};

export default CityCarousel;
