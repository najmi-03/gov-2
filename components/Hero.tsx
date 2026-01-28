
import React from 'react';

interface HeroProps {
  onApplyClick: () => void;
  onFormClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onApplyClick, onFormClick }) => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I" 
          alt="San Andreas Government Background" 
          className="w-full h-full object-cover opacity-20 grayscale brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950"></div>
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-6 border border-amber-500/30 bg-amber-500/10 rounded-full">
          <span className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase">
            Portal Resmi Eksekutif San Andreas
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          Melayani Seluruh <br/>
          Warga <span className="text-amber-500">San Andreas</span>
        </h1>
        <p className="text-base md:text-xl text-slate-400 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
          Transparansi, integritas, dan kemajuan. Pemerintah Anda bekerja 24/7 untuk membangun komunitas yang lebih aman, sejahtera, dan inklusif.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onFormClick}
            className="w-full sm:w-auto px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-2xl shadow-amber-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            PENGAJUAN IDENTITAS (FORM)
          </button>
          <button 
            onClick={onApplyClick}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl backdrop-blur-sm transition-all text-xs uppercase tracking-widest"
          >
            PENDAFTARAN KARIR ASN
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-30">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Jelajahi</span>
        <div className="w-0.5 h-8 bg-amber-500"></div>
      </div>
    </section>
  );
};

export default Hero;
