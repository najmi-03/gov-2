
import React from 'react';
import { DeptInfo } from '../types';
import { motion } from 'framer-motion';

interface DepartmentCardProps {
  dept: DeptInfo;
  onClick: (dept: DeptInfo) => void;
  index: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ dept, onClick, index }) => {
  const isImageIcon = dept.icon && (dept.icon.startsWith('http') || dept.icon.startsWith('/') || dept.icon.includes('.'));

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(dept)}
      className="group relative bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={dept.imageUrl} 
          alt={dept.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {isImageIcon ? (
              <img src={dept.icon} alt="icon" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            ) : (
              <span className="text-3xl">{dept.icon}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
            {dept.name}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
          {dept.shortDescription}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Detail & Struktural</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;
