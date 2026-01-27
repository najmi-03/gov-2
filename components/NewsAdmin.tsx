
import React, { useState, useEffect } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, StaffMember } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCityNews } from '../services/geminiService';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';

interface NewsAdminProps {
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;
  userRole: AdminRole;
  depts: DeptInfo[];
  setDepts: (depts: DeptInfo[]) => void;
  leadership: LeadershipMember[];
  setLeadership: (leadership: LeadershipMember[]) => void;
}

const NewsAdmin: React.FC<NewsAdminProps> = ({ news, setNews, userRole, depts, setDepts, leadership, setLeadership }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'inventory' | 'structural' | 'salary'>('news');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newNews, setNewNews] = useState({ title: '', tag: 'Umum', summary: '', imageUrl: '' });

  // Set default tab based on role when opened
  useEffect(() => {
    if (isOpen) {
      if (userRole === 'PAWN_ADMIN') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('structural');
      else if (userRole === 'TREASURY_ADMIN') setActiveTab('salary');
      else setActiveTab('news');
    }
  }, [isOpen, userRole]);

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.summary) return;

    const item: NewsItem = {
      id: 'n' + Date.now(),
      title: newNews.title,
      summary: newNews.summary,
      tag: newNews.tag,
      imageUrl: newNews.imageUrl || undefined,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setNews([item, ...news]);
    setNewNews({ title: '', tag: 'Umum', summary: '', imageUrl: '' });
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
    setNews(news.filter(n => n.id !== id));
  };

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
                      'Staff Human Resource'
                    }
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
                {(userRole === 'NEWS_ADMIN') && (
                  <button 
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}
                  >
                    Berita
                  </button>
                )}
                {(userRole === 'PAWN_ADMIN') && (
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}
                  >
                    Stok Pawn
                  </button>
                )}
                {(userRole === 'HR_ADMIN') && (
                  <button 
                    onClick={() => setActiveTab('structural')}
                    className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}
                  >
                    Struktural
                  </button>
                )}
                {(userRole === 'TREASURY_ADMIN') && (
                  <button 
                    onClick={() => setActiveTab('salary')}
                    className={`flex-1 min-w-[120px] py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}
                  >
                    Gaji & Keuangan
                  </button>
                )}
              </div>

              {activeTab === 'news' && userRole === 'NEWS_ADMIN' ? (
                <div className="space-y-8">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>✨</span> Tulis Otomatis dengan Gemini AI
                    </h3>
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? 'MENGHUBUNGI GEMINI...' : 'BUAT BERITA DENGAN AI'}
                    </button>
                  </div>

                  <form onSubmit={handleAddManual} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Judul Berita"
                      value={newNews.title}
                      onChange={e => setNewNews({...newNews, title: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none"
                    />
                    <textarea 
                      placeholder="Ringkasan Berita..."
                      rows={4}
                      value={newNews.summary}
                      onChange={e => setNewNews({...newNews, summary: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none resize-none"
                    />
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg transition-all">
                      PUBLIKASIKAN BERITA
                    </button>
                  </form>

                  <div className="space-y-2 pt-8 border-t border-white/5">
                    {news.map(n => (
                      <div key={n.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                        <div className="max-w-[70%]">
                          <p className="text-white font-bold text-xs truncate">{n.title}</p>
                          <p className="text-[10px] text-slate-500">{n.date}</p>
                        </div>
                        <button onClick={() => deleteNews(n.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'inventory' && userRole === 'PAWN_ADMIN' ? (
                <PawnshopManager />
              ) : activeTab === 'salary' && userRole === 'TREASURY_ADMIN' ? (
                <SalaryManager leadership={leadership} depts={depts} />
              ) : activeTab === 'structural' && userRole === 'HR_ADMIN' ? (
                <div className="space-y-12 pb-20">
                  {/* Executive Leadership Section */}
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

                  {/* Departments Section */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                       Aparatur Sipil Departemen
                    </h3>
                    {depts.map(dept => (
                      <div key={dept.id} className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <span className="text-sm">{dept.icon.length < 5 ? dept.icon : '🏛️'}</span>
                             <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{dept.name}</h4>
                           </div>
                           <button 
                             onClick={() => addStaffRole(dept.id)}
                             className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[8px] font-bold rounded uppercase tracking-widest border border-amber-500/20"
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
                                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-amber-500/30"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nama</label>
                                  <input 
                                    type="text" 
                                    value={staff.name}
                                    onChange={(e) => updateStaffName(dept.id, idx, e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-[11px] text-white font-medium outline-none focus:border-amber-500/30"
                                  />
                                </div>
                              </div>
                              {staff.level !== 1 && (
                                <button 
                                  onClick={() => deleteStaffRole(dept.id, idx)}
                                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                  title="Hapus Jabatan"
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
