
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';

interface HeroProps {
  onApplyClick: () => void;
  onFormClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onApplyClick, onFormClick }) => {
  return (
    <section id="home" className="relative flex items-center justify-center min-h-[90vh] overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I" 
          alt="San Andreas Government Background" 
          className="w-full h-full object-cover opacity-20 grayscale brightness-50 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950/95"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block px-5 py-2 mb-10 border border-amber-500/20 bg-amber-500/10 rounded-full backdrop-blur-sm"
        >
          <span className="text-amber-500 text-[10px] md:text-xs font-black tracking-[0.25em] uppercase">
            Portal Eksekutif San Andreas
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mb-12 text-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-white leading-[1.1] tracking-tight">
            Melayani <br className="hidden md:block" /> Seluruh Warga
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-amber-500/10 -z-10 blur-[100px] rounded-full"></div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-base md:text-xl text-slate-400 leading-relaxed font-light text-center max-w-2xl mx-auto mb-16 drop-shadow-xl"
        >
          Transparansi, integritas, dan kemajuan. Pemerintah Anda bekerja tiada henti untuk membangun komunitas yang lebih aman, sejahtera, dan inklusif.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl mx-auto"
        >
          <button 
            onClick={onFormClick}
            className="group flex flex-row items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 hover:scale-105 active:scale-95 text-[11px] md:text-xs uppercase tracking-widest uppercase hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            <FileText className="w-5 h-5 -ml-1 text-slate-900 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span>Layanan Administrasi</span>
          </button>
          
          <button 
            onClick={onApplyClick}
            className="group flex flex-row items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-amber-500/50 hover:text-amber-400 active:scale-95 text-[11px] md:text-xs uppercase tracking-widest"
          >
            <span>Pendaftaran Karir ASN</span>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
