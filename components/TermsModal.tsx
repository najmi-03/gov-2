
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-serif font-bold text-white">Syarat & <span className="text-amber-500">Ketentuan</span></h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
              {content}
              
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] italic mt-8 text-amber-500/80">
                *Dokumen ini diterbitkan oleh Departemen Human Resource San Andreas dan dapat diperbarui sewaktu-waktu sesuai kebijakan pemerintah.
              </div>
            </div>

            <div className="p-6 border-t border-white/5 text-center">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all uppercase text-[10px] tracking-widest"
              >
                SAYA SETUJU & MENGERTI
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
