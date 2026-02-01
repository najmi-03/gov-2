
import React, { useState, useEffect } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, StaffMember, LegislativeDocument, FormConfig, FormField, RecruitmentConfig, PermissionConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCityNews } from '../services/geminiService';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';
import RecruitmentBuilder from './RecruitmentBuilder';
import PermissionManager from './PermissionManager';
import StaffPermissionPortal from './StaffPermissionPortal';
import SecretaryPortal from './SecretaryPortal';
import { DEFAULT_FORMS, DEFAULT_RECRUITMENT_CONFIG, DEFAULT_PERMISSIONS } from '../constants';

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
}

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, staffName, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent,
  recruitmentLink = "", setRecruitmentLink
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'form_mgmt' | 'recruitment' | 'permission_mgmt' | 'permission_portal' | 'secretary_portal' | 'feedback_config'>('news');
  
  // State untuk Dynamic Forms
  const [dynamicForms, setDynamicForms] = useState<FormConfig[]>(DEFAULT_FORMS);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // State untuk Recruitment & Permission Config
  const [recruitmentConfig, setRecruitmentConfig] = useState<RecruitmentConfig>(DEFAULT_RECRUITMENT_CONFIG);
  const [permissionConfig, setPermissionConfig] = useState<PermissionConfig[]>(DEFAULT_PERMISSIONS);

  // State untuk Feedback Config (Social Affairs)
  const [feedbackPublicUrl, setFeedbackPublicUrl] = useState('');
  const [feedbackStaffUrl, setFeedbackStaffUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('permission_portal'); 
      else if (userRole === 'TREASURY_ADMIN') setActiveTab('salary');
      else if (userRole === 'DHA_ADMIN') setActiveTab('form_mgmt');
      else if (userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') setActiveTab('secretary_portal');
      else if (userRole === 'NEWS_ADMIN') setActiveTab('news');
      else setActiveTab('permission_portal'); // Default
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    const savedForms = localStorage.getItem('ls_gov_dynamic_forms');
    if (savedForms) setDynamicForms(JSON.parse(savedForms));

    const savedRecruitment = localStorage.getItem('ls_gov_recruitment_config');
    if (savedRecruitment) setRecruitmentConfig(JSON.parse(savedRecruitment));
    
    // Load Feedback Webhooks
    setFeedbackPublicUrl(localStorage.getItem('ls_gov_feedback_public') || '');
    setFeedbackStaffUrl(localStorage.getItem('ls_gov_feedback_staff') || '');

  }, []);

  const saveDynamicForms = (updated: FormConfig[]) => {
    setDynamicForms(updated);
    localStorage.setItem('ls_gov_dynamic_forms', JSON.stringify(updated));
    window.dispatchEvent(new Event('forms_update'));
  };

  const saveRecruitmentConfig = (config: RecruitmentConfig) => {
    setRecruitmentConfig(config);
    localStorage.setItem('ls_gov_recruitment_config', JSON.stringify(config));
    alert("Konfigurasi Rekrutmen Berhasil Disimpan!");
    window.dispatchEvent(new Event('recruitment_update'));
  };

  const saveFeedbackConfig = () => {
    localStorage.setItem('ls_gov_feedback_public', feedbackPublicUrl);
    localStorage.setItem('ls_gov_feedback_staff', feedbackStaffUrl);
    alert("Konfigurasi Webhook Kritik & Saran tersimpan!");
  };

  const updateFormField = (formId: string, fieldId: string, label: string) => {
    const updated = dynamicForms.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          fields: f.fields.map(field => field.id === fieldId ? { ...field, label } : field)
        };
      }
      return f;
    });
    saveDynamicForms(updated);
  };

  const addFormField = (formId: string) => {
    const updated = dynamicForms.map(f => {
      if (f.id === formId) {
        const newField: FormField = {
          id: 'f' + Date.now(),
          label: 'Pertanyaan Baru',
          placeholder: 'Masukkan jawaban...',
          type: 'text',
          required: true
        };
        return { ...f, fields: [...f.fields, newField] };
      }
      return f;
    });
    saveDynamicForms(updated);
  };

  const removeFormField = (formId: string, fieldId: string) => {
    const updated = dynamicForms.map(f => {
      if (f.id === formId) {
        return { ...f, fields: f.fields.filter(field => field.id !== fieldId) };
      }
      return f;
    });
    saveDynamicForms(updated);
  };

  const getFormWebhook = (key: string) => {
    return localStorage.getItem(key) || '';
  };

  const setFormWebhook = (key: string, url: string) => {
    localStorage.setItem(key, url);
    setDynamicForms([...dynamicForms]); 
  };

  // Helper untuk Struktural
  const addDeptMember = (deptIndex: number) => {
    const updatedDepts = [...depts];
    updatedDepts[deptIndex].structuralStaff.push({
        role: 'Jabatan Baru',
        name: 'Nama Pejabat',
        level: 3
    });
    setDepts(updatedDepts);
    localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
  };

  const removeDeptMember = (deptIndex: number, staffIndex: number) => {
    if (window.confirm("Hapus anggota ini dari struktur?")) {
        const updatedDepts = [...depts];
        updatedDepts[deptIndex].structuralStaff.splice(staffIndex, 1);
        setDepts(updatedDepts);
        localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-amber-500 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full md:max-w-2xl lg:max-w-3xl h-full bg-slate-900 border-l border-white/10 shadow-2xl p-5 md:p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Panel Administrasi</h2>
                  <p className="text-[9px] md:text-[10px] text-amber-500 font-bold uppercase tracking-widest">Akses: {userRole} ({staffName || 'Unknown'})</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-white">✕</button>
              </div>

              <div className="flex border-b border-white/10 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {/* TAB UMUM UNTUK SEMUA STAFF (Kecuali Secretary of State) */}
                {userRole !== 'SECRETARY_OF_STATE' && (
                  <button onClick={() => setActiveTab('permission_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'permission_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Loket Izin</button>
                )}

                {/* TAB KHUSUS SEKRETARIAT */}
                {(userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') && (
                    <button onClick={() => setActiveTab('secretary_portal')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'secretary_portal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Sekretariat</button>
                )}

                {/* TAB SOCIAL AFFAIRS (BERITA & FEEDBACK) */}
                {userRole === 'NEWS_ADMIN' && (
                  <>
                    <button onClick={() => setActiveTab('news')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Berita Kota</button>
                    <button onClick={() => setActiveTab('feedback_config')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'feedback_config' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Kotak Saran</button>
                  </>
                )}
                
                {(userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF') && (
                  <button onClick={() => setActiveTab('inventory')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'inventory' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Logistik & Harga</button>
                )}

                {/* Tab Khusus HR Admin */}
                {userRole === 'HR_ADMIN' && (
                  <>
                     <button onClick={() => setActiveTab('recruitment')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'recruitment' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Manajemen Rekrutmen</button>
                     <button onClick={() => setActiveTab('permission_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'permission_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Setting Izin</button>
                     <button onClick={() => setActiveTab('structural')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'structural' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Struktural</button>
                  </>
                )}

                {userRole === 'TREASURY_ADMIN' && <button onClick={() => setActiveTab('salary')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'salary' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Penggajian</button>}
                
                {userRole === 'DHA_ADMIN' && (
                  <>
                    <button onClick={() => setActiveTab('form_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'form_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Manajemen Form</button>
                    <button onClick={() => setActiveTab('legislative')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Legislatif</button>
                  </>
                )}
                <button onClick={() => setActiveTab('terms')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'terms' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Syarat & Ketentuan</button>
              </div>

              {activeTab === 'permission_portal' ? (
                <StaffPermissionPortal permissions={permissionConfig} staffName={staffName || 'Staff'} />
              ) : activeTab === 'secretary_portal' && (userRole === 'SECRETARY_ADMIN' || userRole === 'SECRETARY_OF_STATE') ? (
                <SecretaryPortal staffName={staffName || 'Sekretaris'} role={userRole} />
              ) : activeTab === 'feedback_config' && userRole === 'NEWS_ADMIN' ? (
                <div className="space-y-6 pb-20">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
                      <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4">💬 Manajemen Kritik & Saran</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                          Atur kemana pesan dari tombol "Kotak Saran" akan dikirimkan. Pisahkan antara pesan warga dan staff.
                      </p>
                   </div>
                   
                   <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6">
                      <div className="space-y-2">
                          <label className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Webhook Kritik Warga (Publik)</label>
                          <input 
                              type="text" 
                              value={feedbackPublicUrl}
                              onChange={e => setFeedbackPublicUrl(e.target.value)}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none focus:border-green-500/50"
                          />
                          <p className="text-[9px] text-slate-500">Digunakan ketika pengirim <b>belum login</b>.</p>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Webhook Kritik Staff (Internal)</label>
                          <input 
                              type="text" 
                              value={feedbackStaffUrl}
                              onChange={e => setFeedbackStaffUrl(e.target.value)}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none focus:border-blue-500/50"
                          />
                          <p className="text-[9px] text-slate-500">Digunakan ketika pengirim <b>sudah login</b> sebagai staff.</p>
                      </div>

                      <button onClick={saveFeedbackConfig} className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-amber-400">
                          Simpan Konfigurasi
                      </button>
                   </div>
                </div>
              ) : activeTab === 'permission_mgmt' && userRole === 'HR_ADMIN' ? (
                <PermissionManager permissions={permissionConfig} setPermissions={setPermissionConfig} />
              ) : activeTab === 'news' && userRole === 'NEWS_ADMIN' ? (
                <div className="text-center py-20 text-slate-500">Fitur Berita (Kode disembunyikan untuk fokus update)</div>
              ) : activeTab === 'inventory' && (userRole === 'PAWN_ADMIN' || userRole === 'PAWN_STAFF') ? (
                <PawnshopManager staffName={staffName} userRole={userRole} />
              ) : activeTab === 'recruitment' && userRole === 'HR_ADMIN' ? (
                <RecruitmentBuilder config={recruitmentConfig} onSave={saveRecruitmentConfig} />
              ) : activeTab === 'structural' && userRole === 'HR_ADMIN' ? (
                <div className="space-y-8 pb-20">
                   <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
                      <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4">🏛️ Manajemen Struktural</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                          Ubah nama pejabat tinggi, kepala departemen, dan anggota struktural.
                      </p>
                   </div>

                   {/* Executive Leadership */}
                   <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Executive Office (Top Level)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {leadership.map((leader, idx) => (
                              <div key={leader.id} className="bg-slate-950 p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-3 mb-3">
                                      <span className="text-2xl">{leader.icon}</span>
                                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">{leader.role}</span>
                                  </div>
                                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nama Pejabat</label>
                                  <input 
                                      type="text" 
                                      value={leader.name}
                                      onChange={(e) => {
                                          const updated = [...leadership];
                                          updated[idx].name = e.target.value;
                                          setLeadership(updated);
                                          localStorage.setItem('ls_gov_leadership', JSON.stringify(updated));
                                      }}
                                      className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                                  />
                              </div>
                          ))}
                      </div>
                   </div>

                   {/* Departments */}
                   <div className="space-y-6">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Struktural Departemen</h4>
                       {depts.map((dept, deptIdx) => (
                           <div key={dept.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                               <div className="bg-white/5 p-4 flex items-center gap-3 border-b border-white/5">
                                   <img src={dept.icon.startsWith('http') ? dept.icon : ''} alt="" className="w-8 h-8 object-contain" />
                                   <h5 className="font-bold text-white text-sm uppercase">{dept.name}</h5>
                               </div>
                               <div className="p-4 md:p-6 space-y-4">
                                   {dept.structuralStaff.map((staff, staffIdx) => (
                                       <div key={staffIdx} className="flex gap-2 md:gap-4 items-center bg-slate-950 p-3 rounded-xl border border-white/5 relative group">
                                           <div className="w-10 flex flex-col items-center gap-1">
                                               <label className="text-[6px] font-bold text-slate-500 uppercase">LVL</label>
                                               <input 
                                                  type="number"
                                                  min="1" max="5"
                                                  value={staff.level}
                                                  onChange={(e) => {
                                                      const updatedDepts = [...depts];
                                                      updatedDepts[deptIdx].structuralStaff[staffIdx].level = parseInt(e.target.value) || 3;
                                                      setDepts(updatedDepts);
                                                      localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
                                                  }}
                                                  className="w-8 bg-slate-900 border border-white/10 rounded text-center text-xs text-amber-500 font-bold"
                                               />
                                           </div>
                                           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                                               <div>
                                                   <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Jabatan</label>
                                                   <input 
                                                      type="text" 
                                                      value={staff.role} 
                                                      onChange={(e) => {
                                                          const updatedDepts = [...depts];
                                                          updatedDepts[deptIdx].structuralStaff[staffIdx].role = e.target.value;
                                                          setDepts(updatedDepts);
                                                          localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
                                                      }}
                                                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
                                                   />
                                               </div>
                                               <div>
                                                   <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Nama Pejabat</label>
                                                   <input 
                                                      type="text" 
                                                      value={staff.name} 
                                                      onChange={(e) => {
                                                          const updatedDepts = [...depts];
                                                          updatedDepts[deptIdx].structuralStaff[staffIdx].name = e.target.value;
                                                          setDepts(updatedDepts);
                                                          localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
                                                      }}
                                                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
                                                   />
                                               </div>
                                           </div>
                                           <button 
                                              onClick={() => removeDeptMember(deptIdx, staffIdx)}
                                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                           >
                                              🗑️
                                           </button>
                                       </div>
                                   ))}
                                   
                                   <button 
                                      onClick={() => addDeptMember(deptIdx)}
                                      className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all"
                                   >
                                      + Tambah Anggota
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
              ) : activeTab === 'salary' && userRole === 'TREASURY_ADMIN' ? (
                <SalaryManager leadership={leadership} depts={depts} />
              ) : activeTab === 'form_mgmt' && userRole === 'DHA_ADMIN' ? (
                <div className="space-y-8 pb-20">
                   <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20">
                     <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">Pengaturan Layanan Form</h3>
                     <div className="grid grid-cols-1 gap-6">
                       {dynamicForms.map(form => (
                         <div key={form.id} className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold text-white flex items-center gap-2">
                               <span className="text-2xl">{form.icon}</span> {form.title}
                             </h4>
                             <button onClick={() => setEditingFormId(editingFormId === form.id ? null : form.id)} className="text-[9px] font-black text-amber-500 border border-amber-500/30 px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all">{editingFormId === form.id ? 'TUTUP' : 'KELOLA'}</button>
                           </div>
                           {editingFormId === form.id && (
                             <div className="space-y-6 mt-6 border-t border-white/5 pt-6">
                               <div className="p-4 bg-slate-900 rounded-xl border border-white/10">
                                 <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Discord Webhook Khusus ({form.title})</label>
                                 <input type="text" value={getFormWebhook(form.webhookKey)} onChange={e => setFormWebhook(form.webhookKey, e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white focus:border-blue-500/50 outline-none" />
                               </div>
                               <div className="space-y-4">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Daftar Pertanyaan</label>
                                 {form.fields.map((field, idx) => (
                                   <div key={field.id} className="flex gap-4 items-end bg-white/5 p-4 rounded-xl">
                                     <div className="flex-1 space-y-1">
                                       <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Pertanyaan #{idx + 1}</label>
                                       <input type="text" value={field.label} onChange={e => updateFormField(form.id, field.id, e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                                     </div>
                                     <button onClick={() => removeFormField(form.id, field.id)} className="bg-red-500/10 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">✕</button>
                                   </div>
                                 ))}
                                 <button onClick={() => addFormField(form.id)} className="w-full py-3 border-2 border-dashed border-white/10 text-[9px] font-black text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all rounded-xl uppercase tracking-widest">+ TAMBAH PERTANYAAN</button>
                               </div>
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              ) : activeTab === 'legislative' && userRole === 'DHA_ADMIN' ? (
                <LegislativeManager docs={docs} setDocs={setDocs} />
              ) : (
                <div className="text-center py-20 text-slate-500 uppercase tracking-widest text-xs">Akses Tab untuk mengelola data operasional.</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsAdmin;
