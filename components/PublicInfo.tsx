
import React from 'react';
import { NewsItem, LegislativeDocument } from '../types';
import NewsCard from './NewsCard';

interface PublicInfoProps {
  newsData: NewsItem[];
  docs: LegislativeDocument[];
  onNewsClick: (news: NewsItem) => void;
  onArchiveClick: () => void;
}

const PublicInfo: React.FC<PublicInfoProps> = ({ newsData, docs, onNewsClick, onArchiveClick }) => {
  return (
    <section id="information" className="py-24 px-4 bg-slate-950 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                Buletin Kota Terkini
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Informasi & <span className="text-amber-500">Berita Publik</span></h2>
            </div>
            <button 
              onClick={onArchiveClick}
              className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-all uppercase tracking-[0.2em] border-b border-white/10 pb-1 hover:border-amber-500 hover:scale-105 active:scale-95"
            >
              Lihat Semua Arsip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData.slice(0, 6).map((item, idx) => (
              <NewsCard key={item.id} news={item} index={idx} onClick={onNewsClick} />
            ))}
          </div>
        </div>
        
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">Sorotan Legislatif & Hukum</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Akses cepat ke dokumen hukum terpenting yang membentuk tatanan sosial di Los Santos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map((law, i) => (
              <div key={law.id} className="group p-8 bg-slate-900/30 border border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-slate-900/50 transition-all duration-300 flex flex-col items-center text-center hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {law.icon && law.icon.startsWith('http') ? (
                    <img src={law.icon} alt="icon" className="w-12 h-12 object-contain mx-auto" />
                  ) : (
                    <span>{law.icon}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{law.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{law.desc}</p>
                <a 
                  href={law.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  BACA DOKUMEN 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 md:p-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl text-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-950/10 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shrink-0">📞</div>
              <div>
                <h4 className="font-black text-xl md:text-2xl uppercase tracking-tight">Saluran Bantuan Warga</h4>
                <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-wide">Layanan Tanggap Darurat 24 Jam</p>
              </div>
            </div>
            
            {/* Improved Button Layout for Mobile */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-none px-4 py-3 sm:px-8 sm:py-4 bg-slate-950 text-white rounded-xl font-black text-lg sm:text-xl flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-3 text-center shadow-lg active:scale-95 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-default">
                <span className="text-amber-500 text-[10px] sm:text-sm font-bold uppercase tracking-wider">POLISI</span> 
                <span className="whitespace-nowrap">9-1-1</span>
              </div>
              <div className="flex-1 md:flex-none px-4 py-3 sm:px-8 sm:py-4 bg-white/20 backdrop-blur-md rounded-xl font-black text-lg sm:text-xl flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-3 border border-white/20 text-center shadow-lg active:scale-95 transition-all duration-300 hover:scale-105 hover:bg-white/30 cursor-default">
                <span className="text-slate-900 text-[10px] sm:text-sm font-bold uppercase tracking-wider">UMUM</span> 
                <span className="whitespace-nowrap">3-1-1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicInfo;
