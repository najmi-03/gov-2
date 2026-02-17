
import React, { useState } from 'react';
import { AuthState } from '../types';

interface NavbarProps {
  onNavClick: (section: string) => void;
  auth: AuthState;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, auth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseMenuItems = [
    { label: 'Departemen', id: 'departments' },
    { label: 'Struktural', id: 'structural' },
    { label: 'Layanan Form', id: 'citizen-form' },
    { label: 'Pasar Kota', id: 'pawnshop' }, // Added Menu Item
    { label: 'Informasi', id: 'information' },
    { label: 'Rekrutmen', id: 'recruitment' }
  ];

  // Only show Absensi if user is logged in as staff (isAdmin = true)
  const menuItems = auth.isAdmin 
    ? [...baseMenuItems, { label: 'Absensi', id: 'attendance' }]
    : baseMenuItems;

  const logoUrl = "https://blogger.googleusercontent.com/img/a/AVvXsEhzvSdkUPwo4gRLcVNJ96dqOYMJK2KndlS1XjV2ZOkV_F5x3H5yFZl8TQKJKSuGGODEyt676kxH6AsjMdXrxAfDEyFYPHqOWlPfh91-yfw0BpF5G2BFiL7yxvic4RwwQryScLaaTAr7fDBrsYK-gPYRpCStWd5gWsQLdV1hXuYXbDcxHbcUpRJhm4899joR";

  const handleMobileNav = (id: string) => {
    onNavClick(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => onNavClick('home')}>
            <img 
              src={logoUrl} 
              alt="Logo SA" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            />
            <span className="text-sm sm:text-base md:text-xl font-serif font-bold tracking-tighter text-amber-500 border-l border-white/10 pl-3 sm:pl-4 py-1 transition-colors group-hover:text-amber-400">
              PORTAL <span className="text-white group-hover:text-slate-200">PEMERINTAH</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`text-[11px] lg:text-sm font-medium transition-all duration-300 uppercase tracking-widest hover:scale-110 active:scale-95 ${item.id === 'attendance' ? 'text-amber-500 font-bold border-b border-amber-500/50' : 'text-slate-300 hover:text-amber-500'}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNavClick('recruitment')}
              className="px-4 lg:px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] lg:text-sm font-bold rounded shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-amber-500/40"
            >
              DAFTAR
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-500 p-2 focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-90"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 right-0 glass-effect border-b border-white/10 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[500px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}>
        <div className="px-6 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNav(item.id)}
              className="block w-full text-left text-xs font-bold text-slate-300 hover:text-amber-500 transition-all duration-300 uppercase tracking-widest py-3 border-b border-white/5 active:pl-2"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleMobileNav('recruitment')}
            className="w-full mt-4 py-4 bg-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 uppercase tracking-widest rounded-xl transition-all duration-300 hover:bg-amber-400 active:scale-95"
          >
            DAFTAR SEKARANG
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
