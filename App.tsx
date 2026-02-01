
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
import CitizenIdentityForm from './components/CitizenIdentityForm'; 
import Footer from './components/Footer';
import NewsAdmin from './components/NewsAdmin';
import NewsDetail from './components/NewsDetail';
import PrivacyModal from './components/PrivacyModal';
import TermsModal from './components/TermsModal';
import FeedbackFloating from './components/FeedbackFloating';
import { DEPARTMENTS as INITIAL_DEPARTMENTS, NEWS as INITIAL_NEWS } from './constants';
import { DeptInfo, NewsItem, AuthState, LeadershipMember, LegislativeDocument } from './types';
import { motion } from 'framer-motion';
import { loginWithSpreadsheet } from './services/authService';

const INITIAL_LEADERSHIP: LeadershipMember[] = [
  { id: 'pres', role: 'Presiden San Andreas', name: 'His Excellency, Marcus Vane', icon: '👑', color: 'border-amber-500' },
  { id: 'vpres', role: 'Wakil Presiden', name: 'The Honorable, Sarah Jenkins', icon: '⚖️', color: 'border-amber-500/50' },
  { id: 'sec', role: 'Secretary of State', name: 'Dominic Sterling', icon: '🏢', color: 'border-blue-500' },
  { id: 'dsec', role: 'Deputy Secretary of State', name: 'Elara Vance', icon: '📝', color: 'border-blue-400' }
];

const INITIAL_DOCS: LegislativeDocument[] = [
  { id: 'doc1', title: 'Kode Etik Warga', icon: '📜', desc: 'Hukum dasar yang mengatur perilaku harian.', link: '#' },
  { id: 'doc2', title: 'Undang-Undang Bisnis', icon: '🏢', desc: 'Aturan untuk operasional komersial.', link: '#' },
  { id: 'doc3', title: 'Piagam Keamanan', icon: '👮', desc: 'Protokol tanggap darurat publik.', link: '#' },
  { id: 'doc4', title: 'Pedoman Perpajakan', icon: '📊', desc: 'Tarif saat ini dan tanggal pembayaran.', link: '#' },
];

const DEFAULT_TERMS = `1. PENDAHULUAN\nSetiap warga yang berinteraksi dengan layanan pemerintah San Andreas wajib mematuhi seluruh protokol yang ditetapkan oleh Kantor Kepresidenan dan Departemen terkait.\n\n2. KODE ETIK\nWarga diharapkan menjaga integritas dan ketertiban umum. Segala bentuk pelanggaran hukum akan diproses melalui sistem peradilan San Andreas yang berlaku.\n\n3. HAK DAN KEWAJIBAN\nPemerintah berhak mengubah regulasi tanpa pemberitahuan sebelumnya demi kepentingan stabilitas ekonomi dan keamanan negara.\n\n4. KERAHASIAAN\nSeluruh data yang dikirimkan melalui portal rekrutmen akan dikelola secara rahasia oleh Departemen Human Resource.`;

const DEFAULT_RECRUITMENT_LINK = "https://docs.google.com/forms/d/e/your-form-id/viewform";

const App: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [depts, setDepts] = useState<DeptInfo[]>(INITIAL_DEPARTMENTS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>(INITIAL_LEADERSHIP);
  const [legislativeDocs, setLegislativeDocs] = useState<LegislativeDocument[]>(INITIAL_DOCS);
  const [termsContent, setTermsContent] = useState<string>(DEFAULT_TERMS);
  const [recruitmentLink, setRecruitmentLink] = useState<string>(DEFAULT_RECRUITMENT_LINK);
  const [auth, setAuth] = useState<AuthState>({ isAdmin: false, staffName: null, role: 'NONE' });

  useEffect(() => {
    // Load local storage items
    const savedNews = localStorage.getItem('ls_gov_news');
    if (savedNews) setNews(JSON.parse(savedNews));
    else setNews(INITIAL_NEWS);

    const savedDepts = localStorage.getItem('ls_gov_depts');
    if (savedDepts) setDepts(JSON.parse(savedDepts));

    const savedLeadership = localStorage.getItem('ls_gov_leadership');
    if (savedLeadership) setLeadership(JSON.parse(savedLeadership));

    const savedDocs = localStorage.getItem('ls_gov_docs');
    if (savedDocs) setLegislativeDocs(JSON.parse(savedDocs));

    const savedTerms = localStorage.getItem('ls_gov_terms');
    if (savedTerms) setTermsContent(savedTerms);

    const savedRecruitmentLink = localStorage.getItem('ls_gov_recruitment_link');
    if (savedRecruitmentLink) setRecruitmentLink(savedRecruitmentLink);

    // Check auth session
    const savedAuth = sessionStorage.getItem('ls_gov_auth');
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }
  }, []);

  // Update handlers
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

  const updateDocs = (updatedDocs: LegislativeDocument[]) => {
    setLegislativeDocs(updatedDocs);
    localStorage.setItem('ls_gov_docs', JSON.stringify(updatedDocs));
  };

  const updateTerms = (content: string) => {
    setTermsContent(content);
    localStorage.setItem('ls_gov_terms', content);
  };

  const updateRecruitmentLink = (link: string) => {
    setRecruitmentLink(link);
    localStorage.setItem('ls_gov_recruitment_link', link);
  };

  // NEW LOGIN HANDLER
  const handleLogin = async (pin: string) => {
    // Call the new service that connects to Google Sheet
    const newAuth = await loginWithSpreadsheet(pin);

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
        <Hero 
          onApplyClick={() => scrollToSection('recruitment')} 
          onFormClick={() => scrollToSection('citizen-form')}
        />
        
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
          <PublicInfo newsData={news} docs={legislativeDocs} onNewsClick={setSelectedNews} />
        </div>

        <CitizenIdentityForm /> 
        
        <AIAssistant />
        <RegistrationForm googleFormUrl={recruitmentLink} />
      </main>

      <Footer 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        auth={auth} 
        onPrivacyClick={() => setShowPrivacy(true)}
        onTermsClick={() => setShowTerms(true)}
      />

      {/* Floating Feedback Button */}
      <FeedbackFloating auth={auth} />

      {auth.isAdmin && (
        <NewsAdmin 
          news={news} 
          setNews={updateNews} 
          userRole={auth.role} 
          staffName={auth.staffName}
          depts={depts}
          setDepts={updateDepts}
          leadership={leadership}
          setLeadership={updateLeadership}
          docs={legislativeDocs}
          setDocs={updateDocs}
          termsContent={termsContent}
          setTermsContent={updateTerms}
          recruitmentLink={recruitmentLink}
          setRecruitmentLink={updateRecruitmentLink}
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

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        content={termsContent}
      />
    </div>
  );
};

export default App;
