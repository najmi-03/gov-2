
import React, { useState } from 'react';
import { AuthState } from '../types';

interface NavbarProps {
  onNavClick: (section: string) => void;
  auth: AuthState;
}

type MenuItem = {
  label: string;
  id?: string;
  dropdown?: { label: string; id: string }[];
};

const Navbar: React.FC<NavbarProps> = ({ onNavClick, auth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const baseMenuItems: MenuItem[] = [
    { label: 'Departemen', id: 'departments' },
    { label: 'Layanan Form', id: 'citizen-form' },
    { label: 'Pasar Kota', id: 'pawnshop' },
    { 
      label: 'Informasi', 
      dropdown: [
        { label: 'Informasi Umum', id: 'information' },
        { label: 'Struktural', id: 'structural' },
        ...(auth.isLoggedIn ? [{ label: 'Loker Umum & Hitam', id: 'loker' }] : [])
      ]
    },
    { label: 'Dukung Dev', id: 'donation' }
  ];

  // Only show Absensi if user is logged in as staff (isAdmin = true)
  const menuItems = auth.isAdmin 
    ? [...baseMenuItems, { label: 'Absensi', id: 'attendance' }]
    : baseMenuItems;

  const logoUrl = "https://blogger.googleusercontent.com/img/a/AVvXsEhzvSdkUPwo4gRLcVNJ96dqOYMJK2KndlS1XjV2ZOkV_F5x3H5yFZl8TQKJKSuGGODEyt676kxH6AsjMdXrxAfDEyFYPHqOWlPfh91-yfw0BpF5G2BFiL7yxvic4RwwQryScLaaTAr7fDBrsYK-gPYRpCStWd5gWsQLdV1hXuYXbDcxHbcUpRJhm4899joR";

  const handleMobileNav = (id: string) => {
    onNavClick(id);
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(label);
    }
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
              item.dropdown ? (
                <div key={item.label} className="relative group">
                  <button className="text-[11px] lg:text-sm font-medium transition-all duration-300 uppercase tracking-widest text-slate-300 hover:text-amber-500 flex items-center gap-1 py-2">
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute left-0 top-full mt-0 w-48 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 transform translate-y-2 group-hover:translate-y-0">
                    {item.dropdown.map(drop => (
                      <button key={drop.id} onClick={() => onNavClick(drop.id)} className="text-left px-5 py-3 text-xs font-bold tracking-widest uppercase text-slate-300 hover:bg-white/5 hover:text-amber-500 transition-colors">
                        {drop.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id!)}
                  className={`text-[11px] lg:text-sm font-medium transition-all duration-300 uppercase tracking-widest hover:scale-110 active:scale-95 ${item.id === 'attendance' ? 'text-amber-500 font-bold border-b border-amber-500/50' : 'text-slate-300 hover:text-amber-500'}`}
                >
                  {item.label}
                </button>
              )
            ))}
            
            {/* DAFTAR Dropdown */}
            <div className="relative group">
              <button className="px-4 lg:px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] lg:text-sm font-bold rounded shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-amber-500/40 flex items-center gap-1">
                DAFTAR
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-md border border-amber-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 transform translate-y-2 group-hover:translate-y-0">
                <button onClick={() => onNavClick('recruitment')} className="text-left px-5 py-3 text-xs font-bold tracking-widest uppercase text-slate-300 hover:bg-amber-500/10 hover:text-amber-500 transition-colors">
                  Rekrutmen
                </button>
              </div>
            </div>

            {/* User Profile */}
            {auth.staffName && (
              <button 
                onClick={() => onNavClick('profile')}
                className="w-10 h-10 rounded-full border-2 border-amber-500/50 hover:border-amber-500 overflow-hidden transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center bg-slate-800"
              >
                {auth.avatar_url ? (
                  <img src={auth.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
            )}
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
      <div className={`md:hidden absolute top-full left-0 right-0 glass-effect border-b border-white/10 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[800px] py-6 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}>
        <div className="px-6 space-y-2">
          {menuItems.map((item) => (
            item.dropdown ? (
              <div key={item.label} className="border-b border-white/5 py-2">
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex justify-between items-center text-left text-xs font-bold text-slate-300 hover:text-amber-500 transition-all duration-300 uppercase tracking-widest py-2"
                >
                  {item.label}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180 text-amber-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${openDropdown === item.label ? 'max-h-60 mt-2' : 'max-h-0'}`}>
                  {item.dropdown.map(drop => (
                    <button
                      key={drop.id}
                      onClick={() => handleMobileNav(drop.id)}
                      className="block w-full text-left text-[11px] font-medium text-slate-400 hover:text-amber-400 transition-colors py-2 uppercase tracking-wider"
                    >
                      {drop.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => handleMobileNav(item.id!)}
                className="block w-full text-left text-xs font-bold text-slate-300 hover:text-amber-500 transition-all duration-300 uppercase tracking-widest py-3 border-b border-white/5 active:pl-2"
              >
                {item.label}
              </button>
            )
          ))}
          
          <div className="pt-4">
            <button
              onClick={() => toggleDropdown('DAFTAR')}
              className="w-full flex justify-between items-center bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black px-4 py-3 rounded-xl uppercase tracking-widest transition-all duration-300"
            >
              DAFTAR
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${openDropdown === 'DAFTAR' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`space-y-2 overflow-hidden transition-all duration-300 ${openDropdown === 'DAFTAR' ? 'max-h-40 mt-2' : 'max-h-0'}`}>
              <button
                onClick={() => handleMobileNav('recruitment')}
                className="block w-full text-center bg-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 uppercase tracking-widest rounded-xl transition-all duration-300 hover:bg-amber-400 active:scale-95 py-3"
              >
                REKRUTMEN
              </button>
            </div>
          </div>
          
          {/* User Profile Mobile */}
          {auth.staffName && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => handleMobileNav('profile')}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-amber-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 hover:bg-slate-700 active:scale-95 py-3 border border-amber-500/20"
              >
                {auth.avatar_url ? (
                  <img src={auth.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                PROFIL SAYA
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
