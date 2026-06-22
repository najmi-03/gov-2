import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DoctorCertRecord } from '../types';
import { fetchFromDatabase } from '../services/databaseService';

const DoctorCertPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<DoctorCertRecord[] | null>(null);
  const [allRecords, setAllRecords] = useState<DoctorCertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<DoctorCertRecord[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true);
      const data = await fetchFromDatabase('DOCTOR_CERT');
      if (data) {
        setAllRecords(data);
      }
      setIsLoading(false);
    };
    loadRecords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = allRecords.filter(item => 
        item.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
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
      item.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResult(results);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate('/departments/health_services')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft size={16} /> Kembali ke Departemen
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-6 border border-blue-500/20">
            <ShieldCheck size={40} className="text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Sertifikasi Dokter</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Portal verifikasi Surat Izin Praktik (SIP) dokter di wilayah San Andreas.
          </p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Cari nama dokter atau No. SIP..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-blue-500/50 outline-none"
                />
                
                {/* SUGGESTION DROPDOWN */}
                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-64 overflow-y-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map(s => (
                        <div 
                          key={s.id}
                          className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-white/5 last:border-0"
                          onClick={() => {
                            setSearchQuery(s.doctorName);
                            setSearchResult([s]);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-white font-bold text-sm tracking-wide">{s.doctorName}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{s.specialization} &bull; SIP: <span className="font-mono text-[10px]">{s.licenseNumber}</span></p>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {s.status === 'Aktif' ? (
                                <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold uppercase">Aktif</span>
                              ) : (
                                <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded font-bold uppercase">{s.status}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                        Tidak ada dokter yang cocok dengan pencarian '{searchQuery}'.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button 
                type="submit"
                className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {isLoading ? (
            <div className="text-center p-8 text-slate-500">Memuat data...</div>
        ) : searchResult && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">
              Hasil Pencarian ({searchResult.length})
            </h2>
            
            {searchResult.length > 0 ? (
              <div className="grid gap-4">
                {searchResult.map((record) => (
                  <div key={record.id} className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{record.doctorName}</h3>
                      <p className="text-slate-400 text-sm mb-3">{record.specialization}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500">
                        <span>SIP: {record.licenseNumber}</span>
                        {record.expiryDate && <span>Berlaku s/d: {new Date(record.expiryDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex flex-col items-end gap-4">
                      {record.status === 'Aktif' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl">
                          <ShieldCheck size={20} />
                          <span className="font-bold text-sm uppercase tracking-wider">SIP Aktif</span>
                        </div>
                      ) : record.status === 'Non-Aktif' ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
                          <AlertTriangle size={20} />
                          <span className="font-bold text-sm uppercase tracking-wider">SIP Non-Aktif</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
                          <AlertTriangle size={20} />
                          <span className="font-bold text-sm uppercase tracking-wider">SIP Dicabut</span>
                        </div>
                      )}
                      
                      {record.imageUrl && (
                        <div className="flex flex-col items-end gap-2 mt-2 w-full max-w-[150px]">
                          <a 
                            href={record.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="group block w-full aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors bg-slate-800"
                          >
                            <img 
                              src={record.imageUrl} 
                              alt={`Sertifikat ${record.doctorName}`} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1e293b/64748b?text=Preview+Tidak+Tersedia\\n(Klik+Untuk+Buka)';
                              }}
                            />
                          </a>
                          <a 
                            href={record.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors text-right"
                          >
                            Buka Gambar &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-white/5">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                  <Search className="text-slate-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Dokter Tidak Ditemukan</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Dokter dengan nama atau nomor registrasi tersebut tidak ditemukan dalam database SIP aktif.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCertPage;
