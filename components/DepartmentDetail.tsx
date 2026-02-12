
import React from 'react';
import { DeptInfo } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DepartmentDetailProps {
  dept: DeptInfo | null;
  onClose: () => void;
  onApply: () => void;
}

const DepartmentDetail: React.FC<DepartmentDetailProps> = ({ dept, onClose, onApply }) => {
  if (!dept) return null;

  const isImageIcon = dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/') || dept.icon.includes('.'));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-slate-900 sm:border border-white/10 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-slate-950/50 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all focus:outline-none"
          >
            ✕
          </button>

          {/* Image Side */}
          <div className="w-full md:w-2/5 h-[40vh] md:h-auto relative flex-shrink-0">
            <img 
              src={dept.imageUrl} 
              alt={dept.name} 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent md:bg-gradient-to-r"></div>
            
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 right-6">
              <div className="mb-2 md:mb-3">
                {isImageIcon ? (
                  <img src={dept.icon} alt="logo" className="w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                ) : (
                  <span className="text-3xl md:text-6xl block leading-none">{dept.icon}</span>
                )}
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">{dept.name}</h2>
              <div className="w-10 md:w-16 h-1 bg-amber-500 mt-3 md:mt-4"></div>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-3/5 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar">
            <div className="space-y-6 md:space-y-8">
              <section>
                <h4 className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-2 md:mb-3 opacity-80">Visi Departemen</h4>
                <p className="text-lg md:text-xl font-light text-slate-100 leading-relaxed italic">
                  "{dept.vision}"
                </p>
              </section>

              <section>
                <h4 className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-2 md:mb-3 opacity-80">Gambaran Umum</h4>
                <p className="text-slate-400 leading-relaxed text-xs md:text-sm lg:text-base font-light">
                  {dept.longDescription}
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <section>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-3 md:mb-4 opacity-80">Tanggung Jawab Utama</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {dept.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-3 text-xs md:text-sm text-slate-300">
                        <span className="text-amber-500 flex-shrink-0">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-[9px] md:text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-3 md:mb-4 opacity-80">Persyaratan Bergabung</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {dept.requirements.map((r, i) => (
                      <li key={i} className="flex gap-3 text-xs md:text-sm text-slate-300">
                        <span className="text-blue-500 flex-shrink-0">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="pt-6 md:pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  onClick={() => { onApply(); onClose(); }}
                  className="flex-1 py-3.5 md:py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest"
                >
                  AJUKAN PENDAFTARAN
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 md:px-8 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all text-xs md:text-sm uppercase tracking-widest"
                >
                  KEMBALI
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DepartmentDetail;
