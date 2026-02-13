
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarouselItem } from '../types';

interface CityCarouselProps {
  slides: CarouselItem[];
}

const CityCarousel: React.FC<CityCarouselProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000); // 7 Seconds per slide for better readability
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-slate-950">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }} // Smoother Crossfade
          className="absolute inset-0"
        >
          <img
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].title}
            className="w-full h-full object-cover"
          />
          {/* Enhanced Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content Layer - Static Position to prevent text jumping */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-24 max-w-7xl mx-auto pointer-events-none">
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="w-16 h-1 bg-amber-500 mb-6 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight drop-shadow-lg leading-tight">
            {slides[currentIndex].title}
          </h2>
          <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed mb-8 drop-shadow-md border-l-2 border-white/20 pl-4">
            {slides[currentIndex].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Controls */}
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

      {/* Progress Bars */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex h-1.5">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 bg-white/10 relative overflow-hidden">
            {i === currentIndex && (
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
    </section>
  );
};

export default CityCarousel;
