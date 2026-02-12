
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CityCarousel from './components/CityCarousel';
import DepartmentCard from './components/DepartmentCard';
import DepartmentDetail from './components/DepartmentDetail';
import RegistrationForm from './components/RegistrationForm';
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
import NewsArchive from './components/NewsArchive';
import { DEPARTMENTS as INITIAL_DEPARTMENTS, NEWS as INITIAL_NEWS, DEFAULT_FORMS, DEFAULT_RECRUITMENT_CONFIG, DEFAULT_PERMISSIONS } from './constants';
import { DeptInfo, NewsItem, AuthState, LeadershipMember, LegislativeDocument, FormConfig, RecruitmentConfig, PermissionConfig } from './types';
import { loginWithSpreadsheet } from './services/authService';
import { fetchFromDatabase } from './services/databaseService';

// Initialize default leadership data
const INITIAL_LEADERSHIP: LeadershipMember[] = [
  { id: 'pres', role: 'Presiden San Andreas', name: 'His Excellency, Marcus Vane', icon: '👑', color: 'border-amber-500' },
  { id: 'vpres', role: 'Wakil Presiden', name: 'The Honorable, Sarah Jenkins', icon: '⚖️', color: 'border-amber-500/50' },
  { id: 'sec', role: 'Secretary of State', name: 'Dominic Sterling', icon: '🏢', color: 'border-blue-500' },
  { id: 'dsec', role: 'Deputy Secretary of State', name: 'Elara Vance', icon: '📝', color: 'border-blue-400' }
];

// Initialize default legislative documents
const INITIAL_DOCS: LegislativeDocument[] = [
  { id: 'doc1', title: 'Kode Etik Warga', icon: '📜', desc: 'Hukum dasar yang mengatur perilaku harian.', link: '#' },
  { id: 'doc2', title: 'Undang-Undang Bisnis', icon: '🏢', desc: 'Aturan untuk operasional komersial.', link: '#' },
  { id: 'doc3', title: 'Piagam Keamanan', icon: '👮', desc: 'Protokol tanggap darurat publik.', link: '#' },
  { id: 'doc4', title: 'Pedoman Perpajakan', icon: '📊', desc: 'Tarif saat ini dan tanggal pembayaran.', link: '#' },
];

const DEFAULT_TERMS = `1. PENDAHULUAN
Setiap warga yang berinteraksi dengan layanan pemerintah San Andreas wajib mematuhi seluruh protokol yang ditetapkan oleh Kantor Kepresidenan dan Departemen terkait.

2. KODE ETIK
Warga diharapkan menjaga integritas dan ketertiban umum. Segala bentuk pelanggaran hukum akan diproses melalui sistem peradilan San Andreas yang berlaku.
`;

type ViewState = 'home' | 'structural' | 'pawnshop' | 'news_archive';

