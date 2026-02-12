
import React from 'react';

interface HeroProps {
  onApplyClick: () => void;
  onFormClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onApplyClick, onFormClick }) => {
  return (
    <section id="home" className="relative flex items-center justify-center overflow-hidden pt-28 pb-12 px-4 md:pt-40 md:pb-24 bg-slate-950">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I" 
          alt="San Andreas Government Background" 
          className="w-full h-full object-cover opacity-30 grayscale brightness-50 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Decorative Frame Container */}
        <div className="relative border border-white/10 bg-slate-900/40 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 text-center overflow-hidden shadow-2xl ring-1 ring-white/5 group hover:ring-amber-500/20 transition-all duration-700">
          
          {/* Aesthetic Corner Accents */}
          <div className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 border-t-2 border-l-2 border-amber-500/20 rounded-tl-[2rem] md:rounded-tl-[2.5rem] group-hover:border-amber-500/50 transition-colors duration-500"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 border-b-2 border-r-2 border-amber-500/20 rounded-br-[2rem] md:rounded-br-[2.5rem] group-hover:border-amber-500/50 transition-colors duration-500"></div>
          <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 border-t-2 border-r-2 border-amber-500/20 rounded-tr-[2rem] md:rounded-tr-[2.5rem] group-hover:border-amber-500/50 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 border-b-2 border-l-2 border-amber-500/20 rounded-bl-[2rem] md:rounded-bl-[2.5rem] group-hover:border-amber-500/50 transition-colors duration-500"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-block px-4 py-1.5 mb-6 border border-amber-500/30 bg-amber-500/10 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-300">
              <span className="text-amber-500 text-[9px] md:text-xs font-black tracking-[0.25em] uppercase">
                Portal Resmi Eksekutif San Andreas
              </span>
            </div>
            
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl tracking-tight">
              Melayani Seluruh <br/>
              Warga <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">San Andreas</span>
            </h1>
            
            <p className="text-xs md:text-lg text-slate-300 mb-8 leading-relaxed font-light max-w-2xl mx-auto drop-shadow-lg">
              Transparansi, integritas, dan kemajuan. Pemerintah Anda bekerja 24/7 untuk membangun komunitas yang lebih aman, sejahtera, dan inklusif.
            </p>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center justify-center gap-3 md:gap-6">
              <button 
                onClick={onFormClick}
                className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              >
                Pengajuan Identitas (Form)
              </button>
              <button 
                onClick={onApplyClick}
                className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl md:rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap hover:border-amber-500/50 hover:text-amber-500"
              >
                Pendaftaran Karir ASN
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
