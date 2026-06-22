import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { BpomRecord } from '../types';
import { fetchFromDatabase } from '../services/databaseService';

const BpomStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<BpomRecord[] | null>(null);
  const [allRecords, setAllRecords] = useState<BpomRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<BpomRecord[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await fetchFromDatabase('BPOM');
      if (data) {
        setAllRecords(data);
      }
    };
    loadRecords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = allRecords.filter(item => 
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.registrationNumber && item.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allRecords]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }
    
    const results = allRecords.filter(item => 
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.registrationNumber && item.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setSearchResult(results);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/departments/health')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft size={16} /> Kembali ke Department Health
        </button>

        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm text-center mb-8">
          <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">Cek Status BPOM</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Badan Pengawas Obat dan Makanan San Andreas. Verifikasi status keamanan produk konsumsi dan medis yang beredar di wilayah kota.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Masukkan nama produk, produsen, atau nomor registrasi..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              
              {/* SUGGESTION DROPDOWN */}
              {showSuggestions && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-64 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map(s => (
                      <div 
                        key={s.id}
                        className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-white/5 last:border-0"
                        onClick={() => {
                          setSearchQuery(s.productName);
                          setSearchResult([s]);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-bold text-sm tracking-wide">{s.productName}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{s.manufacturer} {s.registrationNumber && <>&bull; <span className="font-mono text-[10px]">{s.registrationNumber}</span></>}</p>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {s.status === 'Aman' ? (
                              <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold uppercase">Aman</span>
                            ) : (
                              <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded font-bold uppercase">Berbahaya</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                      Tidak ada produk yang cocok dengan pencarian '{searchQuery}'.
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              type="submit"
              className="mt-4 w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              Cari Produk
            </button>
          </form>

          {searchResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Hasil Pencarian ({searchResult.length})</h3>
              
              {searchResult.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Tidak ditemukan produk yang cocok dengan pencarian Anda.
                </div>
              ) : (
                searchResult.map(item => (
                  <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-950/50 border border-white/5 rounded-2xl gap-4">
                    <div>
                      <h4 className="text-white font-bold text-lg">{item.productName}</h4>
                      <p className="text-slate-400 text-sm">{item.manufacturer}</p>
                      {item.registrationNumber && (
                        <p className="text-xs text-slate-500 mt-1 font-mono">{item.registrationNumber}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-3">
                      {item.status === 'Aman' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wide">
                          <ShieldCheck size={14} /> Terdaftar & Aman
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold uppercase tracking-wide">
                          <AlertTriangle size={14} /> Berbahaya / Belum Terdaftar
                        </span>
                      )}
                      
                      {item.imageUrl && (
                        <div className="flex flex-col items-end gap-2 mt-2 w-full max-w-[150px]">
                          <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="group block w-full aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-amber-500/50 transition-colors bg-slate-800"
                          >
                            <img 
                              src={item.imageUrl} 
                              alt={`Foto ${item.productName}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1e293b/64748b?text=Preview+Tidak+Tersedia\\n(Klik+Untuk+Buka)';
                              }}
                            />
                          </a>
                          <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors text-right"
                          >
                            Buka Gambar &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BpomStatusPage;
