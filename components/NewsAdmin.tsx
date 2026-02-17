
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, LegislativeDocument, FormConfig, FormField, RecruitmentConfig, PermissionConfig, CarouselItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';
import RecruitmentBuilder from './RecruitmentBuilder';
import PermissionManager from './PermissionManager';
import StaffPermissionPortal from './StaffPermissionPortal';
import SecretaryPortal from './SecretaryPortal';
import { saveToDatabase, fetchFromDatabase } from '../services/databaseService';

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
  recruitmentConfig: RecruitmentConfig; 
  permissionConfig: PermissionConfig[]; 
  carouselSlides: CarouselItem[]; 
  setCarouselSlides: (slides: CarouselItem[]) => void; 
}

type AdminTab = 'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'form_mgmt' | 'recruitment' | 'permission_mgmt' | 'permission_portal' | 'secretary_portal' | 'feedback_config' | 'carousel_mgmt';

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, staffName, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent,
  forms, setForms, recruitmentConfig, permissionConfig, carouselSlides, setCarouselSlides
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const leaderIconInputRef = useRef<HTMLInputElement>(null);
  const deptIconInputRef = useRef<HTMLInputElement>(null);

  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  // Local State for Permissions (to allow smooth editing)
  const [localPermissions, setLocalPermissions] = useState<PermissionConfig[]>(permissionConfig);

  const [feedbackPublicUrl, setFeedbackPublicUrl] = useState('');
  const [feedbackStaffUrl, setFeedbackStaffUrl] = useState('');

  // News State
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsTag, setNewNewsTag] = useState('Umum');
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const presidentFromDb = leadership.find(l => l.id === 'pres' || l.role.toLowerCase().includes('presiden'));
  const currentDisplayName = (isSuperAdmin && presidentFromDb) ? presidentFromDb.name : (staffName || 'Staff');

  // Sync props to local state
  useEffect(() => {
    setLocalPermissions(permissionConfig);
  }, [permissionConfig]);

  // Set default tabs based on Role
  useEffect(() => {
    if (isOpen) {
      if (isSuperAdmin) setActiveTab('news');
      else if (userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF' || userRole === 'STAFF') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('permission_mgmt'); // Default to Settings for HR
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

  const handleSaveFeedbackConfig = () => {
    localStorage.setItem('ls_gov_feedback_public', feedbackPublicUrl);
    localStorage.setItem('ls_gov_feedback_staff', feedbackStaffUrl);
    alert("Konfigurasi Kritik & Saran tersimpan!");
  };

  if (userRole === 'NONE') return null;

  // --- SAVE HANDLERS ---
  const saveRecruitmentConfig = async (config: RecruitmentConfig) => {
    await saveToDatabase('RECRUITMENT', config);
    alert("Konfigurasi Rekrutmen Tersimpan ke Database & Online!");
  };

  const savePermissions = async (perms: PermissionConfig[]) => {
      setLocalPermissions(perms); // Optimistic update
      await saveToDatabase('PERMISSIONS', perms);
  };

  // --- FORM MANAGEMENT LOGIC (DHA) ---
  const addNewForm = () => {
    const newForm: FormConfig = { 
        id: 'form_' + Date.now(), 
        title: 'Layanan Baru', 
        description: 'Deskripsi layanan...', 
        icon: '📄', 
        webhookKey: 'ls_gov_webhook_baru_' + Date.now(), 
        fields: [{ id: 'f1', label: 'Nama Lengkap (IC)', placeholder: '...', type: 'text', required: true }] 
    };
    setForms([...forms, newForm]);
    setEditingFormId(newForm.id);
  };

  const deleteForm = (id: string) => {
    if (confirm("⚠️ Hapus layanan form ini? Data yang belum tersimpan akan hilang.")) {
      setForms(forms.filter(f => f.id !== id));
      if (editingFormId === id) setEditingFormId(null);
    }
  };

  const updateFormMeta = (formId: string, field: keyof FormConfig, value: string) => {
    const updated = forms.map(f => f.id === formId ? { ...f, [field]: value } : f);
    setForms(updated);
  };

  const updateFormField = (formId: string, fieldId: string, label: string) => {
    const updated = forms.map(f => f.id === formId ? { ...f, fields: f.fields.map(field => field.id === fieldId ? { ...field, label } : field) } : f);
    setForms(updated);
  };

  const addFormField = (formId: string) => {
    setForms(forms.map(f => f.id === formId ? { ...f, fields: [...f.fields, { id: 'f' + Date.now(), label: 'Pertanyaan Baru', placeholder: 'Masukkan jawaban...', type: 'text', required: true }] } : f));
  };

  const removeFormField = (formId: string, fieldId: string) => {
    setForms(forms.map(f => f.id === formId ? { ...f, fields: f.fields.filter(field => field.id !== fieldId) } : f));
  };

  const saveFormsToDatabase = async () => {
    setIsSaving(true);
    await saveToDatabase('FORMS', forms);
    setIsSaving(false);
    alert("Perubahan Form Layanan berhasil disimpan ke Database!");
  };

  // --- NEWS LOGIC ---
  const handleAddNews = async () => {
    if (!newNewsTitle || !newNewsSummary) return;
    setIsSaving(true);

    if (editingNewsId) {
        const updated = news.map(n => n.id === editingNewsId ? { ...n, title: newNewsTitle, summary: newNewsSummary, tag: newNewsTag } : n);
        setNews(updated);
        await saveToDatabase('NEWS', updated);
        setEditingNewsId(null);
        alert("Berita diperbarui!");
    } else {
        const newItem: NewsItem = {
            id: Date.now().toString(),
            title: newNewsTitle,
            date: new Date().toLocaleDateString('id-ID'),
            summary: newNewsSummary,
            tag: newNewsTag,
            imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
        };
        const updated = [newItem, ...news];
        setNews(updated);
        await saveToDatabase('NEWS', updated);
        alert("Berita diterbitkan!");
    }
    setNewNewsTitle('');
    setNewNewsSummary('');
    setIsSaving(false);
  };

  const deleteNews = async (id: string) => {
      if(confirm("Hapus berita ini?")) {
          const updated = news.filter(n => n.id !== id);
          setNews(updated);
          await saveToDatabase('NEWS', updated);
      }
  }

  // --- STRUCTURAL LOGIC ---
  const handleSaveStructural = async () => {
      setIsSaving(true);
      await saveToDatabase('DEPTS', depts);
      await saveToDatabase('LEADERSHIP', leadership);
      setIsSaving(false);
      alert("Struktural & Detail Departemen tersimpan!");
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-amber-500 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-full md:w-[85vw] lg:w-[70vw] max-w-5xl bg-slate-900 shadow-2xl flex flex-col border-l border-white/10"
            >
              
              <div className="flex-shrink-0 p-6 border-b border-white/10 bg-slate-900 z-10 flex justify-between items-start">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Panel Administrasi</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isSuperAdmin ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-amber-500 border border-amber-500/20'}`}>
                        {isSuperAdmin ? '👑 Super Admin' : userRole}
                    </span>
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">{currentDisplayName}</span>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* ADMIN TABS NAVIGATION */}
                <div className="flex border-b border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {/* HOME AFFAIRS TABS */}
                    {(isSuperAdmin || userRole === 'DHA_ADMIN') && (
                        <button onClick={() => setActiveTab('form_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'form_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Manajemen Form</button>
                    )}

                    {/* LEGISLATIVE ACCESS (DHA, NEWS, SEC, SUPER) */}
                    {(isSuperAdmin || userRole === 'DHA_ADMIN' || userRole === 'NEWS_ADMIN' || userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                        <button onClick={() => setActiveTab('legislative')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Legislatif</button>
                    )}

                    {/* HR TABS */}
                    {(isSuperAdmin || userRole === 'HR_ADMIN') && (
                    <>
                        <button onClick={() => setActiveTab('recruitment')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'recruitment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Rekrutmen</button>
                        <button onClick={() => setActiveTab('permission_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'permission_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Setting Izin</button>
                        <button onClick={() => setActiveTab('structural')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Struktural & Dept</button>
                    </>
                    )}

                    {/* TREASURY TABS */}
                    {(isSuperAdmin || userRole === 'TREASURY_ADMIN') && (
                        <button onClick={() => setActiveTab('salary')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Penggajian</button>
                    )}

                    {/* NEWS & SETTINGS TABS */}
                    {(isSuperAdmin || userRole === 'NEWS_ADMIN') && (
                        <>
                            <button onClick={() => setActiveTab('news')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Berita</button>
                            <button onClick={() => setActiveTab('feedback_config')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'feedback_config' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Pengaturan</button>
                        </>
                    )}

                    {/* SECRETARY TABS */}
                    {(isSuperAdmin || userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                        <button onClick={() => setActiveTab('secretary_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'secretary_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Sekretariat</button>
                    )}

                    {/* GENERAL TABS */}
                    <button onClick={() => setActiveTab('permission_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'permission_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Loket Izin</button>
                    
                    {/* INVENTORY TAB - ENABLED FOR TREASURY ADMIN */}
                    {(isSuperAdmin || userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF' || userRole === 'STAFF' || userRole === 'TREASURY_ADMIN') && (
                        <button onClick={() => setActiveTab('inventory')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Inventaris</button>
                    )}
                </div>

                {/* --- TAB CONTENT --- */}
                <div className="pb-20">
                    
                    {/* FEEDBACK CONFIG */}
                    {activeTab === 'feedback_config' && (
                        <div className="space-y-6">
                            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
                                <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span>💬</span> Konfigurasi Kritik & Saran
                                </h3>
                                <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
                                Atur Webhook Discord untuk menerima laporan dari kotak saran warga (Public) dan aspirasi internal pegawai (Staff).
                                </p>
                            </div>
                            
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Webhook Kritik Saran Publik</label>
                                    <input 
                                        type="text" 
                                        value={feedbackPublicUrl} 
                                        onChange={(e) => setFeedbackPublicUrl(e.target.value)} 
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50"
                                    />
                                    <p className="text-[9px] text-slate-600">Digunakan saat warga biasa mengirim saran tanpa login.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Webhook Aspirasi Internal Staff</label>
                                    <input 
                                        type="text" 
                                        value={feedbackStaffUrl} 
                                        onChange={(e) => setFeedbackStaffUrl(e.target.value)} 
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/50"
                                    />
                                    <p className="text-[9px] text-slate-600">Digunakan saat pegawai mengirim saran (termasuk fitur Pengaduan Internal).</p>
                                </div>

                                <button onClick={handleSaveFeedbackConfig} className="bg-amber-500 text-slate-950 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                                    Simpan Konfigurasi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* REKRUTMEN */}
                    {activeTab === 'recruitment' && <RecruitmentBuilder config={recruitmentConfig} onSave={saveRecruitmentConfig} />}

                    {/* MANAJEMEN FORM (DHA) */}
                    {activeTab === 'form_mgmt' && (
                    <div className="space-y-8">
                        <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1">Manajemen Form Layanan</h3>
                                <p className="text-[10px] text-slate-500">Edit pertanyaan, judul, atau hapus layanan form warga.</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={addNewForm} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors">+ Form Baru</button>
                                <button onClick={saveFormsToDatabase} disabled={isSaving} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-amber-400 transition-colors">Simpan Database</button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {forms.length === 0 && <p className="text-center text-slate-500 text-xs">Belum ada form.</p>}
                            
                            {forms.map(form => (
                                <div key={form.id} className="bg-slate-950 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl overflow-hidden text-2xl">
                                                {form.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{form.title}</h4>
                                                <p className="text-[9px] text-slate-500">{form.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setEditingFormId(editingFormId === form.id ? null : form.id)} 
                                                className={`text-[9px] font-bold px-4 py-2 rounded-lg uppercase transition-all ${editingFormId === form.id ? 'bg-amber-500 text-slate-950' : 'text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'}`}
                                            >
                                                {editingFormId === form.id ? 'Tutup' : '✏️ Edit'}
                                            </button>
                                            <button 
                                                onClick={() => deleteForm(form.id)} 
                                                className="text-[9px] font-bold text-red-500 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* AREA EDIT FORM */}
                                    {editingFormId === form.id && (
                                        <div className="space-y-6 mt-6 border-t border-white/5 pt-6 bg-slate-900/50 p-4 rounded-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Judul Form</label>
                                                    <input type="text" value={form.title} onChange={e => updateFormMeta(form.id, 'title', e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Deskripsi</label>
                                                    <input type="text" value={form.description} onChange={e => updateFormMeta(form.id, 'description', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Icon (Emoji/URL)</label>
                                                    <input type="text" value={form.icon} onChange={e => updateFormMeta(form.id, 'icon', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Webhook Discord Key (LocalStorage)</label>
                                                    <input type="text" value={form.webhookKey} onChange={e => updateFormMeta(form.id, 'webhookKey', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-blue-400" />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase">Pertanyaan Form</h5>
                                                    <button onClick={() => addFormField(form.id)} className="text-amber-500 text-[9px] font-bold hover:text-white">+ Tambah Pertanyaan</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {form.fields.map((field, idx) => (
                                                        <div key={field.id} className="flex gap-2 items-center">
                                                            <span className="text-[9px] font-mono text-slate-600 w-4">#{idx + 1}</span>
                                                            <input type="text" value={field.label} onChange={e => updateFormField(form.id, field.id, e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded px-3 py-2 text-xs text-white" placeholder="Pertanyaan..." />
                                                            <button onClick={() => removeFormField(form.id, field.id)} className="text-red-500 hover:text-white px-2">✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    )}
                    
                    {/* LEGISLATIF (DHA) */}
                    {activeTab === 'legislative' && <LegislativeManager docs={docs} setDocs={(d) => { setDocs(d); saveToDatabase('DOCS', d); }} />}
                    
                    {/* BERITA */}
                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest">{editingNewsId ? 'Edit Berita' : 'Buat Berita Baru'}</h3>
                                <input type="text" placeholder="Judul" value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-4 py-2 text-sm text-white" />
                                <textarea placeholder="Isi Berita..." value={newNewsSummary} onChange={(e) => setNewNewsSummary(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded px-4 py-2 text-sm text-white h-24" />
                                <button onClick={handleAddNews} disabled={isSaving} className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded uppercase text-xs hover:bg-amber-400">
                                    {editingNewsId ? 'Simpan Perubahan' : 'Publikasikan'}
                                </button>
                                {editingNewsId && <button onClick={() => { setEditingNewsId(null); setNewNewsTitle(''); setNewNewsSummary(''); }} className="w-full text-slate-500 text-xs py-2">Batal Edit</button>}
                            </div>
                            <div className="space-y-4">
                                {news.map(item => (
                                    <div key={item.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-white/5">
                                        <div><h4 className="text-sm font-bold text-white">{item.title}</h4><p className="text-[10px] text-slate-500">{item.date}</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingNewsId(item.id); setNewNewsTitle(item.title); setNewNewsSummary(item.summary); }} className="text-blue-500 text-xs bg-blue-500/10 px-3 py-1 rounded">Edit</button>
                                            <button onClick={() => deleteNews(item.id)} className="text-red-500 text-xs bg-red-500/10 px-3 py-1 rounded">Hapus</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTHER MODULES */}
                    {activeTab === 'permission_portal' && <StaffPermissionPortal permissions={localPermissions} staffName={currentDisplayName} />}
                    {activeTab === 'secretary_portal' && <SecretaryPortal staffName={currentDisplayName} role={isSuperAdmin ? 'SECRETARY_OF_STATE' : userRole} />}
                    
                    {/* INVENTORY & PAWNSHOP */}
                    {activeTab === 'inventory' && (
                        <PawnshopManager 
                            staffName={currentDisplayName} 
                            userRole={isSuperAdmin ? 'PAWN_ADMIN' : userRole} // Pass exact role, logic handled in PawnshopManager
                        />
                    )}

                    {activeTab === 'structural' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white uppercase">Struktural & Detail Departemen</h3>
                                <button onClick={handleSaveStructural} disabled={isSaving} className="bg-amber-500 text-slate-950 px-4 py-2 rounded text-xs font-bold uppercase">{isSaving ? 'Saving...' : 'Save Database'}</button>
                            </div>
                            <div className="grid gap-6">
                                {depts.map((dept, i) => (
                                    <div key={dept.id} className="bg-slate-900 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-amber-500 uppercase">{dept.name}</h4>
                                            <span className="text-[9px] text-slate-500">ID: {dept.id}</span>
                                        </div>
                                        
                                        {/* DEPARTMENT CARD SETTINGS */}
                                        <div className="space-y-3 mb-6 p-3 bg-slate-950/50 rounded-lg border border-white/5">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase">Visi</label>
                                                <textarea 
                                                    value={dept.vision} 
                                                    onChange={e => { const d = [...depts]; d[i].vision = e.target.value; setDepts(d); }} 
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase">Deskripsi Singkat (Card)</label>
                                                <textarea 
                                                    value={dept.shortDescription} 
                                                    onChange={e => { const d = [...depts]; d[i].shortDescription = e.target.value; setDepts(d); }} 
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase">Image URL (Background)</label>
                                                    <input 
                                                        type="text" 
                                                        value={dept.imageUrl} 
                                                        onChange={e => { const d = [...depts]; d[i].imageUrl = e.target.value; setDepts(d); }} 
                                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-blue-400"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase">Icon (Emoji/URL)</label>
                                                    <input 
                                                        type="text" 
                                                        value={dept.icon} 
                                                        onChange={e => { const d = [...depts]; d[i].icon = e.target.value; setDepts(d); }} 
                                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Staff Struktural</h5>
                                        {dept.structuralStaff.map((staff, j) => (
                                            <div key={j} className="flex gap-2 mb-2">
                                                <input type="text" value={staff.role} onChange={e => { const d = [...depts]; d[i].structuralStaff[j].role = e.target.value; setDepts(d); }} className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                                <input type="text" value={staff.name} onChange={e => { const d = [...depts]; d[i].structuralStaff[j].name = e.target.value; setDepts(d); }} className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'salary' && <SalaryManager leadership={leadership} depts={depts} />}
                    
                    {/* PERMISSION CONFIG MANAGER */}
                    {activeTab === 'permission_mgmt' && <PermissionManager permissions={localPermissions} setPermissions={savePermissions} />}
                </div>
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsAdmin;
