
import React, { useState, useEffect } from 'react';
import { NewsItem, AdminRole, DeptInfo, LeadershipMember, StaffMember, LegislativeDocument, FormConfig, FormField } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCityNews } from '../services/geminiService';
import PawnshopManager from './PawnshopManager';
import SalaryManager from './SalaryManager';
import LegislativeManager from './LegislativeManager';
import { DEFAULT_FORMS } from '../constants';

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
  recruitmentLink?: string;
  setRecruitmentLink?: (link: string) => void;
}

const NewsAdmin: React.FC<NewsAdminProps> = ({ 
  news, setNews, userRole, depts, setDepts, leadership, setLeadership, docs, setDocs, termsContent, setTermsContent,
  recruitmentLink = "", setRecruitmentLink
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'inventory' | 'structural' | 'salary' | 'legislative' | 'terms' | 'depts' | 'citizen' | 'form_mgmt'>('news');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State untuk Dynamic Forms
  const [dynamicForms, setDynamicForms] = useState<FormConfig[]>(DEFAULT_FORMS);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (userRole === 'PAWN_ADMIN') setActiveTab('inventory');
      else if (userRole === 'HR_ADMIN') setActiveTab('structural');
      else if (userRole === 'TREASURY_ADMIN') setActiveTab('salary');
      else if (userRole === 'DHA_ADMIN') setActiveTab('form_mgmt'); 
      else setActiveTab('news');
    }
  }, [isOpen, userRole]);

  useEffect(() => {
    const savedForms = localStorage.getItem('ls_gov_dynamic_forms');
    if (savedForms) setDynamicForms(JSON.parse(savedForms));
  }, []);

  const saveDynamicForms = (updated: FormConfig[]) => {
    setDynamicForms(updated);
    localStorage.setItem('ls_gov_dynamic_forms', JSON.stringify(updated));
    window.dispatchEvent(new Event('forms_update'));
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

  // FUNGSI UNTUK MENGAMBIL WEBHOOK DARI STORAGE BERDASARKAN KUNCI FORM
  const getFormWebhook = (key: string) => {
    return localStorage.getItem(key) || '';
  };

  // FUNGSI UNTUK MENYIMPAN WEBHOOK SPESIFIK FORM
  const setFormWebhook = (key: string, url: string) => {
    localStorage.setItem(key, url);
    // Kita perlu trigger re-render manual karena localStorage bukan state reaktif
    setDynamicForms([...dynamicForms]); 
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
              className="relative w-full md:max-w-2xl lg:max-w-3xl h-full bg-slate-900 border-l border-white/10 shadow-2xl p-5 md:p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Panel Administrasi</h2>
                  <p className="text-[9px] md:text-[10px] text-amber-500 font-bold uppercase tracking-widest">Akses: {userRole}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-slate-500 hover:text-white">✕</button>
              </div>

              <div className="flex border-b border-white/10 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {userRole === 'DHA_ADMIN' && (
                  <>
                    <button onClick={() => setActiveTab('form_mgmt')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'form_mgmt' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Manajemen Form & Webhook</button>
                    <button onClick={() => setActiveTab('legislative')} className={`flex-shrink-0 px-4 py-3 text-[9px] font-bold tracking-widest uppercase ${activeTab === 'legislative' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}>Legislatif</button>
                  </>
                )}
              </div>

              {activeTab === 'form_mgmt' && userRole === 'DHA_ADMIN' ? (
                <div className="space-y-8 pb-20">
                   <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20">
                     <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">Pengaturan Layanan Form</h3>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">Kelola pertanyaan and tujuan Discord Webhook untuk setiap layanan secara individu.</p>
                     
                     <div className="grid grid-cols-1 gap-6">
                       {dynamicForms.map(form => (
                         <div key={form.id} className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="font-bold text-white flex items-center gap-2">
                               <span className="text-2xl">{form.icon}</span> {form.title}
                             </h4>
                             <button 
                               onClick={() => setEditingFormId(editingFormId === form.id ? null : form.id)}
                               className="text-[9px] font-black text-amber-500 border border-amber-500/30 px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all"
                             >
                               {editingFormId === form.id ? 'TUTUP' : 'KELOLA'}
                             </button>
                           </div>

                           {editingFormId === form.id && (
                             <div className="space-y-6 mt-6 border-t border-white/5 pt-6">
                               {/* SETTING WEBHOOK PER CARD */}
                               <div className="p-4 bg-slate-900 rounded-xl border border-white/10">
                                 <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Discord Webhook Khusus ({form.title})</label>
                                 <input 
                                   type="text" 
                                   value={getFormWebhook(form.webhookKey)}
                                   onChange={e => setFormWebhook(form.webhookKey, e.target.value)}
                                   placeholder="https://discord.com/api/webhooks/..."
                                   className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white focus:border-blue-500/50 outline-none"
                                 />
                                 <p className="text-[8px] text-slate-500 mt-2 uppercase italic tracking-widest">Pesan untuk layanan ini akan dikirim ke channel di atas.</p>
                               </div>

                               <div className="space-y-4">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Daftar Pertanyaan</label>
                                 {form.fields.map((field, idx) => (
                                   <div key={field.id} className="flex gap-4 items-end bg-white/5 p-4 rounded-xl">
                                     <div className="flex-1 space-y-1">
                                       <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Pertanyaan #{idx + 1}</label>
                                       <input 
                                         type="text" 
                                         value={field.label}
                                         onChange={e => updateFormField(form.id, field.id, e.target.value)}
                                         className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                                       />
                                     </div>
                                     <button 
                                       onClick={() => removeFormField(form.id, field.id)}
                                       className="bg-red-500/10 text-red-500 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                     >
                                       ✕
                                     </button>
                                   </div>
                                 ))}
                                 <button 
                                   onClick={() => addFormField(form.id)}
                                   className="w-full py-3 border-2 border-dashed border-white/10 text-[9px] font-black text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-all rounded-xl uppercase tracking-widest"
                                 >
                                   + TAMBAH PERTANYAAN
                                 </button>
                               </div>
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              ) : activeTab === 'legislative' && userRole === 'DHA_ADMIN' ? (
                <div className="pb-20">
                  <LegislativeManager docs={docs} setDocs={setDocs} />
                </div>
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
