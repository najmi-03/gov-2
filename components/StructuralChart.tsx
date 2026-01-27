
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeptInfo, LeadershipMember } from '../types';

interface StructuralChartProps {
  depts: DeptInfo[];
  leadershipData: LeadershipMember[];
}

const StructuralChart: React.FC<StructuralChartProps> = ({ depts, leadershipData }) => {
  const [activeDept, setActiveDept] = useState<DeptInfo | null>(null);

  const renderIcon = (icon: string, className: string) => {
    const isImage = icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
    if (isImage) {
      return <img src={icon} alt="logo" className={`${className} object-contain mx-auto filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`} />;
    }
    return <span className={className}>{icon}</span>;
  };

  return (
    <section id="structural" className="py-24 px-4 bg-slate-950 relative overflow-hidden">
      {/* Visual Lines Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-px bg-amber-500/50 absolute left-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Struktural Organisasi</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Hierarki kepemimpinan eksekutif tertinggi yang mengarahkan visi strategis dan operasional negara.
          </p>
        </div>

        {/* Tier 1: President */}
        {leadershipData[0] && (
          <div className="flex justify-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-8 bg-slate-900/80 backdrop-blur border border-amber-500/20 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.05)] w-full max-w-md text-center`}
            >
              <span className="text-4xl mb-3 block">{leadershipData[0].icon}</span>
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">{leadershipData[0].role}</h3>
              <p className="text-2xl font-bold text-white uppercase tracking-tight">{leadershipData[0].name}</p>
            </motion.div>
          </div>
        )}

        {/* Vertical Connector Line */}
        <div className="flex justify-center mb-6">
           <div className="w-0.5 h-12 bg-amber-500/30"></div>
        </div>

        {/* Tier 2: Vice President */}
        {leadershipData[1] && (
          <div className="flex justify-center mb-10 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-md text-center relative z-20"
            >
              <span className="text-3xl text-amber-500 mb-4 block">{leadershipData[1].icon}</span>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{leadershipData[1].role}</h3>
              <p className="text-xl font-bold text-white uppercase tracking-wider">{leadershipData[1].name}</p>
            </motion.div>
            <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/10"></div>
          </div>
        )}

        {/* Tier 3: Secretary of State & Deputy */}
        <div className="flex flex-col items-center mb-24">
          {leadershipData[2] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-slate-900 border border-blue-500/20 rounded-xl shadow-xl w-full max-w-sm text-center mt-6"
            >
              <span className="text-2xl mb-2 block">{leadershipData[2].icon}</span>
              <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{leadershipData[2].role}</h3>
              <p className="text-lg font-bold text-white uppercase">{leadershipData[2].name}</p>
            </motion.div>
          )}
          
          <div className="w-0.5 h-6 bg-white/10"></div>
          
          {leadershipData[3] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-5 bg-slate-900/60 border border-blue-400/10 rounded-xl shadow-lg w-full max-w-xs text-center"
            >
              <h3 className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mb-1">{leadershipData[3].role}</h3>
              <p className="text-md font-bold text-slate-200 uppercase">{leadershipData[3].name}</p>
            </motion.div>
          )}

          {/* Line down to Cabinet */}
          <div className="w-0.5 h-12 bg-white/10 mt-6"></div>
          <div className="w-[80%] h-0.5 bg-white/10 hidden lg:block"></div>
        </div>

        {/* Tier 4: Department Heads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {depts.map((dept, idx) => {
            const head = dept.structuralStaff.find(s => s.level === 1);
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                onClick={() => setActiveDept(dept)}
                className="relative p-6 bg-[#0B0F1A] border border-white/5 rounded-2xl text-center group hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer overflow-hidden shadow-xl"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/10 hidden lg:block"></div>
                
                <div className="relative z-10">
                  <div className="h-8 mb-4">
                    {renderIcon(dept.icon, "text-2xl filter grayscale group-hover:grayscale-0 transition-all h-full")}
                  </div>
                  <h4 className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-1 opacity-80 group-hover:opacity-100">Kepala Departemen</h4>
                  <p className="text-[10px] font-bold text-white group-hover:text-amber-500 transition-colors uppercase leading-tight mb-2">
                    {head ? head.name : "Belum Ditentukan"}
                  </p>
                  <div className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">{dept.name}</div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/0 group-hover:bg-amber-500 transition-all"></div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Internal Structural Scene (Modal) */}
      <AnimatePresence>
        {activeDept && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveDept(null)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <button 
                onClick={() => setActiveDept(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-10">
                <div className="h-16 mb-4">
                   {renderIcon(activeDept.icon, "text-5xl h-full")}
                </div>
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] mb-2">Hierarki Internal</h3>
                <h2 className="text-3xl font-serif font-bold text-white">{activeDept.name}</h2>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto px-4 custom-scrollbar">
                {activeDept.structuralStaff.map((staff, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      staff.level === 1 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-widest ${
                        staff.level === 1 ? 'text-amber-500' : 'text-slate-500'
                      }`}>
                        {staff.role}
                      </h4>
                      <p className={`text-lg font-bold ${staff.level === 1 ? 'text-white' : 'text-slate-300'}`}>
                        {staff.name}
                      </p>
                    </div>
                    {staff.level === 1 && <span className="text-amber-500">⭐</span>}
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-slate-500 italic mb-6">
                  Seluruh penunjukan di atas telah divalidasi oleh Kantor Kepresidenan.
                </p>
                <button 
                  onClick={() => setActiveDept(null)}
                  className="px-10 py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition-all uppercase text-xs tracking-widest"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default StructuralChart;
