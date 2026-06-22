
import React from 'react';
import { NewsItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsDetailProps {
  news: NewsItem | null;
  onClose: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onClose }) => {
  if (!news) return null;

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
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-slate-950/50 border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all focus:outline-none"
          >
            ✕
          </button>

          {/* Image Side */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative flex-shrink-0">
            <img 
              src={news.imageUrl || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"} 
              alt={news.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            
            <div className="absolute bottom-8 left-8 right-8">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20 mb-4 inline-block">
                {news.tag}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight">{news.title}</h2>
              <div className="flex items-center gap-2 mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                {news.date}
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-slate-900/50">
            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-4 opacity-80">Rangkuman Berita</h4>
                <div className="prose prose-invert prose-amber max-w-none">
                  <p className="text-slate-300 leading-relaxed text-base md:text-lg font-light">
                    {news.summary}
                  </p>
                  <p className="text-slate-400 text-sm mt-6 leading-relaxed">
                    Pemerintah Los Santos berkomitmen untuk terus memberikan informasi transparan kepada publik. Berita ini diterbitkan secara resmi melalui kanal Humas Pemerintahan untuk memastikan seluruh warga mendapatkan informasi yang akurat dan terpercaya.
                  </p>
                </div>
              </section>

              <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">Status Dokumen</p>
                  <p className="text-xs text-slate-400 italic">Telah divalidasi oleh Kantor Sekretariat Negara.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                >
                  KEMBALI KE PORTAL
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewsDetail;
