
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CityCarousel from './components/CityCarousel';
import DepartmentCard from './components/DepartmentCard';
import DepartmentDetail from './components/DepartmentDetail';
import RegistrationForm from './components/RegistrationForm';
import AIAssistant from './components/AIAssistant';
import PublicInfo from './components/PublicInfo';
import PawnshopMarket from './components/PawnshopMarket';
import StructuralChart from './components/StructuralChart';
import Footer from './components/Footer';
import NewsAdmin from './components/NewsAdmin';
import NewsDetail from './components/NewsDetail';
import PrivacyModal from './components/PrivacyModal';
import { DEPARTMENTS as INITIAL_DEPARTMENTS, NEWS as INITIAL_NEWS } from './constants';
import { DeptInfo, NewsItem, AuthState, AdminRole, LeadershipMember } from './types';
import { motion } from 'framer-motion';

const INITIAL_LEADERSHIP: LeadershipMember[] = [
  { id: 'pres', role: 'Presiden San Andreas', name: 'His Excellency, Marcus Vane', icon: '👑', color: 'border-amber-500' },
  { id: 'vpres', role: 'Wakil Presiden', name: 'The Honorable, Sarah Jenkins', icon: '⚖️', color: 'border-amber-500/50' },
  { id: 'sec', role: 'Secretary of State', name: 'Dominic Sterling', icon: '🏢', color: 'border-blue-500' },
  { id: 'dsec', role: 'Deputy Secretary of State', name: 'Elara Vance', icon: '📝', color: 'border-blue-400' }
];

const App: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [depts, setDepts] = useState<DeptInfo[]>(INITIAL_DEPARTMENTS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>(INITIAL_LEADERSHIP);
  const [auth, setAuth] = useState<AuthState>({ isAdmin: false, staffName: null, role: 'NONE' });

  useEffect(() => {
    // Load news
    const savedNews = localStorage.getItem('ls_gov_news');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    } else {
      setNews(INITIAL_NEWS);
    }

    // Load Departments (Structural changes)
    const savedDepts = localStorage.getItem('ls_gov_depts');
    if (savedDepts) {
      setDepts(JSON.parse(savedDepts));
    }

    // Load Leadership
    const savedLeadership = localStorage.getItem('ls_gov_leadership');
    if (savedLeadership) {
      setLeadership(JSON.parse(savedLeadership));
    }

    // Check auth session
    const savedAuth = sessionStorage.getItem('ls_gov_auth');
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }
  }, []);

  const updateNews = (updatedNews: NewsItem[]) => {
    setNews(updatedNews);
    localStorage.setItem('ls_gov_news', JSON.stringify(updatedNews));
  };

  const updateDepts = (updatedDepts: DeptInfo[]) => {
    setDepts(updatedDepts);
    localStorage.setItem('ls_gov_depts', JSON.stringify(updatedDepts));
    window.dispatchEvent(new Event('dept_update'));
  };

  const updateLeadership = (updatedLeadership: LeadershipMember[]) => {
    setLeadership(updatedLeadership);
    localStorage.setItem('ls_gov_leadership', JSON.stringify(updatedLeadership));
  };

  const handleLogin = (pin: string) => {
    let newAuth: AuthState | null = null;

    if (pin === "NEWS789") {
      newAuth = { isAdmin: true, staffName: "Staff Humas", role: 'NEWS_ADMIN' };
    } else if (pin === "PAWN456") {
      newAuth = { isAdmin: true, staffName: "Staff Logistik", role: 'PAWN_ADMIN' };
    } else if (pin === "HR123") {
      newAuth = { isAdmin: true, staffName: "Staff HR", role: 'HR_ADMIN' };
    } else if (pin === "CASH999") {
      newAuth = { isAdmin: true, staffName: "Bendahara Negara", role: 'TREASURY_ADMIN' };
    }

    if (newAuth) {
      setAuth(newAuth);
      sessionStorage.setItem('ls_gov_auth', JSON.stringify(newAuth));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ isAdmin: false, staffName: null, role: 'NONE' });
    sessionStorage.removeItem('ls_gov_auth');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-amber-500/30">
      <Navbar onNavClick={scrollToSection} />
      
      <main>
        <Hero onApplyClick={() => scrollToSection('recruitment')} />
        
        <CityCarousel />
        
        <section id="departments" className="py-24 px-4 bg-slate-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                Layanan Publik Terpadu
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Pilar Pemerintahan</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Jelajahi berbagai departemen yang bekerja sinergis untuk kemajuan San Andreas.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {depts.map((dept, idx) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <DepartmentCard 
                    dept={dept} 
                    index={idx} 
                    onClick={setSelectedDept} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <StructuralChart depts={depts} leadershipData={leadership} />

        <PawnshopMarket />

        <div className="relative">
          <PublicInfo newsData={news} onNewsClick={setSelectedNews} />
        </div>
        
        <AIAssistant />
        <RegistrationForm />
      </main>

      <Footer 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        auth={auth} 
        onPrivacyClick={() => setShowPrivacy(true)}
      />

      {auth.isAdmin && (
        <NewsAdmin 
          news={news} 
          setNews={updateNews} 
          userRole={auth.role} 
          depts={depts}
          setDepts={updateDepts}
          leadership={leadership}
          setLeadership={updateLeadership}
        />
      )}

      <DepartmentDetail 
        dept={selectedDept} 
        onClose={() => setSelectedDept(null)} 
        onApply={() => scrollToSection('recruitment')}
      />

      <NewsDetail 
        news={selectedNews} 
        onClose={() => setSelectedNews(null)} 
      />

      <PrivacyModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
    </div>
  );
};

export default App;
