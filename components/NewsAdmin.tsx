
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, LegislativeDocument, FormConfig, FormField, RecruitmentConfig, PermissionConfig, CarouselItem, PawnItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';
import RecruitmentBuilder from './RecruitmentBuilder';
import PermissionManager from './PermissionManager';
import StaffPermissionPortal from './StaffPermissionPortal';
import SecretaryPortal from './SecretaryPortal';
import CarouselManager from './CarouselManager';
import WebhookManager from './WebhookManager';
import KPIManager from './KPIManager';
import UserApprovalManager from './UserApprovalManager';
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
  pawnItems: PawnItem[];
  setPawnItems: (items: PawnItem[]) => void;
  webhooks: Record<string, string>;
  setWebhooks: (webhooks: Record<string, string>) => void;
}

type AdminTab = 'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'form_mgmt' | 'recruitment' | 'permission_mgmt' | 'permission_portal' | 'secretary_portal' | 'carousel_mgmt' | 'webhooks' | 'kpi_mgmt' | 'user_approval';

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, staffName, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent,
  forms, setForms, recruitmentConfig, permissionConfig, carouselSlides, setCarouselSlides, pawnItems, setPawnItems,
  webhooks, setWebhooks
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('news');
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [formIdToDelete, setFormIdToDelete] = useState<string | null>(null);
  const [newsIdToDelete, setNewsIdToDelete] = useState<string | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<{ deptIdx: number; staffIdx: number } | null>(null);
  const [deptIdToDelete, setDeptIdToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const leaderIconInputRef = useRef<HTMLInputElement>(null);
  const deptIconInputRef = useRef<HTMLInputElement>(null);

  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  // Local State for Permissions (to allow smooth editing)
  const [localPermissions, setLocalPermissions] = useState<PermissionConfig[]>(permissionConfig);

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
      else if (userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE' || userRole.includes('SECRETARY') || userRole.includes('SEKRETARIS')) setActiveTab('secretary_portal');
      else if (userRole === 'NEWS_ADMIN') setActiveTab('news');
      else setActiveTab('permission_portal');
    }
  }, [isOpen, userRole, isSuperAdmin]);

  if (userRole === 'NONE') return null;

  // --- SAVE HANDLERS ---
  const saveRecruitmentConfig = async (config: RecruitmentConfig) => {
    await saveToDatabase('RECRUITMENT', config);
    showToast("Konfigurasi Rekrutmen Tersimpan!");
  };

  const savePermissions = async (perms: PermissionConfig[]) => {
      setLocalPermissions(perms); // Optimistic update
      await saveToDatabase('PERMISSIONS', perms);
  };

  const saveCarousel = async (slides: CarouselItem[]) => {
      setIsSaving(true);
      await saveToDatabase('CAROUSEL', slides);
      setCarouselSlides(slides);
      setIsSaving(false);
      showToast("Carousel berhasil diperbarui!");
  };

  // --- FORM MANAGEMENT LOGIC (DHA) ---
  const addNewForm = async () => {
    const newForm: FormConfig = { 
        id: 'form_' + Date.now(), 
        title: 'Layanan Baru', 
        description: 'Deskripsi layanan...', 
        icon: '📄', 
        webhookKey: 'ls_gov_webhook_baru_' + Date.now(), 
        fields: [{ id: 'f1', label: 'Nama Lengkap (IC)', placeholder: '...', type: 'text', required: true }] 
    };
    const updatedForms = [...forms, newForm];
    setForms(updatedForms);
    setEditingFormId(newForm.id);
    
    setIsSaving(true);
    await saveToDatabase('FORMS', updatedForms);
    setIsSaving(false);
    showToast("Form baru berhasil dibuat.");
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteForm = async (id: string) => {
    setIsSaving(true);
    try {
      const updatedForms = forms.filter(f => f.id !== id);
      
      // Update state in App.tsx
      setForms(updatedForms);
      
      if (editingFormId === id) setEditingFormId(null);
      setFormIdToDelete(null);

      // Save to database
      const success = await saveToDatabase('FORMS', updatedForms);
      if (success) {
        showToast("Form berhasil dihapus secara permanen.");
      } else {
        showToast("Gagal menyimpan ke database cloud.", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsSaving(false);
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
    const success = await saveToDatabase('FORMS', forms);
    setIsSaving(false);
    if (success) showToast("Perubahan Form Layanan berhasil disimpan ke Database!");
    else showToast("Gagal memperbarui database.", "error");
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
        showToast("Berita diperbarui!");
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
        showToast("Berita diterbitkan!");
    }
    setNewNewsTitle('');
    setNewNewsSummary('');
    setIsSaving(false);
  };

  const deleteNews = async (id: string) => {
      setIsSaving(true);
      try {
          const updated = news.filter(n => n.id !== id);
          setNews(updated);
          const success = await saveToDatabase('NEWS', updated);
          if (success) showToast("Berita berhasil dihapus.");
          else showToast("Gagal menyimpan ke database.", "error");
          setNewsIdToDelete(null);
      } catch (err) {
          showToast("Terjadi kesalahan.", "error");
      } finally {
          setIsSaving(false);
      }
  }

  // --- DEPARTMENT LOGIC ---
  const addNewDept = () => {
    const newDept: DeptInfo = {
      id: 'dept_' + Date.now(),
      name: 'Departemen Baru',
      icon: '🏢',
      shortDescription: 'Deskripsi singkat...',
      longDescription: 'Deskripsi lengkap...',
      vision: 'Visi departemen...',
      responsibilities: [],
      requirements: [],
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      structuralStaff: []
    };
    setDepts([...depts, newDept]);
    showToast("Departemen baru ditambahkan ke daftar.");
  };

  const deleteDept = (id: string) => {
    setDepts(depts.filter(d => d.id !== id));
    setDeptIdToDelete(null);
    showToast("Departemen dihapus.");
  };

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
                        <button onClick={() => setActiveTab('form_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'form_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Manajemen Form</button>
                    )}

                    {/* LEGISLATIVE ACCESS (DHA, NEWS, SEC, SUPER) */}
                    {(isSuperAdmin || userRole === 'DHA_ADMIN' || userRole === 'NEWS_ADMIN' || userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                        <button onClick={() => setActiveTab('legislative')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Legislatif</button>
                    )}

                    {/* HR TABS */}
                    {(isSuperAdmin || userRole === 'HR_ADMIN') && (
                    <>
                        <button onClick={() => setActiveTab('recruitment')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'recruitment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Rekrutmen</button>
                        <button onClick={() => setActiveTab('user_approval')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'user_approval' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Persetujuan Akun</button>
                        <button onClick={() => setActiveTab('kpi_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'kpi_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>KPI Pegawai</button>
                        <button onClick={() => setActiveTab('permission_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'permission_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Setting Izin</button>
                        <button onClick={() => setActiveTab('structural')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Struktural & Dept</button>
                    </>
                    )}

                    {/* TREASURY TABS */}
                    {(isSuperAdmin || userRole === 'TREASURY_ADMIN') && (
                        <button onClick={() => setActiveTab('salary')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Penggajian</button>
                    )}

                    {/* NEWS & SETTINGS TABS */}
                    {(isSuperAdmin || userRole === 'NEWS_ADMIN') && (
                        <>
                            <button onClick={() => setActiveTab('news')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Berita</button>
                            <button onClick={() => setActiveTab('carousel_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'carousel_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Carousel</button>
                        </>
                    )}

                    {/* SECRETARY TABS */}
                    {(isSuperAdmin || userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                        <button onClick={() => setActiveTab('secretary_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'secretary_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Sekretariat</button>
                    )}

                    {/* GENERAL TABS */}
                    <button onClick={() => setActiveTab('permission_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'permission_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Loket Izin</button>
                    
                    {/* INVENTORY TAB - ENABLED FOR ALL STAFF */}
                    <button onClick={() => setActiveTab('inventory')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Inventaris</button>

                    {/* WEBHOOKS TAB - SUPER ADMIN ONLY */}
                    {isSuperAdmin && (
                        <button onClick={() => setActiveTab('webhooks')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase transition-colors active:scale-95 ${activeTab === 'webhooks' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-white'}`}>Webhooks</button>
                    )}
                </div>

                {/* --- TAB CONTENT --- */}
                <div className="pb-20">
                    
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

                                            {formIdToDelete === form.id ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setFormIdToDelete(null)} 
                                                        className="text-[9px] font-bold text-slate-400 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                                                    >
                                                        Batal
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteForm(form.id)} 
                                                        className="text-[9px] font-bold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all animate-pulse"
                                                    >
                                                        Yakin Hapus?
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setFormIdToDelete(form.id)} 
                                                    className="text-[9px] font-bold text-red-500 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            )}
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
                                                    <label className="text-[8px] font-bold text-slate-500 uppercase">Webhook Discord Key (Database)</label>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        value={newNewsTag} 
                                        onChange={(e) => setNewNewsTag(e.target.value)}
                                        className="bg-slate-900 border border-white/10 rounded px-4 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                                    >
                                        <option value="Umum">Umum</option>
                                        <option value="Politik">Politik</option>
                                        <option value="Info">Info</option>
                                        <option value="Ekonomi">Ekonomi</option>
                                        <option value="Rekrutmen">Rekrutmen</option>
                                        <option value="Kesehatan">Kesehatan</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="URL Gambar (Opsional)" 
                                        className="bg-slate-900 border border-white/10 rounded px-4 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                                        onChange={(e) => {
                                            // Logic to update image URL if needed, for now we just use default or prompt
                                        }}
                                    />
                                </div>
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
                                            
                                            {newsIdToDelete === item.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setNewsIdToDelete(null)} className="text-slate-400 text-[10px] border border-white/10 px-2 py-1 rounded">Batal</button>
                                                    <button onClick={() => deleteNews(item.id)} className="text-white text-[10px] bg-red-600 px-2 py-1 rounded animate-pulse">Yakin?</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setNewsIdToDelete(item.id)} className="text-red-500 text-xs bg-red-500/10 px-3 py-1 rounded">Hapus</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CAROUSEL */}
                    {activeTab === 'carousel_mgmt' && (
                        <CarouselManager slides={carouselSlides} onSave={saveCarousel} />
                    )}

                    {/* OTHER MODULES */}
                    {(activeTab === 'permission_portal' || activeTab === 'secretary_portal') && (
                        <>
                            {activeTab === 'permission_portal' && <StaffPermissionPortal permissions={localPermissions} staffName={currentDisplayName} webhooks={webhooks} />}
                            {(activeTab === 'secretary_portal' || userRole.includes('SECRETARY') || userRole.includes('SEKRETARIS')) && <SecretaryPortal staffName={currentDisplayName} role={isSuperAdmin ? 'SECRETARY_OF_STATE' : userRole} webhooks={webhooks} />}
                        </>
                    )}
                    
                    {/* INVENTORY & PAWNSHOP */}
                    {activeTab === 'inventory' && (
                        <PawnshopManager 
                            staffName={currentDisplayName} 
                            userRole={isSuperAdmin ? 'PAWN_ADMIN' : userRole} // Pass exact role, logic handled in PawnshopManager
                            pawnItems={pawnItems}
                            setPawnItems={setPawnItems}
                        />
                    )}

                    {activeTab === 'structural' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white uppercase">Struktural & Detail Departemen</h3>
                                <div className="flex gap-2">
                                    <button onClick={addNewDept} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">+ Tambah Dept</button>
                                    <button onClick={handleSaveStructural} disabled={isSaving} className="bg-amber-500 text-slate-950 px-4 py-2 rounded text-xs font-bold uppercase">{isSaving ? 'Saving...' : 'Save Database'}</button>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {depts.map((dept, i) => (
                                    <div key={dept.id} className="bg-slate-900 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-amber-500 uppercase">{dept.name}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] text-slate-500">ID: {dept.id}</span>
                                                
                                                {deptIdToDelete === dept.id ? (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setDeptIdToDelete(null)} className="text-[8px] text-slate-500 uppercase">Batal</button>
                                                        <button onClick={() => deleteDept(dept.id)} className="text-[8px] text-red-500 font-bold uppercase animate-pulse">Hapus?</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDeptIdToDelete(dept.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* DEPARTMENT CARD SETTINGS */}
                                        <div className="space-y-3 mb-6 p-3 bg-slate-950/50 rounded-lg border border-white/5">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-500 uppercase">Judul Departemen</label>
                                                    <input 
                                                        type="text" 
                                                        value={dept.name} 
                                                        onChange={e => { const d = [...depts]; d[i].name = e.target.value; setDepts(d); }} 
                                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
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
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase">Deskripsi Lengkap (Detail)</label>
                                                <textarea 
                                                    value={dept.longDescription} 
                                                    onChange={e => { const d = [...depts]; d[i].longDescription = e.target.value; setDepts(d); }} 
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase">Image URL (Background)</label>
                                                <input 
                                                    type="text" 
                                                    value={dept.imageUrl} 
                                                    onChange={e => { const d = [...depts]; d[i].imageUrl = e.target.value; setDepts(d); }} 
                                                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-blue-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase">Staff Struktural</h5>
                                            <button 
                                                onClick={() => {
                                                    const d = [...depts];
                                                    d[i].structuralStaff.push({ role: 'Jabatan Baru', name: 'Nama Staff', level: 3 });
                                                    setDepts(d);
                                                }}
                                                className="text-[9px] font-bold text-amber-500 hover:text-white transition-colors"
                                            >
                                                + Tambah Staff
                                            </button>
                                        </div>
                                        {dept.structuralStaff.map((staff, j) => (
                                            <div key={j} className="flex gap-2 mb-2 items-center">
                                                <input type="text" value={staff.role} onChange={e => { const d = [...depts]; d[i].structuralStaff[j].role = e.target.value; setDepts(d); }} className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white" placeholder="Jabatan" />
                                                <input type="text" value={staff.name} onChange={e => { const d = [...depts]; d[i].structuralStaff[j].name = e.target.value; setDepts(d); }} className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white" placeholder="Nama IC" />
                                                
                                                {staffToDelete?.deptIdx === i && staffToDelete?.staffIdx === j ? (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setStaffToDelete(null)} className="text-[8px] text-slate-500 uppercase">Batal</button>
                                                        <button 
                                                            onClick={() => {
                                                                const d = [...depts];
                                                                d[i].structuralStaff.splice(j, 1);
                                                                setDepts(d);
                                                                setStaffToDelete(null);
                                                            }} 
                                                            className="text-[8px] text-red-500 font-bold uppercase animate-pulse"
                                                        >
                                                            Hapus?
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setStaffToDelete({ deptIdx: i, staffIdx: j })}
                                                        className="text-red-500 hover:text-white px-1"
                                                        title="Hapus Staff"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'salary' && <SalaryManager leadership={leadership} depts={depts} webhooks={webhooks} />}
                    
                    {/* PERMISSION CONFIG MANAGER */}
                    {activeTab === 'permission_mgmt' && <PermissionManager permissions={localPermissions} setPermissions={savePermissions} webhooks={webhooks} />}
                    
                    {/* WEBHOOK MANAGER */}
                    {activeTab === 'webhooks' && <WebhookManager />}

                    {/* KPI MANAGER */}
                    {activeTab === 'kpi_mgmt' && <KPIManager leadership={leadership} depts={depts} />}

                    {/* USER APPROVAL MANAGER */}
                    {activeTab === 'user_approval' && <UserApprovalManager />}
                </div>

                {/* TOAST NOTIFICATION */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${
                                toast.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'
                            }`}
                        >
                            <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LOADING OVERLAY */}
                {isSaving && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[210] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                            <p className="text-amber-500 font-bold text-[10px] tracking-widest uppercase animate-pulse">Menyimpan Perubahan...</p>
                        </div>
                    </div>
                )}
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsAdmin;
