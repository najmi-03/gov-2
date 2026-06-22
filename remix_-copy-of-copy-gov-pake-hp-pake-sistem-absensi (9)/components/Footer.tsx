
import React, { useState } from 'react';
import { AuthState } from '../types';

interface FooterProps {
  onLogin: (nip: string, pin: string) => Promise<boolean>;
  onLogout: () => void;
  onSignup: (pin: string, icName: string, requestedRole: string, requestedDepartment: string) => Promise<{ success: boolean; error?: string }>;
  auth: AuthState;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onDonationClick?: () => void;
  lastSyncTime?: string;
  onManualRefresh?: () => void;
  isSyncing?: boolean;
}

const Footer: React.FC<FooterProps> = ({ onLogin, onLogout, onSignup, auth, onPrivacyClick, onTermsClick, onDonationClick, lastSyncTime, onManualRefresh, isSyncing }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupPin, setSignupPin] = useState('');
  const [signupIcName, setSignupIcName] = useState('');
  const [signupJabatan, setSignupJabatan] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
  const [availableJabatan, setAvailableJabatan] = useState<string[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  
  const logoUrl = "https://blogger.googleusercontent.com/img/a/AVvXsEhzvSdkUPwo4gRLcVNJ96dqOYMJK2KndlS1XjV2ZOkV_F5x3H5yFZl8TQKJKSuGGODEyt676kxH6AsjMdXrxAfDEyFYPHqOWlPfh91-yfw0BpF5G2BFiL7yxvic4RwwQryScLaaTAr7fDBrsYK-gPYRpCStWd5gWsQLdV1hXuYXbDcxHbcUpRJhm4899joR";

  // Fetch jabatan and departement when signup is shown
  React.useEffect(() => {
    if (showSignup) {
      Promise.all([
        fetch('/api/jabatan').then(res => res.ok ? res.json() : []),
        fetch('/api/departement').then(res => res.ok ? res.json() : [])
      ])
      .then(([jabatanData, deptData]) => {
        const jabatanList = Array.isArray(jabatanData) ? jabatanData : [];
        const deptList = Array.isArray(deptData) ? deptData : [];
        
        setAvailableJabatan(jabatanList);
        setAvailableDepartments(deptList);
        
        if (jabatanList.length > 0) setSignupJabatan(jabatanList[0]);
        if (deptList.length > 0) setSignupDepartment(deptList[0]);
      })
      .catch(err => {
        console.error("Failed to fetch signup data", err);
        setAvailableJabatan([]);
        setAvailableDepartments([]);
      });
    }
  }, [showSignup]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        const success = await onLogin(username, password);
        if (success) {
          setUsername('');
          setPassword('');
          setShowLogin(false);
        }
      } else {
        alert(data.error || "Username/Password Salah atau Data Tidak Ditemukan!");
      }
    } catch (error) {
      setIsLoading(false);
      alert("Gagal terhubung ke server.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupPin || !signupIcName || !signupJabatan || !signupDepartment) {
      alert("Harap isi semua bidang!");
      return;
    }
    setIsLoading(true);
    const result = await onSignup(signupPin, signupIcName, signupJabatan, signupDepartment);
    setIsLoading(false);

    if (result.success) {
      alert("Pendaftaran Berhasil! Akun Anda sedang menunggu persetujuan HRD.");
      setSignupPin('');
      setSignupIcName('');
      setShowSignup(false);
    } else {
      alert(result.error || "Gagal mendaftar.");
    }
  };

  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-transparent">
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
              {onDonationClick && (
                <button 
                  onClick={(e) => { e.preventDefault(); onDonationClick(); }}
                  className="hover:text-amber-500 transition-all hover:scale-105 uppercase text-amber-500/80"
                >
                  Dukung Developer
                </button>
              )}
              {!auth.isAdmin ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setShowSignup(true); setShowLogin(false); }}
                    className="hover:text-amber-500 transition-all hover:scale-105"
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => { setShowLogin(!showLogin); setShowSignup(false); }}
                    className="hover:text-amber-500 transition-all hover:scale-105"
                  >
                    Staff Access
                  </button>
                </div>
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
            <form onSubmit={handleLoginSubmit} className="space-y-2">
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
              />
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
                />
                <button 
                  disabled={isLoading}
                  className="bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded disabled:bg-slate-700 disabled:text-slate-400 transition-all hover:bg-amber-400 active:scale-95"
                >
                  {isLoading ? '...' : 'MASUK'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Signup Form */}
        {showSignup && !auth.isAdmin && (
          <div className="max-w-xs mx-auto md:mx-0 p-4 bg-slate-900 rounded-xl border border-white/10 mb-4 animate-fade-in-up">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Pendaftaran Akun Baru</h4>
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Nama Lengkap IC" 
                value={signupIcName}
                onChange={e => setSignupIcName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
              />
              <input 
                type="password" 
                placeholder="PIN / Password Baru" 
                value={signupPin}
                onChange={e => setSignupPin(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-xs outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase px-1">Departemen</label>
                  <select
                    value={signupDepartment}
                    onChange={e => setSignupDepartment(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-[10px] outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
                  >
                    {availableDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase px-1">Jabatan</label>
                  <select
                    value={signupJabatan}
                    onChange={e => setSignupJabatan(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-950 border border-white/5 rounded px-3 py-1.5 text-[10px] outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all text-white"
                  >
                    {availableJabatan.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="flex-1 text-slate-500 text-[10px] font-bold uppercase"
                >
                  Batal
                </button>
                <button 
                  disabled={isLoading}
                  className="flex-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded disabled:bg-slate-700 disabled:text-slate-400 transition-all hover:bg-amber-400 active:scale-95"
                >
                  {isLoading ? '...' : 'DAFTAR'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
