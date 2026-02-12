
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, LegislativeDocument, FormConfig, FormField, RecruitmentConfig, PermissionConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';
import RecruitmentBuilder from './RecruitmentBuilder';
import PermissionManager from './PermissionManager';
import StaffPermissionPortal from './StaffPermissionPortal';
import SecretaryPortal from './SecretaryPortal';
import { saveToDatabase } from '../services/databaseService';

interface NewsAdminProps {
  news: NewsItem[];
  setNews: (news: NewsItem[]) => void;
  userRole: AdminRole;
  staffName?: string | null;
  depts: DeptInfo[];
  setDepts: (depts: DeptInfo[]) => void;
  leadership: LeadershipMember[];
  setLeadership: (leadership: LeadershipMember[]) => void;
  docs: LegislativeDocument[];
  setDocs: (docs: LegislativeDocument[]) => void;
  termsContent: string;
  setTermsContent: (content: string) => void;
  recruitmentLink?: string;
  setRecruitmentLink?: (link: string) => void;
  forms: FormConfig[];
  setForms: (forms: FormConfig[]) => void;
  recruitmentConfig: RecruitmentConfig; // Received from App.tsx
  permissionConfig: PermissionConfig[]; // Received from App.tsx
}

type AdminTab = 'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'form_mgmt' | 'recruitment' | 'permission_mgmt' | 'permission_portal' | 'secretary_portal' | 'feedback_config';

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, staffName, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent,
  recruitmentLink = "", setRecruitmentLink, forms, setForms, recruitmentConfig, permissionConfig
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [isSaving, setIsSaving] = useState(false);
  const [showPresidentSwitch, setShowPresidentSwitch] = useState(false);
  
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const leaderIconInputRef = useRef<HTMLInputElement>(null);
  const deptIconInputRef = useRef<HTMLInputElement>(null);

  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  // Use Props for initial state, but we'll need to update DB on save
  const [localRecruitmentConfig, setLocalRecruitmentConfig] = useState<RecruitmentConfig>(recruitmentConfig);
  const [localPermissions, setLocalPermissions] = useState<PermissionConfig[]>(permissionConfig);

  const [feedbackPublicUrl, setFeedbackPublicUrl] = useState('');
  const [feedbackStaffUrl, setFeedbackStaffUrl] = useState('');

  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsTag, setNewNewsTag] = useState('Umum');

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  
  const presidentFromDb = leadership.find(l => l.id === 'pres' || l.role.toLowerCase().includes('presiden'));
  const currentDisplayName = (isSuperAdmin && presidentFromDb) ? presidentFromDb.name : (staffName || 'Staff');

  // Sync internal state when props change (real-time updates from other users)
  useEffect(() => {
    setLocalRecruitmentConfig(recruitmentConfig);
  }, [recruitmentConfig]);

  useEffect(() => {
    setLocalPermissions(permissionConfig);
  }, [permissionConfig]);

  useEffect(() => {
    if (isOpen) {
      if (isSuperAdmin) setActiveTab('news');
      else if (userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF' || userRole === 'STAFF') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('permission_portal'); 
      else if (userRole === 'TREASURY_ADMIN') setActiveTab('salary');
      else if (userRole === 'DHA_ADMIN') setActiveTab('form_mgmt');
      else if (userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') setActiveTab('secretary_portal');
      else if (userRole === 'NEWS_ADMIN') setActiveTab('news');
      else setActiveTab('permission_portal');
    }
  }, [isOpen, userRole, isSuperAdmin]);

  useEffect(() => {
    setFeedbackPublicUrl(localStorage.getItem('ls_gov_feedback_public') || '');
    setFeedbackStaffUrl(localStorage.getItem('ls_gov_feedback_staff') || '');
  }, []);

  if (userRole === 'NONE') return null;

  // === FITUR BARU: MASTER SYNC BUTTON ===
  const handleMasterSync = async () => {
    if (!confirm("⚠️ PERINGATAN MASTER SYNC ⚠️\n\nTindakan ini akan MEMAKSA UPLOAD seluruh data yang tampil di layar Anda saat ini ke Database Pusat (Google Sheet).\n\nGunakan tombol ini JIKA ada data yang tidak sinkron antar device/browser.\n\nLanjutkan?")) return;

    setIsSaving(true);
    try {
      // Parallel Save All Configs
      await Promise.all([
        saveToDatabase('DEPTS', depts),
        saveToDatabase('NEWS', news),
        saveToDatabase('LEADERSHIP', leadership),
        saveToDatabase('DOCS', docs),
        saveToDatabase('FORMS', forms),
        saveToDatabase('TERMS', termsContent),
        saveToDatabase('RECRUITMENT', recruitmentConfig),
        saveToDatabase('PERMISSIONS', permissionConfig)
      ]);
      alert("✅ MASTER SYNC BERHASIL!\n\nSeluruh konfigurasi sistem telah disamakan dengan data di layar Anda. Device lain akan update dalam 10 detik.");
    } catch (e) {
      alert("❌ Gagal Sinkronisasi. Cek koneksi internet.");
      console.error(e);
    }
    setIsSaving(false);
  };
  // ======================================

  const handleAddNews = async () => {
    if (!newNewsTitle || !newNewsSummary) return;
    setIsSaving(true);
    const newItem: NewsItem = {
      id: Date.now().toString(),
      title: newNewsTitle,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      summary: newNewsSummary,
      tag: newNewsTag,
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    };
    const updatedNews = [newItem, ...news];
    setNews(updatedNews);
    await saveToDatabase('NEWS', updatedNews);
    setNewNewsTitle('');
    setNewNewsSummary('');
    setIsSaving(false);
    alert("Berita berhasil diterbitkan ke Database!");
  };

  const handleSaveStructural = async () => {
      setIsSaving(true);
      await saveToDatabase('DEPTS', depts);
      await saveToDatabase('LEADERSHIP', leadership);
      setIsSaving(false);
      alert("Data Struktural Tersimpan di Database!");
  };

  const handleSaveDocs = async (updatedDocs: LegislativeDocument[]) => {
      setDocs(updatedDocs);
      await saveToDatabase('DOCS', updatedDocs);
      alert("Dokumen tersimpan ke Database!");
  };

  const saveRecruitmentConfig = async (config: RecruitmentConfig) => {
    setLocalRecruitmentConfig(config);
    // Directly save to Database so other clients pick it up via App.tsx polling
    await saveToDatabase('RECRUITMENT', config);
    alert("Konfigurasi Rekrutmen Tersimpan ke Database & Online!");
  };

  const savePermissions = async (perms: PermissionConfig[]) => {
      setLocalPermissions(perms);
      await saveToDatabase('PERMISSIONS', perms);
      // alert("Konfigurasi Izin Tersimpan ke Database!");
  };

  const saveFeedbackConfig = () => {
    localStorage.setItem('ls_gov_feedback_public', feedbackPublicUrl);
    localStorage.setItem('ls_gov_feedback_staff', feedbackStaffUrl);
    alert("Konfigurasi Webhook Kritik & Saran tersimpan!");
  };

  const updateFormField = (formId: string, fieldId: string, label: string) => {
    const updated = forms.map(f => f.id === formId ? { ...f, fields: f.fields.map(field => field.id === fieldId ? { ...field, label } : field) } : f);
    setForms(updated);
  };

  const updateFormMeta = (formId: string, field: keyof FormConfig, value: string) => {
    const updated = forms.map(f => f.id === formId ? { ...f, [field]: value } : f);
    setForms(updated);
  };

  const handleIconUpload = (formId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => updateFormMeta(formId, 'icon', event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLeaderIconUpload = (leaderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLeadership(leadership.map(l => l.id === leaderId ? { ...l, icon: base64 } : l));
    };
    reader.readAsDataURL(file);
  };

  const handleDeptIconUpload = (deptId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setDepts(depts.map(d => d.id === deptId ? { ...d, icon: event.target?.result as string } : d));
    reader.readAsDataURL(file);
  };

  const addFormField = (formId: string) => {
    setForms(forms.map(f => f.id === formId ? { ...f, fields: [...f.fields, { id: 'f' + Date.now(), label: 'Pertanyaan Baru', placeholder: 'Masukkan jawaban...', type: 'text', required: true }] } : f));
  };

  const removeFormField = (formId: string, fieldId: string) => {
    setForms(forms.map(f => f.id === formId ? { ...f, fields: f.fields.filter(field => field.id !== fieldId) } : f));
  };

  const addNewForm = () => {
    const newForm: FormConfig = { id: 'form_' + Date.now(), title: 'Layanan Baru', description: 'Deskripsi...', icon: '📄', webhookKey: 'ls_gov_webhook_baru_' + Date.now(), fields: [{ id: 'f1', label: 'Nama Lengkap (IC)', placeholder: '...', type: 'text', required: true }] };
    setForms([...forms, newForm]);
    setEditingFormId(newForm.id);
  };

  const deleteForm = (id: string) => {
    if (confirm("Hapus seluruh layanan form ini?")) {
      setForms(forms.filter(f => f.id !== id));
      if (editingFormId === id) setEditingFormId(null);
    }
  };

  const saveFormsToDatabase = async () => {
    setIsSaving(true);
    if (await saveToDatabase('FORMS', forms)) alert("Layanan Form tersimpan!");
    setIsSaving(false);
  };

  const addDeptMember = (deptIndex: number) => {
    const updated = [...depts];
    updated[deptIndex].structuralStaff.push({ role: 'Jabatan Baru', name: 'Nama Pejabat', level: 3 });
    setDepts(updated);
  };

  const removeDeptMember = (deptIndex: number, staffIndex: number) => {
    if (confirm("Hapus anggota?")) {
        const updated = [...depts];
        updated[deptIndex].structuralStaff.splice(staffIndex, 1);
        setDepts(updated);
    }
  };

  const presidentTabs: { label: string, tab: AdminTab, icon: string }[] = [
    { label: 'Humas & Berita', tab: 'news', icon: '📢' },
    { label: 'Ekonomi & Logistik', tab: 'inventory', icon: '📦' },
    { label: 'Keuangan & Gaji', tab: 'salary', icon: '💰' },
    { label: 'HR & Rekrutmen', tab: 'recruitment', icon: '👥' },
    { label: 'Struktural Negara', tab: 'structural', icon: '🏛️' },
    { label: 'Home Affairs & Form', tab: 'form_mgmt', icon: '📄' },
    { label: 'Sekretariat Negara', tab: 'secretary_portal', icon: '📠' },
    { label: 'Hukum & Legislatif', tab: 'legislative', icon: '⚖️' },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-amber-500 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full md:max-w-2xl lg:max-w-3xl h-full bg-slate-900 border-l border-white/10 shadow-2xl p-5 md:p-8 overflow-y-auto custom-scrollbar">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Panel Administrasi</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isSuperAdmin ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-amber-500 border border-amber-500/20'}`}>
                        {isSuperAdmin ? '👑 Super Admin' : userRole}
                    </span>
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">
                        {currentDisplayName.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">✕</button>
              </div>

              {/* DROPDOWN KHUSUS PRESIDEN + TOMBOL MASTER SYNC */}
              {isSuperAdmin && (
                <div className="relative mb-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <div className="flex flex-col gap-4">
                        {/* Header Pres */}
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowPresidentSwitch(!showPresidentSwitch)}>
                            <div>
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Akses Cepat Presiden</h4>
                                <p className="text-[9px] text-slate-400">Pilih departemen untuk mengelola datanya</p>
                            </div>
                            <button className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-400 transition-colors">
                                {presidentTabs.find(t => t.tab === activeTab)?.label || 'Lompat ke Panel'}
                                <span>{showPresidentSwitch ? '▲' : '▼'}</span>
                            </button>
                        </div>

                        {/* MASTER SYNC BUTTON */}
                        <button 
                            onClick={handleMasterSync}
                            disabled={isSaving}
                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${isSaving ? 'bg-slate-700 text-slate-400' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isSaving ? 'SEDANG MENYIMPAN KE CLOUD...' : '🚀 FORCE PUSH: SINGKRONKAN SEMUA DATABASE'}
                        </button>
                        <p className="text-[8px] text-center text-slate-500 -mt-2">
                            *Tekan tombol merah di atas jika ada data yang tidak tampil di HP/PC warga lain.
                        </p>
                    </div>
                    
                    <AnimatePresence>
                        {showPresidentSwitch && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-amber-500/10">
                                {presidentTabs.map(pt => (
                                    <button 
                                        key={pt.tab} 
                                        onClick={() => { setActiveTab(pt.tab); setShowPresidentSwitch(false); }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === pt.tab ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-amber-500/50 hover:text-white'}`}
                                    >
                                        <span className="text-xl mb-1">{pt.icon}</span>
                                        <span className="text-[8px] font-black uppercase text-center leading-tight">{pt.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              )}

              {/* TAB NAVIGATION */}
              <div className="flex border-b border-white/10 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {(isSuperAdmin || userRole !== 'SECRETARY_OF_STATE') && (
                  <button onClick={() => setActiveTab('permission_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'permission_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Loket Izin</button>
                )}
                {(isSuperAdmin || userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                    <button onClick={() => setActiveTab('secretary_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'secretary_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Sekretariat</button>
                )}
                {(isSuperAdmin || userRole === 'NEWS_ADMIN') && (
                  <>
                    <button onClick={() => setActiveTab('news')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Berita Kota</button>
                    <button onClick={() => setActiveTab('feedback_config')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'feedback_config' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Kotak Saran</button>
                  </>
                )}
                {(isSuperAdmin || userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF' || userRole === 'STAFF') && (
                  <button onClick={() => setActiveTab('inventory')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>
                    {(isSuperAdmin || userRole === 'PAWN_ADMIN') ? 'Logistik & Harga' : 'Loker'}
                  </button>
                )}
                {(isSuperAdmin || userRole === 'HR_ADMIN') && (
                  <>
                     <button onClick={() => setActiveTab('recruitment')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'recruitment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Manajemen Rekrutmen</button>
                     <button onClick={() => setActiveTab('permission_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'permission_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Setting Izin</button>
                     <button onClick={() => setActiveTab('structural')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Struktural</button>
                  </>
                )}
                {(isSuperAdmin || userRole === 'TREASURY_ADMIN') && <button onClick={() => setActiveTab('salary')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Penggajian</button>}
                {(isSuperAdmin || userRole === 'DHA_ADMIN') && (
                  <>
                    <button onClick={() => setActiveTab('form_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'form_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Manajemen Form</button>
                    <button onClick={() => setActiveTab('legislative')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Legislatif</button>
                  </>
                )}
                <button onClick={() => setActiveTab('terms')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'terms' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Syarat & Ketentuan</button>
              </div>

              {/* TAB CONTENT */}
              {activeTab === 'news' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-white/5 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">Terbitkan Berita Baru</h3>
                      <input type="text" placeholder="Judul Berita" value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all" />
                      <textarea rows={4} placeholder="Isi Berita..." value={newNewsSummary} onChange={(e) => setNewNewsSummary(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all" />
                      <div className="flex gap-2">{['Umum', 'Ekonomi', 'Kesehatan', 'Hukum', 'Politik'].map(tag => (<button key={tag} onClick={() => setNewNewsTag(tag)} className={`px-3 py-1 rounded text-[10px] uppercase font-bold border transition-colors ${newNewsTag === tag ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-transparent text-slate-500 border-white/10 hover:text-white'}`}>{tag}</button>))}</div>
                      <button onClick={handleAddNews} disabled={isSaving} className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all">{isSaving ? 'Menyimpan...' : 'PUBLIKASIKAN BERITA'}</button>
                    </div>
                    <div className="space-y-4">{news.map((item) => (<div key={item.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all"><div><h4 className="font-bold text-white text-sm">{item.title}</h4><p className="text-[10px] text-slate-500">{item.date}</p></div><button onClick={async () => { if(confirm("Hapus berita?")) { const updated = news.filter(n => n.id !== item.id); setNews(updated); await saveToDatabase('NEWS', updated); } }} className="text-red-500 hover:text-red-400 hover:scale-110 transition-transform">🗑️</button></div>))}</div>
                  </div>
              )}

              {activeTab === 'permission_portal' && <StaffPermissionPortal permissions={localPermissions} staffName={currentDisplayName} />}
              {activeTab === 'secretary_portal' && <SecretaryPortal staffName={currentDisplayName} role={isSuperAdmin ? 'SECRETARY_OF_STATE' : userRole} />}
              {activeTab === 'feedback_config' && (
                <div className="space-y-6 pb-20">
                   <div className="bg-slate-950 p-6 rounded-2xl border-l-4 border-amber-500"><h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">💬 Kritik & Saran</h3></div>
                   <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6">
                      <div className="space-y-2"><label className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Webhook Publik</label><input type="text" value={feedbackPublicUrl} onChange={e => setFeedbackPublicUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none" /></div>
                      <div className="space-y-2"><label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Webhook Staff</label><input type="text" value={feedbackStaffUrl} onChange={e => setFeedbackStaffUrl(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none" /></div>
                      <button onClick={saveFeedbackConfig} className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400 active:scale-95 transition-all">Simpan Konfigurasi</button>
                   </div>
                </div>
              )}
              
              {/* MENGGUNAKAN LOCAL STATE & SAVE HANDLER AGAR TERSIMPAN KE DB */}
              {activeTab === 'permission_mgmt' && <PermissionManager permissions={localPermissions} setPermissions={savePermissions} />}
              
              {activeTab === 'inventory' && <PawnshopManager staffName={currentDisplayName} userRole={isSuperAdmin ? 'PAWN_ADMIN' : userRole} />}
              
              {/* MENGGUNAKAN LOCAL STATE & SAVE HANDLER AGAR TERSIMPAN KE DB */}
              {activeTab === 'recruitment' && <RecruitmentBuilder config={localRecruitmentConfig} onSave={saveRecruitmentConfig} />}
              
              {activeTab === 'structural' && (
                <div className="space-y-8 pb-20">
                   <div className="bg-slate-950 p-6 rounded-2xl border-l-4 border-amber-500 flex justify-between items-center"><div><h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">🏛️ Struktural</h3></div><button onClick={handleSaveStructural} disabled={isSaving} className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-400 active:scale-95 transition-all">{isSaving ? 'Menyimpan...' : 'Simpan Database'}</button></div>
                   <div className="bg-slate-900 border border-white/10 rounded-2xl p-6"><h4 className="text-xs font-bold text-white uppercase mb-6 border-b border-white/10 pb-4">Executive Office</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{leadership.map((leader, idx) => (<div key={leader.id} className="bg-slate-950 p-4 rounded-xl border border-white/5"><div className="flex items-center justify-between gap-3 mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden border border-white/10">{leader.icon && (leader.icon.startsWith('data:image') || leader.icon.startsWith('http')) ? (<img src={leader.icon} alt="" className="w-full h-full object-contain p-1" />) : (<span className="text-xl">{leader.icon}</span>)}</div><span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">{leader.role}</span></div><button onClick={() => leaderIconInputRef.current?.click()} className="text-[8px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors">UPLOAD</button><input type="file" ref={leaderIconInputRef} className="hidden" accept="image/*" onChange={(e) => handleLeaderIconUpload(leader.id, e)} /></div><input type="text" value={leader.name} onChange={(e) => { const updated = [...leadership]; updated[idx].name = e.target.value; setLeadership(updated); }} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none" /></div>))}</div></div>
                   <div className="space-y-6">{depts.map((dept, deptIdx) => (<div key={dept.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden"><div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5"><div className="flex items-center gap-3"><div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden border border-white/10">{dept.icon && (dept.icon.startsWith('data:image') || dept.icon.startsWith('http')) ? (<img src={dept.icon} alt="" className="w-full h-full object-contain p-1" />) : (<span className="text-xl">{dept.icon}</span>)}</div><h5 className="font-bold text-white text-sm uppercase">{dept.name}</h5></div><button onClick={() => { setUploadTargetId(dept.id); deptIconInputRef.current?.click(); }} className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white font-bold transition-colors">UPLOAD LOGO</button></div><input type="file" ref={deptIconInputRef} className="hidden" accept="image/*" onChange={(e) => uploadTargetId && handleDeptIconUpload(uploadTargetId, e)} /><div className="p-4 md:p-6 space-y-4">{dept.structuralStaff.map((staff, staffIdx) => (<div key={staffIdx} className="flex gap-2 items-center bg-slate-950 p-3 rounded-xl border border-white/5"><div className="w-10 flex flex-col items-center gap-1"><label className="text-[6px] font-bold text-slate-500 uppercase">LVL</label><input type="number" min="1" max="5" value={staff.level} onChange={(e) => { const updated = [...depts]; updated[deptIdx].structuralStaff[staffIdx].level = parseInt(e.target.value) || 3; setDepts(updated); }} className="w-8 bg-slate-900 border border-white/10 rounded text-center text-xs text-amber-500 font-bold" /></div><div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2"><div><input type="text" value={staff.role} onChange={(e) => { const updated = [...depts]; updated[deptIdx].structuralStaff[staffIdx].role = e.target.value; setDepts(updated); }} className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white" /></div><div><input type="text" value={staff.name} onChange={(e) => { const updated = [...depts]; updated[deptIdx].structuralStaff[staffIdx].name = e.target.value; setDepts(updated); }} className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white" /></div></div><button onClick={() => removeDeptMember(deptIdx, staffIdx)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">🗑️</button></div>))}<button onClick={() => addDeptMember(deptIdx)} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all">+ Anggota</button></div></div>))}</div>
                </div>
              )}
              {activeTab === 'salary' && <SalaryManager leadership={leadership} depts={depts} />}
              {activeTab === 'form_mgmt' && (
                <div className="space-y-8 pb-20">
                   <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 flex justify-between items-center"><div><h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">Layanan Form</h3></div><div className="flex gap-2"><button onClick={addNewForm} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors">+ Form</button><button onClick={saveFormsToDatabase} disabled={isSaving} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-amber-400 transition-colors">Simpan</button></div></div>
                   <div className="grid grid-cols-1 gap-6">{forms.map(form => (<div key={form.id} className="bg-slate-950 p-6 rounded-2xl border border-white/5"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl overflow-hidden">{form.icon && (form.icon.startsWith('http') || form.icon.startsWith('data:image')) ? (<img src={form.icon} alt="" className="w-full h-full object-contain p-1" />) : (<span className="text-2xl">{form.icon}</span>)}</div><div><h4 className="font-bold text-white text-sm">{form.title}</h4></div></div><div className="flex gap-2"><button onClick={() => setEditingFormId(editingFormId === form.id ? null : form.id)} className="text-[9px] font-black text-amber-500 border border-amber-500/30 px-3 py-1 rounded-lg uppercase hover:bg-amber-500 hover:text-slate-950 transition-all">{editingFormId === form.id ? 'TUTUP' : 'KELOLA'}</button><button onClick={() => deleteForm(form.id)} className="text-[9px] font-black text-red-500 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button></div></div>{editingFormId === form.id && (<div className="space-y-6 mt-6 border-t border-white/5 pt-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase">Judul</label><input type="text" value={form.title} onChange={e => updateFormMeta(form.id, 'title', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" /></div><div className="space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase">Icon</label><div className="flex gap-2"><input type="text" value={form.icon && form.icon.startsWith('data:image') ? '[Image]' : form.icon} onChange={e => updateFormMeta(form.id, 'icon', e.target.value)} className="flex-1 bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" /><button onClick={() => iconInputRef.current?.click()} className="bg-blue-600 text-white px-3 py-2 rounded text-[10px] font-bold uppercase hover:bg-blue-500 transition-colors">Upload</button><input type="file" ref={iconInputRef} onChange={(e) => handleIconUpload(form.id, e)} className="hidden" accept="image/*" /></div></div></div><div className="p-4 bg-slate-900 rounded-xl border border-white/10"><label className="text-[9px] font-bold text-blue-400 uppercase mb-2 block">Webhook</label><input type="text" value={localStorage.getItem(form.webhookKey) || ''} onChange={e => { localStorage.setItem(form.webhookKey, e.target.value); setForms([...forms]); }} placeholder="https://..." className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white focus:border-blue-500/50 outline-none" /></div><div className="space-y-4">{form.fields.map((field, idx) => (<div key={field.id} className="flex gap-4 items-end bg-white/5 p-4 rounded-xl"><div className="flex-1 space-y-1"><label className="text-[8px] font-bold text-slate-500 uppercase">Pertanyaan #{idx + 1}</label><input type="text" value={field.label} onChange={e => updateFormField(form.id, field.id, e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" /></div><button onClick={() => removeFormField(form.id, field.id)} className="bg-red-500/10 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">✕</button></div>))}<button onClick={() => addFormField(form.id)} className="w-full py-3 border-2 border-dashed border-white/10 text-[9px] font-black text-slate-500 hover:text-amber-500 transition-all rounded-xl uppercase">+ TAMBAH PERTANYAAN</button></div></div>)}</div>))}</div>
                </div>
              )}
              {activeTab === 'legislative' && <LegislativeManager docs={docs} setDocs={handleSaveDocs} />}
              {activeTab === 'terms' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border-l-4 border-amber-500 flex justify-between items-center"><div><h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">Syarat & Ketentuan</h3><p className="text-[10px] text-slate-500">Edit isi dokumen resmi portal</p></div><button onClick={async () => { setIsSaving(true); if(await saveToDatabase('TERMS', termsContent)) alert("Tersimpan!"); setIsSaving(false); }} disabled={isSaving} className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-amber-400 active:scale-95 transition-all">Simpan</button></div>
                  <textarea rows={15} value={termsContent} onChange={e => setTermsContent(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-amber-500/50 outline-none font-light leading-relaxed" />
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
