import React from 'react';
import RegistrationForm from './RegistrationForm';
import { RecruitmentConfig } from '../types';

interface RecruitmentSceneProps {
  config: RecruitmentConfig;
  onBack: () => void;
}

const RecruitmentScene: React.FC<RecruitmentSceneProps> = ({ config, onBack }) => {
  return (
    <div className="min-h-screen pt-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-[-5px]"
        >
          ← Kembali ke Beranda
        </button>
      </div>
      <RegistrationForm config={config} />
    </div>
  );
};

export default RecruitmentScene;
