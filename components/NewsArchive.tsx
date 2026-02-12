
import React from 'react';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';
import { motion } from 'framer-motion';

interface NewsArchiveProps {
  news: NewsItem[];
  onNewsClick: (news: NewsItem) => void;
}

const NewsArchive: React.FC<NewsArchiveProps> = ({ news, onNewsClick }) => {
  return (
    <section className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 relative">
       {/* Background Decor */}
       <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

       <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              Arsip Digital Pemerintah
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-white mb-6"
            >
              Berita & <span className="text-amber-500">Pengumuman</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed"
            >
              Menampilkan seluruh riwayat publikasi resmi, siaran pers, dan pembaruan kebijakan pemerintah San Andreas untuk transparansi publik.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <NewsCard key={item.id} news={item} index={idx} onClick={onNewsClick} />
            ))}
          </div>

          {news.length === 0 && (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
              <p className="text-slate-500 uppercase tracking-widest text-sm">Belum ada arsip berita.</p>
            </div>
          )}
       </div>
    </section>
  );
};

export default NewsArchive;
