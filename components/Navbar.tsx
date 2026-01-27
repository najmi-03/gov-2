
import React, { useState } from 'react';

interface NavbarProps {
  onNavClick: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Departemen', id: 'departments' },
    { label: 'Struktural', id: 'structural' },
    { label: 'Informasi', id: 'information' },
    { label: 'Rekrutmen', id: 'recruitment' },
    { label: 'Asisten AI', id: 'assistant' }
  ];

  const logoUrl = "https://blogger.googleusercontent.com/img/a/AVvXsEhzvSdkUPwo4gRLcVNJ96dqOYMJK2KndlS1XjV2ZOkV_F5x3H5yFZl8TQKJKSuGGODEyt676kxH6AsjMdXrxAfDEyFYPHqOWlPfh91-yfw0BpF5G2BFiL7yxvic4RwwQryScLaaTAr7fDBrsYK-gPYRpCStWd5gWsQLdV1hXuYXbDcxHbcUpRJhm4899joR";

  const handleMobileNav = (id: string) => {
    onNavClick(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavClick('home')}>
            <img 
              src={logoUrl} 
              alt="Logo SA" 
              className="h-10 sm:h-14 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-transform hover:scale-105"
            />
            <span className="text-lg sm:text-xl font-serif font-bold tracking-tighter text-amber-500 hidden sm:block border-l border-white/10 pl-4 py-1">
              PORTAL <span className="text-white">PEMERINTAH</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className="text-sm font-medium text-slate-300 hover:text-amber-500 transition-colors uppercase tracking-widest"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNavClick('recruitment')}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-sm transition-all shadow-lg shadow-amber-500/20"
            >
              DAFTAR
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-500 p-2"
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
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNav(item.id)}
              className="block w-full text-left text-sm font-bold text-slate-300 hover:text-amber-500 transition-colors uppercase tracking-widest py-2"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleMobileNav('recruitment')}
            className="w-full py-3 bg-amber-500 text-slate-950 text-sm font-bold rounded-sm shadow-lg shadow-amber-500/20 uppercase tracking-widest"
          >
            DAFTAR SEKARANG
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
