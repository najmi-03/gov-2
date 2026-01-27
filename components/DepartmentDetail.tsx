
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

  const isImageIcon = dept.icon.startsWith('http') || dept.icon.startsWith('/') || dept.icon.includes('.');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
          className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-slate-950/50 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all focus:outline-none"
          >
            ✕
          </button>

          {/* Image Side */}
          <div className="w-full md:w-2/5 h-64 md:h-auto relative flex-shrink-0">
            <img 
              src={dept.imageUrl} 
              alt={dept.name} 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent md:bg-gradient-to-r"></div>
            
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 right-8">
              <div className="mb-3">
                {isImageIcon ? (
                  <img src={dept.icon} alt="logo" className="w-16 h-16 md:w-24 md:h-24 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                ) : (
                  <span className="text-4xl md:text-7xl block leading-none">{dept.icon}</span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">{dept.name}</h2>
              <div className="w-12 md:w-16 h-1 bg-amber-500 mt-4"></div>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-3 opacity-80">Visi Departemen</h4>
                <p className="text-xl font-light text-slate-100 leading-relaxed italic">
                  "{dept.vision}"
                </p>
              </section>

              <section>
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-3 opacity-80">Gambaran Umum</h4>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {dept.longDescription}
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <section>
                  <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-4 opacity-80">Tanggung Jawab Utama</h4>
                  <ul className="space-y-3">
                    {dept.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-amber-500">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-4 opacity-80">Persyaratan Bergabung</h4>
                  <ul className="space-y-3">
                    {dept.requirements.map((r, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-blue-500">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { onApply(); onClose(); }}
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  AJUKAN PENDAFTARAN
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
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
