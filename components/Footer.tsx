
import React, { useState } from 'react';
import { AuthState } from '../types';

interface FooterProps {
  onLogin: (pin: string) => Promise<boolean>;
  onLogout: () => void;
  auth: AuthState;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  lastSyncTime?: string;
  onManualRefresh?: () => void;
  isSyncing?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onLogin, onLogout, auth, onPrivacyClick, onTermsClick, lastSyncTime, onManualRefresh, isSyncing }) => {
  const [pin, setPin] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const logoUrl = "https://blogger.googleusercontent.com/img/a/AVvXsEhzvSdkUPwo4gRLcVNJ96dqOYMJK2KndlS1XjV2ZOkV_F5x3H5yFZl8TQKJKSuGGODEyt676kxH6AsjMdXrxAfDEyFYPHqOWlPfh91-yfw0BpF5G2BFiL7yxvic4RwwQryScLaaTAr7fDBrsYK-gPYRpCStWd5gWsQLdV1hXuYXbDcxHbcUpRJhm4899joR";

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await onLogin(pin);
    setIsLoading(false);

    if (success) {
      setPin('');
      setShowLogin(false);
    } else {
      alert("PIN Salah atau Data Tidak Ditemukan!");
    }
  };

  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4 group">
              <img 
                src={logoUrl} 
                alt="Logo SA" 
                className="h-12 w-auto object-contain transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110"
              />
              <span className="text-sm md:text-lg font-serif font-bold italic text-white tracking-[0.2em] uppercase transition-colors group-hover:text-amber-500">
                PEMERINTAH <span className="text-amber-500 group-hover:text-white">SAN ANDREAS</span>
              </span>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-slate-500">© 2026 Cabang Eksekutif San Andreas. Seluruh hak cipta dilindungi melalui Protokol Otoritas Negara.</p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono">
                 Powered by <span className="font-bold text-amber-500/50">side.co</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <button 
                onClick={(e) => { e.preventDefault(); onPrivacyClick(); }}
                className="hover:text-amber-500 transition-all hover:scale-105 uppercase"
              >
                Kebijakan Privasi
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); onTermsClick(); }}
                className="hover:text-amber-500 transition-all hover:scale-105 uppercase"
              >
                Syarat & Ketentuan
              </button>
              {!auth.isAdmin ? (
                <button 
                  onClick={() => setShowLogin(!showLogin)}
                  className="hover:text-amber-500 transition-all hover:scale-105"
                >
                  Staff Access
                </button>
              ) : (
                <button 
                  onClick={onLogout}
                  className="text-amber-500 hover:text-amber-400 font-bold transition-all hover:scale-105"
                >
                  Logout ({auth.staffName})
                </button>
              )}
            </div>
            
            {/* SYNC INDICATOR */}
            {onManualRefresh && (
                <button 
                    onClick={onManualRefresh}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 mt-4 text-[9px] text-slate-600 bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:bg-white/10 hover:text-amber-500 transition-all active:scale-95 ${isSyncing ? 'border-amber-500/50 text-amber-500' : ''}`}
                    title="Paksa sinkronisasi data dari server"
                >
                    <span className={`text-xs ${isSyncing ? 'animate-spin' : ''}`}>🔄</span>
                    <span className={isSyncing ? 'animate-pulse' : ''}>
                        {isSyncing ? 'SYNCING DATABASE...' : `LIVE SYNC: ${lastSyncTime || 'Pending'}`}
                    </span>
                </button>
            )}
          </div>
        </div>

        {/* Login Form */}
        {showLogin && !auth.isAdmin && (
          <div className="max-w-xs mx-auto md:mx-0 p-4 bg-slate-900 rounded-xl border border-white/10 mb-4 animate-fade-in-up">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Portal Login Staff</h4>
            <form onSubmit={handleLoginSubmit} className="flex gap-2">
              <input 
                type="password" 
                placeholder="PIN Portal" 
                value={pin}
                onChange={e => setPin(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all"
              />
              <button 
                disabled={isLoading}
                className="bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded disabled:bg-slate-700 disabled:text-slate-400 transition-all hover:bg-amber-400 active:scale-95"
              >
                {isLoading ? '...' : 'MASUK'}
              </button>
            </form>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
