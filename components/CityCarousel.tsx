
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    url: "https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I",
    title: "Visi Masa Depan",
    subtitle: "Membangun infrastruktur yang berkelanjutan untuk generasi mendatang di Los Santos."
  },
  {
    url: "https://blogger.googleusercontent.com/img/a/AVvXsEglh6sjEsTdQCjEHUYOdDRqd8fBkvki-GH2ixxjtTOiXPRoagtlQULiZXPcSNV8cBbGVAZa3uFRzY4Y7d0oUrNSYaz7L8ExRoWIUhlDZ_nIfa4N7G2RCpb7oI6LWsw6_5sx_xls57PUDqng7qhDUQHZz1pNj4ufjL3Dtl0VCwTXxaiWukbjh37UKPlPZhuw",
    title: "Dedikasi Tanpa Batas",
    subtitle: "Otoritas pemerintahan yang bekerja tanpa henti demi keamanan dan kenyamanan publik."
  }
];

const CityCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentIndex].url}
            alt={slides[currentIndex].title}
            className="w-full h-full object-cover"
          />
          {/* Opaque Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-24 max-w-7xl mx-auto">
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="w-12 h-1 bg-amber-500 mb-6"></div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
            {slides[currentIndex].title}
          </h2>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-8">
            {slides[currentIndex].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-24 z-20 flex items-center gap-4">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Bars */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex h-1">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 bg-white/10 relative overflow-hidden">
            {i === currentIndex && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute inset-0 bg-amber-500"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CityCarousel;