/**
 * Main App Component
 * Manages global state and coordinates navigation across the San Andreas Government portal.
 */
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [depts, setDepts] = useState<DeptInfo[]>(INITIAL_DEPARTMENTS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [leadership, setLeadership] = useState<LeadershipMember[]>(INITIAL_LEADERSHIP);
  const [docs, setDocs] = useState<LegislativeDocument[]>(INITIAL_DOCS);
  const [forms, setForms] = useState<FormConfig[]>(DEFAULT_FORMS);
  const [termsContent, setTermsContent] = useState(DEFAULT_TERMS);
  const [recruitmentConfig, setRecruitmentConfig] = useState<RecruitmentConfig>(DEFAULT_RECRUITMENT_CONFIG);
  const [permissionConfig, setPermissionConfig] = useState<PermissionConfig[]>(DEFAULT_PERMISSIONS);

  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [auth, setAuth] = useState<AuthState>({
    isAdmin: false,
    staffName: null,
    role: 'NONE'
  });

  const syncData = async () => {
    // 1. Departments
    const cloudDepts = await fetchFromDatabase('DEPTS');
    if (cloudDepts) setDepts(cloudDepts);

    // 2. News
    const cloudNews = await fetchFromDatabase('NEWS');
    if (cloudNews) setNews(cloudNews);

    // 3. Leadership
    const cloudLeadership = await fetchFromDatabase('LEADERSHIP');
    if (cloudLeadership) setLeadership(cloudLeadership);

    // 4. Docs
    const cloudDocs = await fetchFromDatabase('DOCS');
    if (cloudDocs) setDocs(cloudDocs);

    // 5. Forms
    const cloudForms = await fetchFromDatabase('FORMS');
    if (cloudForms) setForms(cloudForms);

    // 6. Terms
    const cloudTerms = await fetchFromDatabase('TERMS');
    if (cloudTerms) setTermsContent(cloudTerms);

    // 7. Recruitment (INI YANG PENTING AGAR SINGKRON)
    const cloudRecruitment = await fetchFromDatabase('RECRUITMENT');
    if (cloudRecruitment) setRecruitmentConfig(cloudRecruitment);

    // 8. Permissions (Agar portal izin staff singkron)
    const cloudPermissions = await fetchFromDatabase('PERMISSIONS');
    if (cloudPermissions) setPermissionConfig(cloudPermissions);
  };

  // Sync data with cloud database on initialization AND poll interval
  useEffect(() => {
    // Initial Load
    syncData();

    // Auto-refresh every 10 seconds to keep clients in sync
    const interval = setInterval(syncData, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (sectionId: string) => {
    // Handle Page Switching
    if (sectionId === 'structural') {
      setCurrentView('structural');
      window.scrollTo(0, 0);
      return;
    }
    
    if (sectionId === 'pawnshop') {
      setCurrentView('pawnshop');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'news_archive') {
      setCurrentView('news_archive');
      window.scrollTo(0, 0);
      return;
    }

    // Default to Home View for other sections
    if (currentView !== 'home') {
      setCurrentView('home');
      // Delay scroll to allow render
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo(0, 0);
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLogin = async (pin: string) => {
    const result = await loginWithSpreadsheet(pin);
    if (result) {
      setAuth(result);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ isAdmin: false, staffName: null, role: 'NONE' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar onNavClick={handleNavClick} />
      
      <main>
        {/* VIEW: HOME LANDING PAGE */}
        {currentView === 'home' && (
          <>
            <Hero 
              onApplyClick={() => handleNavClick('recruitment')} 
              onFormClick={() => handleNavClick('citizen-form')} 
            />

            <CityCarousel />

            <section id="departments" className="py-24 px-4 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Departemen Pemerintahan</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Pilar utama pelayanan publik yang berdedikasi membangun San Andreas.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {depts.map((dept, idx) => (
                  <DepartmentCard 
                    key={dept.id} 
                    dept={dept} 
                    index={idx} 
                    onClick={setSelectedDept} 
                  />
                ))}
              </div>
            </section>

            <CitizenIdentityForm forms={forms} />

            <PublicInfo 
              newsData={news} 
              docs={docs} 
              onNewsClick={setSelectedNews} 
              onArchiveClick={() => handleNavClick('news_archive')}
            />

            {/* Registration Form sekarang menerima CONFIG LANGSUNG DARI APP.TSX (DATABASE) */}
            <RegistrationForm config={recruitmentConfig} />
          </>
        )}

        {/* VIEW: STRUCTURAL PAGE */}
        {currentView === 'structural' && (
          <div className="min-h-screen pt-24 bg-slate-950">
             <StructuralChart 
                depts={depts} 
                leadershipData={leadership} 
             />
          </div>
        )}

        {/* VIEW: PAWNSHOP PAGE */}
        {currentView === 'pawnshop' && (
           <div className="min-h-screen pt-24 bg-slate-950">
              <PawnshopMarket />
           </div>
        )}

        {/* VIEW: NEWS ARCHIVE PAGE */}
        {currentView === 'news_archive' && (
           <NewsArchive 
             news={news}
             onNewsClick={setSelectedNews}
           />
        )}

      </main>

      <Footer 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        auth={auth} 
        onPrivacyClick={() => setIsPrivacyOpen(true)}
        onTermsClick={() => setIsTermsOpen(true)}
      />

      {/* Administration Dashboard for authenticated staff */}
      {/* SEMUA CONFIG DI-PASS KE SINI AGAR SAAT ADMIN UPDATE, DATABASE TERUPDATE */}
      {auth.isAdmin && (
        <NewsAdmin 
          news={news}
          setNews={setNews}
          userRole={auth.role}
          staffName={auth.staffName}
          depts={depts}
          setDepts={setDepts}
          leadership={leadership}
          setLeadership={setLeadership}
          docs={docs}
          setDocs={setDocs}
          termsContent={termsContent}
          setTermsContent={setTermsContent}
          forms={forms}
          setForms={setForms}
          recruitmentConfig={recruitmentConfig} // Pass current Config
          permissionConfig={permissionConfig}   // Pass current Permissions
        />
      )}

      {/* Modals and Overlays */}
      <DepartmentDetail 
        dept={selectedDept} 
        onClose={() => setSelectedDept(null)} 
        onApply={() => handleNavClick('recruitment')}
      />

      <NewsDetail 
        news={selectedNews} 
        onClose={() => setSelectedNews(null)} 
      />

      <PrivacyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />

      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        content={termsContent}
      />

      <FeedbackFloating auth={auth} />
    </div>
  );
};

export default App;
