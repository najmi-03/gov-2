import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DeptInfo } from '../types';
import { ArrowLeft, CheckCircle2, ChevronRight, ShieldCheck, Activity } from 'lucide-react';

interface DepartmentPageProps {
  depts: DeptInfo[];
}

const createSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

const DepartmentPage: React.FC<DepartmentPageProps> = ({ depts }) => {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();

  const dept = useMemo(() => {
    // Try finding by slug first, then by actual ID from database
    return depts.find(d => createSlug(d.name as string) === deptId || d.id === deptId);
  }, [deptId, depts]);

  if (!dept) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white mb-4">Departemen Tidak Ditemukan</h2>
        <button onClick={() => navigate('/departments')} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors">Kembali ke Daftar Departemen</button>
      </div>
    );
  }

  const isImageIcon = dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/') || dept.icon.includes('.'));

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img 
          src={dept.imageUrl} 
          alt={dept.name as string} 
          className="w-full h-full object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
            <button 
              onClick={() => navigate('/departments')}
              className="mb-8 flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              {isImageIcon ? (
                <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                   <img src={dept.icon} alt="logo" className="w-full h-full object-contain filter drop-shadow-xl" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 bg-slate-900/50 flex items-center justify-center rounded-2xl border border-white/10 backdrop-blur-md text-5xl md:text-6xl">
                  {dept.icon}
                </div>
              )}
              
              <div className="flex-grow">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-tight mb-4">{dept.name}</h1>
                <p className="text-xl md:text-2xl font-light text-slate-300 italic max-w-3xl">"{dept.vision}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          <div className="lg:col-span-2 space-y-16">
            <section>
              <div className="inline-block px-4 py-1.5 mb-6 border border-amber-500/30 bg-amber-500/10 rounded-full">
                <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Gambaran Umum</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg md:text-xl font-light">
                {dept.longDescription}
              </p>
            </section>

            <section>
               <div className="inline-block px-4 py-1.5 mb-6 border border-amber-500/30 bg-amber-500/10 rounded-full">
                <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">Tanggung Jawab Utama</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(dept.responsibilities && dept.responsibilities.filter(r => typeof r === 'string' && r.trim()).length > 0 ? dept.responsibilities.filter(r => typeof r === 'string' && r.trim()) : [
                  'Melaksanakan tugas kepemerintahan sesuai dengan standar operasional prosedur.',
                  'Memberikan pelayanan publik yang prima dan profesional.',
                  'Menjaga integritas dan nama baik departemen.'
                ]).map((r, i) => (
                  <div key={i} className="flex items-start gap-4 bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
                    <ChevronRight className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </span>
                Kualifikasi Rekrutmen
              </h3>
              <ul className="space-y-4">
                {(dept.requirements && dept.requirements.filter(r => typeof r === 'string' && r.trim()).length > 0 ? dept.requirements.filter(r => typeof r === 'string' && r.trim()) : [
                  'Warga Negara San Andreas yang sah.',
                  'Tidak memiliki catatan kriminal berat (Felony).',
                  'Sehat jasmani dan rohani.',
                  'Mampu bekerja dalam tim dan di bawah tekanan.'
                ]).map((r, i) => (
                  <li key={i} className="flex gap-3 text-slate-300 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/RECUITMENT')}
                className="w-full mt-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 text-xs uppercase tracking-widest"
              >
                DAFTAR SEKARANG
              </button>
            </div>

            {dept.structuralStaff && dept.structuralStaff.length > 0 && (
              <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8">
                 <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6">Jajaran Pimpinan</h3>
                 <div className="space-y-5">
                   {dept.structuralStaff.map((staff, idx) => (
                     <div key={idx} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/10 font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold">{staff.name}</p>
                          <p className="text-xs text-slate-500">{staff.role}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {((dept.name as string).toLowerCase().includes('health') || dept.id === 'health' || dept.id === 'health_services') && (
        <div className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="mb-10">
            <span className="inline-block px-4 py-1.5 border border-amber-500/30 bg-amber-500/10 rounded-full text-amber-500 text-[10px] font-black tracking-widest uppercase mb-4">
              Layanan Terpadu
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Portal Layanan Kesehatan</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Akses cepat menuju sistem informasi dan portal layanan terpadu Departemen Kesehatan San Andreas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => navigate('/departments/health/bpom')}
              className="group relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-3xl p-8 text-center hover:border-blue-500/50 hover:bg-slate-900 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col items-center justify-center min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-4">Status BPOM</h4>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10 mb-8 max-w-[250px]">
                Cek status perizinan dan keamanan produk makanan dan obat-obatan.
              </p>
              <div className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors w-full">
                CEK DATA BPOM
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/departments/health/doctor-certs')}
              className="group relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-3xl p-8 text-center hover:border-emerald-500/50 hover:bg-slate-900 transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
              <h4 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">Sertifikasi Dokter</h4>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10 mb-8 max-w-[250px]">
                Validasi Surat Izin Praktik (SIP) tenaga medis terdaftar San Andreas.
              </p>
              <div className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors w-full">
                VERIFIKASI SIP
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
