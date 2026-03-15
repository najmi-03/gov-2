
import React from 'react';

interface HeroProps {
  onApplyClick: () => void;
  onFormClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onApplyClick, onFormClick }) => {
  return (
    <section id="home" className="relative flex items-center justify-center overflow-hidden pt-28 pb-12 px-4 md:pt-40 md:pb-24 bg-transparent">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I" 
          alt="San Andreas Government Background" 
          className="w-full h-full object-cover opacity-30 grayscale brightness-50 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Decorative Frame Container - Border removed */}
        <div className="relative bg-slate-900/60 backdrop-blur-md rounded-[3rem] p-8 md:p-20 text-center overflow-hidden shadow-2xl transition-all duration-700">
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-block px-4 py-1.5 mb-8 border border-amber-500/30 bg-amber-500/10 rounded-full">
              <span className="text-amber-500 text-[9px] md:text-xs font-black tracking-[0.25em] uppercase">
                Portal Resmi Eksekutif San Andreas
              </span>
            </div>
            
            <div className="relative mb-8">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight tracking-tight text-left md:text-center relative z-10">
                Melayani Seluruh <br/>
                Warga
              </h1>
              <div className="absolute -bottom-2 -right-4 md:-right-8 w-32 h-12 md:w-64 md:h-24 bg-amber-500/20 -z-10 blur-2xl rounded-full"></div>
            </div>
            
            <div className="relative max-w-2xl mx-auto mb-12 p-4 md:p-8 border border-blue-500/30 rounded-3xl bg-blue-500/5 backdrop-blur-sm">
              <p className="text-sm md:text-xl text-slate-300 leading-relaxed font-light drop-shadow-lg mb-8">
                Transparansi, integritas, dan kemajuan. Pemerintah Anda bekerja 24/7 untuk membangun komunitas yang lebih aman, sejahtera, dan inklusif.
              </p>
              
              <div className="flex flex-col w-full sm:w-auto sm:flex-row items-center justify-center gap-4 md:gap-8">
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
      </div>
    </section>
  );
};

export default Hero;
