
import React from 'react';
import { NewsItem } from '../types';
import { motion } from 'framer-motion';

interface NewsCardProps {
  news: NewsItem;
  index: number;
  onClick: (news: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, index, onClick }) => {
  const defaultImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(news)}
      className="group relative bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer h-full flex flex-col"
    >
      <div className="h-56 overflow-hidden relative shrink-0">
        <img 
          src={news.imageUrl || defaultImage} 
          alt={news.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 grayscale group-hover:grayscale-0"
        />
        {/* Gradient Overlay matching Department Card */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Tag at Top Right */}
        <div className="absolute top-4 right-4">
          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20 shadow-lg">
            {news.tag}
          </span>
        </div>

        {/* Title inside Image Area - Identical to DepartmentCard */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-2 mb-1">
             <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{news.date}</span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
            {news.title}
          </h3>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-light">
          {news.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Baca Selengkapnya</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;
