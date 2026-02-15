
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
import AttendancePage from './components/AttendancePage';
import { DEPARTMENTS as INITIAL_DEPARTMENTS, NEWS as INITIAL_NEWS, DEFAULT_FORMS, DEFAULT_RECRUITMENT_CONFIG, DEFAULT_PERMISSIONS } from './constants';
import { DeptInfo, NewsItem, AuthState, LeadershipMember, LegislativeDocument, FormConfig, RecruitmentConfig, PermissionConfig, CarouselItem } from './types';
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

// Placeholder awal (akan tertimpa database jika koneksi sukses)
const INITIAL_SLIDES: CarouselItem[] = [
  {
    id: 'slide_default',
    imageUrl: "https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I",
    title: "Sistem Sedang Memuat...",
    subtitle: "Menghubungkan ke Database Pusat San Andreas..."
  }
];

type ViewState = 'home' | 'structural' | 'pawnshop' | 'news_archive' | 'attendance';

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
  const [carouselSlides, setCarouselSlides] = useState<CarouselItem[]>(INITIAL_SLIDES); 

  const [selectedDept, setSelectedDept] = useState<DeptInfo | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [auth, setAuth] = useState<AuthState>({
    isAdmin: false,
    staffName: null,
    role: 'NONE'
  });

  // Fungsi Sinkronisasi Data (Dipisahkan agar bisa dipanggil ulang)
  const syncData = async (fullSync = false) => {
    setIsSyncing(true);
    
    // FETCH CAROUSEL INDEPENDENTLY (Priority)
    try {
      const cloudCarousel = await fetchFromDatabase('CAROUSEL');
      if (cloudCarousel && Array.isArray(cloudCarousel)) {
          console.log("Carousel Synced:", cloudCarousel.length, "items");
          setCarouselSlides(cloudCarousel);
      } else if (cloudCarousel && Array.isArray(cloudCarousel) && cloudCarousel.length === 0) {
          // If empty array returned, clear slides (User deleted all)
          setCarouselSlides([]);
      }
    } catch (e) {
      console.warn("Failed to sync carousel");
    }

    // FETCH NEWS INDEPENDENTLY
    try {
      const cloudNews = await fetchFromDatabase('NEWS');
      if (cloudNews && Array.isArray(cloudNews)) {
          setNews(cloudNews);
      }
    } catch (e) {
      console.warn("Failed to sync news");
    }

    // Prioritas 2: Full Sync (Hanya saat load pertama atau refresh manual)
    if (fullSync) {
        // Parallel fetch for other configs
        const results = await Promise.allSettled([
            fetchFromDatabase('DEPTS'),
            fetchFromDatabase('LEADERSHIP'),
            fetchFromDatabase('DOCS'),
            fetchFromDatabase('FORMS'),
            fetchFromDatabase('TERMS'),
            fetchFromDatabase('RECRUITMENT'),
            fetchFromDatabase('PERMISSIONS')
        ]);

        if (results[0].status === 'fulfilled' && results[0].value) setDepts(results[0].value);
        if (results[1].status === 'fulfilled' && results[1].value) setLeadership(results[1].value);
        if (results[2].status === 'fulfilled' && results[2].value) setDocs(results[2].value);
        if (results[3].status === 'fulfilled' && results[3].value) setForms(results[3].value);
        if (results[4].status === 'fulfilled' && results[4].value) setTermsContent(results[4].value);
        if (results[5].status === 'fulfilled' && results[5].value) setRecruitmentConfig(results[5].value);
        if (results[6].status === 'fulfilled' && results[6].value) setPermissionConfig(results[6].value);
    }

    setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    setIsSyncing(false);
  };

  // Sync data on initialization AND Setup Interval Polling
  useEffect(() => {
    // 1. Initial Load (Full Data)
    syncData(true);

    // 2. Setup Interval Polling (Real-time Simulation)
    // Cek update lebih cepat (setiap 5 detik) agar terasa real-time
    const intervalId = setInterval(() => {
        // Silent sync (background update)
        syncData(false); 
    }, 5000); // 5 Detik

    return () => clearInterval(intervalId);
  }, []);

  const handleManualRefresh = () => {
      syncData(true);
  };

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

    if (sectionId === 'attendance') {
      setCurrentView('attendance');
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
      {/* Jika di halaman Absensi, tampilkan overlay full screen, sembunyikan navigasi utama */}
      {currentView === 'attendance' ? (
        <AttendancePage onBack={() => handleNavClick('home')} auth={auth} />
      ) : (
        <>
          <Navbar onNavClick={handleNavClick} auth={auth} />
          
          <main>
            {/* VIEW: HOME LANDING PAGE */}
            {currentView === 'home' && (
              <>
                <Hero 
                  onApplyClick={() => handleNavClick('recruitment')} 
                  onFormClick={() => handleNavClick('citizen-form')} 
                />

                <CityCarousel slides={carouselSlides} />

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
            lastSyncTime={lastSyncTime}
            onManualRefresh={handleManualRefresh}
            isSyncing={isSyncing}
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
              recruitmentConfig={recruitmentConfig} 
              permissionConfig={permissionConfig}   
              carouselSlides={carouselSlides} // PASS TO ADMIN
              setCarouselSlides={setCarouselSlides} // PASS TO ADMIN
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
        </>
      )}
    </div>
  );
};

export default App;
