
import React, { useState, useEffect } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, StaffMember, LegislativeDocument } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCityNews } from '../services/geminiService';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';

interface NewsAdminProps {
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;
  userRole: AdminRole;
  depts: DeptInfo[];
  setDepts: (depts: DeptInfo[]) => void;
  leadership: LeadershipMember[];
  setLeadership: (leadership: LeadershipMember[]) => void;
  docs: LegislativeDocument[];
  setDocs: (docs: LegislativeDocument[]) => void;
  termsContent: string;
  setTermsContent: (content: string) => void;
}

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'depts'>('news');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newNews, setNewNews] = useState({ 
    title: '', 
    tag: 'Pemerintah', 
    summary: '', 
    imageUrl: '',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  });

  useEffect(() => {
    if (isOpen) {
      if (userRole === 'PAWN_ADMIN') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('structural');
      else if (userRole === 'TREASURY_ADMIN') setActiveTab('salary');
      else if (userRole === 'DHA_ADMIN') setActiveTab('legislative');
      else setActiveTab('news');
    }
  }, [isOpen, userRole]);

  // HR Specific Functions (Restored)
  const updateStaffName = (deptId: string, staffIndex: number, newName: string) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newStaff = [...dept.structuralStaff];
        newStaff[staffIndex] = { ...newStaff[staffIndex], name: newName };
        return { ...dept, structuralStaff: newStaff };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const updateStaffRole = (deptId: string, staffIndex: number, newRole: string) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newStaff = [...dept.structuralStaff];
        newStaff[staffIndex] = { ...newStaff[staffIndex], role: newRole };
        return { ...dept, structuralStaff: newStaff };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const addStaffRole = (deptId: string) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newStaff = [...dept.structuralStaff, { role: 'Jabatan Baru', name: 'Nama Pejabat', level: 3 }];
        return { ...dept, structuralStaff: newStaff };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const deleteStaffRole = (deptId: string, staffIndex: number) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newStaff = dept.structuralStaff.filter((_, idx) => idx !== staffIndex);
        return { ...dept, structuralStaff: newStaff };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const updateLeadershipName = (id: string, newName: string) => {
    const updatedLeadership = leadership.map(l => l.id === id ? { ...l, name: newName } : l);
    setLeadership(updatedLeadership);
  };

  const updateLeadershipRole = (id: string, newRole: string) => {
    const updatedLeadership = leadership.map(l => l.id === id ? { ...l, role: newRole } : l);
    setLeadership(updatedLeadership);
  };

  // Dept Content Update Function
  const updateDeptContent = (id: string, field: keyof DeptInfo, value: any) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === id) {
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  // Helper for array field updates (Responsibilities & Requirements)
  const updateDeptArrayField = (deptId: string, field: 'responsibilities' | 'requirements', index: number, value: string) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newArray = [...dept[field]];
        newArray[index] = value;
        return { ...dept, [field]: newArray };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const addDeptArrayItem = (deptId: string, field: 'responsibilities' | 'requirements') => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        return { ...dept, [field]: [...dept[field], "Item Baru"] };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const removeDeptArrayItem = (deptId: string, field: 'responsibilities' | 'requirements', index: number) => {
    const updatedDepts = depts.map(dept => {
      if (dept.id === deptId) {
        const newArray = dept[field].filter((_, i) => i !== index);
        return { ...dept, [field]: newArray };
      }
      return dept;
    });
    setDepts(updatedDepts);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.summary) {
      alert("Judul dan Deskripsi berita wajib diisi!");
      return;
    }

    const item: NewsItem = {
      id: 'n' + Date.now(),
      title: newNews.title,
      summary: newNews.summary,
      tag: newNews.tag || 'Umum',
      imageUrl: newNews.imageUrl || undefined,
      date: newNews.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setNews([item, ...news]);
    setNewNews({ 
      title: '', tag: 'Pemerintah', summary: '', imageUrl: '', 
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });
    alert("Berita berhasil dipublikasikan!");
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const aiNews = await generateCityNews();
    if (aiNews && aiNews.length > 0) {
      const enhancedAiNews = aiNews.map((n: any) => ({
        ...n,
        imageUrl: `https://picsum.photos/seed/${n.id}/800/600`
      }));
      setNews([...enhancedAiNews, ...news]);
    }
    setIsGenerating(false);
  };

  const deleteNews = (id: string) => {
    if (confirm("Hapus berita ini dari portal?")) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-amber-500 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-2xl h-full bg-slate-900 border-l border-white/10 shadow-2xl p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Panel Administrasi</h2>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                    Akses: {
                      userRole === 'NEWS_ADMIN' ? 'Staff Humas' : 
                      userRole === 'PAWN_ADMIN' ? 'Staff Logistik' : 
                      userRole === 'TREASURY_ADMIN' ? 'Bendahara Negara' :
                      userRole === 'DHA_ADMIN' ? 'Staff Home Affairs' :
                      'Staff Human Resource'
                    }
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>

              <div className="flex border-b border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {(userRole === 'NEWS_ADMIN') && (
                  <button onClick={() => setActiveTab('news')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Berita</button>
                )}
                {(userRole === 'PAWN_ADMIN') && (
                  <button onClick={() => setActiveTab('inventory')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Stok Pawn</button>
                )}
                {(userRole === 'HR_ADMIN') && (
                  <>
                    <button onClick={() => setActiveTab('structural')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Struktural</button>
                    <button onClick={() => setActiveTab('depts')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'depts' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Departemen</button>
                    <button onClick={() => setActiveTab('terms')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'terms' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Syarat & Ketentuan</button>
                  </>
                )}
                {(userRole === 'TREASURY_ADMIN') && (
                  <button onClick={() => setActiveTab('salary')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Gaji</button>
                )}
                {(userRole === 'DHA_ADMIN') && (
                  <button onClick={() => setActiveTab('legislative')} className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Legislatif</button>
                )}
              </div>

              {activeTab === 'news' && userRole === 'NEWS_ADMIN' ? (
                <div className="space-y-8 pb-20">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>✨</span> Tulis Otomatis dengan Gemini AI
                    </h3>
                    <button onClick={handleGenerateAI} disabled={isGenerating} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {isGenerating ? 'MENGHUBUNGI GEMINI...' : 'BUAT BERITA DENGAN AI'}
                    </button>
                  </div>

                  <form onSubmit={handleAddManual} className="space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Input Berita Manual</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Judul Berita</label>
                        <input type="text" placeholder="Masukkan judul utama..." value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tag Kategori</label>
                          <input type="text" placeholder="e.g. Ekonomi, Publik" value={newNews.tag} onChange={e => setNewNews({...newNews, tag: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tanggal Publikasi</label>
                          <input type="text" placeholder="e.g. 1 Januari 2026" value={newNews.date} onChange={e => setNewNews({...newNews, date: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">URL Gambar Utama</label>
                        <input type="text" placeholder="https://..." value={newNews.imageUrl} onChange={e => setNewNews({...newNews, imageUrl: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
                        {newNews.imageUrl && (
                          <div className="mt-3 p-2 bg-slate-900 rounded-xl border border-white/10">
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2">Preview Gambar:</p>
                            <div className="w-full h-40 bg-slate-950 rounded-lg overflow-hidden border border-white/5">
                              <img src={newNews.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Isi / Deskripsi Berita</label>
                        <textarea placeholder="Tuliskan isi berita secara lengkap di sini..." rows={10} value={newNews.summary} onChange={e => setNewNews({...newNews, summary: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none resize-none leading-relaxed" />
                      </div>
                    </div>
                    <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-amber-500/10">PUBLIKASIKAN BERITA SEKARANG</button>
                  </form>

                  <div className="space-y-3 pt-8 border-t border-white/5">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Daftar Berita Aktif</h3>
                    {news.map(n => (
                      <div key={n.id} className="group flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4 max-w-[80%]">
                          {n.imageUrl && <img src={n.imageUrl} className="w-12 h-12 object-cover rounded-lg border border-white/10" alt="thumb" />}
                          <div className="truncate">
                            <p className="text-white font-bold text-xs truncate group-hover:text-amber-500 transition-colors">{n.title}</p>
                            <p className="text-[10px] text-slate-500">{n.date} • <span className="text-amber-500/80 font-bold">{n.tag}</span></p>
                          </div>
                        </div>
                        <button onClick={() => deleteNews(n.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'inventory' && userRole === 'PAWN_ADMIN' ? (
                <PawnshopManager />
              ) : activeTab === 'salary' && userRole === 'TREASURY_ADMIN' ? (
                <SalaryManager leadership={leadership} depts={depts} />
              ) : activeTab === 'legislative' && userRole === 'DHA_ADMIN' ? (
                <LegislativeManager docs={docs} setDocs={setDocs} />
              ) : activeTab === 'terms' && userRole === 'HR_ADMIN' ? (
                <div className="space-y-8 pb-20">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span>📄</span> Manajemen Syarat & Ketentuan
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
                      Bagian ini mengontrol isi dari dokumen "Syarat & Ketentuan" yang dapat dilihat oleh warga di bagian bawah portal. 
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-white/5 rounded-2xl p-6">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Konten Dokumen</label>
                    <textarea 
                      value={termsContent}
                      onChange={e => setTermsContent(e.target.value)}
                      rows={20}
                      placeholder="Masukkan Syarat & Ketentuan di sini..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-sm text-slate-300 focus:border-amber-500/50 outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : activeTab === 'depts' && userRole === 'HR_ADMIN' ? (
                <div className="space-y-8 pb-20">
                   <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span>🏢</span> Manajemen Kartu Departemen
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
                      Edit informasi yang muncul pada kartu-kartu departemen di halaman utama (gambar, deskripsi, visi, tanggung jawab, persyaratan).
                    </p>
                  </div>

                  {depts.map(dept => (
                    <div key={dept.id} className="bg-slate-950 border border-white/5 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-8 h-8 flex items-center justify-center">
                           {dept.icon.startsWith('http') ? <img src={dept.icon} className="w-full h-full object-contain" /> : <span className="text-xl">{dept.icon}</span>}
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-widest">{dept.name}</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">URL Gambar Departemen</label>
                            <input 
                              type="text" 
                              value={dept.imageUrl}
                              onChange={e => updateDeptContent(dept.id, 'imageUrl', e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/30"
                              placeholder="https://..."
                            />
                            <div className="mt-2 h-24 w-full bg-slate-900 rounded-lg overflow-hidden border border-white/5">
                              <img src={dept.imageUrl} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Visi Departemen</label>
                            <input 
                              type="text" 
                              value={dept.vision}
                              onChange={e => updateDeptContent(dept.id, 'vision', e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-amber-500 outline-none focus:border-amber-500/30"
                            />
                            <div className="mt-4">
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Deskripsi Singkat (Muncul di Kartu)</label>
                              <input 
                                type="text" 
                                value={dept.shortDescription}
                                onChange={e => updateDeptContent(dept.id, 'shortDescription', e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/30"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Deskripsi Lengkap (Muncul di Detail)</label>
                          <textarea 
                            value={dept.longDescription}
                            onChange={e => updateDeptContent(dept.id, 'longDescription', e.target.value)}
                            rows={4}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500/30 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                          {/* EDIT RESPONSIBILITIES */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[8px] font-bold text-amber-500 uppercase tracking-[0.2em] block">Tanggung Jawab Utama</label>
                              <button 
                                onClick={() => addDeptArrayItem(dept.id, 'responsibilities')}
                                className="text-[8px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20"
                              >
                                + TAMBAH
                              </button>
                            </div>
                            <div className="space-y-2">
                              {dept.responsibilities.map((res, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={res}
                                    onChange={(e) => updateDeptArrayField(dept.id, 'responsibilities', idx, e.target.value)}
                                    className="flex-1 bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-amber-500/30"
                                  />
                                  <button onClick={() => removeDeptArrayItem(dept.id, 'responsibilities', idx)} className="text-slate-600 hover:text-red-500">✕</button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* EDIT REQUIREMENTS */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.2em] block">Persyaratan Bergabung</label>
                              <button 
                                onClick={() => addDeptArrayItem(dept.id, 'requirements')}
                                className="text-[8px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20"
                              >
                                + TAMBAH
                              </button>
                            </div>
                            <div className="space-y-2">
                              {dept.requirements.map((req, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={req}
                                    onChange={(e) => updateDeptArrayField(dept.id, 'requirements', idx, e.target.value)}
                                    className="flex-1 bg-slate-900 border border-white/5 rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-amber-500/30"
                                  />
                                  <button onClick={() => removeDeptArrayItem(dept.id, 'requirements', idx)} className="text-slate-600 hover:text-red-500">✕</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'structural' && userRole === 'HR_ADMIN' ? (
                <div className="space-y-12 pb-20">
                  {/* Restored Structural Editor UI */}
                  <div className="bg-slate-950/50 rounded-3xl border border-white/5 p-6 border-l-4 border-amber-500">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <span>🏛️</span> Pimpinan Eksekutif San Andreas
                    </h3>
                    <div className="space-y-6">
                      {leadership.map((l) => (
                        <div key={l.id} className="grid grid-cols-1 gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Gelar/Jabatan Resmi</label>
                            <input 
                              type="text" 
                              value={l.role}
                              onChange={(e) => updateLeadershipRole(l.id, e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/30"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nama Pejabat</label>
                            <input 
                              type="text" 
                              value={l.name}
                              onChange={(e) => updateLeadershipName(l.id, e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-amber-500 font-bold outline-none focus:border-amber-500/30"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                       Aparatur Sipil Departemen
                    </h3>
                    {depts.map(dept => (
                      <div key={dept.id} className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{dept.name}</h4>
                           </div>
                           <button 
                             onClick={() => addStaffRole(dept.id)}
                             className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[8px] font-bold rounded uppercase border border-amber-500/20"
                           >
                             + JABATAN BARU
                           </button>
                        </div>
                        <div className="p-4 space-y-4">
                          {dept.structuralStaff.map((staff, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-900/30 rounded-xl border border-white/5 group relative">
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                                  <input 
                                    type="text" 
                                    value={staff.role}
                                    onChange={(e) => updateStaffRole(dept.id, idx, e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-[10px] text-slate-200 outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nama</label>
                                  <input 
                                    type="text" 
                                    value={staff.name}
                                    onChange={(e) => updateStaffName(dept.id, idx, e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-[11px] text-white font-medium outline-none"
                                  />
                                </div>
                              </div>
                              {staff.level !== 1 && (
                                <button 
                                  onClick={() => deleteStaffRole(dept.id, idx)}
                                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">🔒</div>
                  <p className="text-slate-500 text-sm">Anda tidak memiliki izin untuk mengakses bagian ini.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsAdmin;
