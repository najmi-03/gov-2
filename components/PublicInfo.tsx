
import React from 'react';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';

interface PublicInfoProps {
  newsData: NewsItem[];
  onNewsClick: (news: NewsItem) => void;
}

const PublicInfo: React.FC<PublicInfoProps> = ({ newsData, onNewsClick }) => {
  const legislativeHighlights = [
    { title: 'Kode Etik Warga', icon: '📜', desc: 'Hukum dasar yang mengatur perilaku harian.' },
    { title: 'Undang-Undang Bisnis', icon: '🏢', desc: 'Aturan untuk operasional komersial.' },
    { title: 'Piagam Keamanan', icon: '👮', desc: 'Protokol tanggap darurat publik.' },
    { title: 'Pedoman Perpajakan', icon: '📊', desc: 'Tarif saat ini dan tanggal pembayaran.' },
  ];

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
            <button className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-[0.2em] border-b border-white/10 pb-1">
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
            {legislativeHighlights.map((law, i) => (
              <div key={i} className="group p-8 bg-slate-900/30 border border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-slate-900/50 transition-all flex flex-col items-center text-center">
                <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">{law.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{law.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{law.desc}</p>
                <button className="mt-auto text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  BACA DOKUMEN 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-8 md:p-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl text-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-950/10 rounded-2xl flex items-center justify-center text-4xl">📞</div>
              <div>
                <h4 className="font-black text-2xl uppercase tracking-tight">Saluran Bantuan Warga</h4>
                <p className="text-sm font-bold opacity-80 uppercase tracking-wide">Layanan Tanggap Darurat & Pertanyaan Umum 24 Jam</p>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-none px-8 py-4 bg-slate-950 text-white rounded-xl font-black text-xl flex items-center justify-center gap-3">
                <span className="text-amber-500 text-sm">POLISI</span> 9-1-1
              </div>
              <div className="flex-1 md:flex-none px-8 py-4 bg-white/20 backdrop-blur-md rounded-xl font-black text-xl flex items-center justify-center gap-3 border border-white/20">
                <span className="text-slate-900 text-sm">UMUM</span> 3-1-1
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicInfo;
