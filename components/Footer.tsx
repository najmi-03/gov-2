
import React, { useState } from 'react';
import { AuthState } from '../types';

interface FooterProps {
  onLogin: (pin: string) => Promise<boolean>;
  onLogout: () => void;
  auth: AuthState;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLogin, onLogout, auth, onPrivacyClick, onTermsClick }) => {
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
            <div className="flex items-center gap-4">
              <img 
                src={logoUrl} 
                alt="Logo SA" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-sm md:text-lg font-serif font-bold italic text-white tracking-[0.2em] uppercase">
                PEMERINTAH <span className="text-amber-500">SAN ANDREAS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">© 2026 Cabang Eksekutif San Andreas. Seluruh hak cipta dilindungi melalui Protokol Otoritas Negara.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <button 
                onClick={(e) => { e.preventDefault(); onPrivacyClick(); }}
                className="hover:text-amber-500 transition-colors uppercase"
              >
                Kebijakan Privasi
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); onTermsClick(); }}
                className="hover:text-amber-500 transition-colors uppercase"
              >
                Syarat & Ketentuan
              </button>
              {!auth.isAdmin ? (
                <button 
                  onClick={() => setShowLogin(!showLogin)}
                  className="hover:text-amber-500 transition-colors"
                >
                  Staff Access
                </button>
              ) : (
                <button 
                  onClick={onLogout}
                  className="text-amber-500 hover:text-amber-400 font-bold"
                >
                  Logout ({auth.staffName})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Login Form */}
        {showLogin && !auth.isAdmin && (
          <div className="max-w-xs mx-auto md:mx-0 p-4 bg-slate-900 rounded-xl border border-white/10 mb-4">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Portal Login Staff</h4>
            <form onSubmit={handleLoginSubmit} className="flex gap-2">
              <input 
                type="password" 
                placeholder="PIN Portal" 
                value={pin}
                onChange={e => setPin(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50"
              />
              <button 
                disabled={isLoading}
                className="bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded disabled:bg-slate-700 disabled:text-slate-400"
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
