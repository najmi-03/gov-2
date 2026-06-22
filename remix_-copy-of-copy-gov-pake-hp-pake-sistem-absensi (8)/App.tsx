
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CityCarousel from './components/CityCarousel';
import DepartmentCard from './components/DepartmentCard';
import DepartmentPage from './components/DepartmentPage';
import BpomStatusPage from './components/BpomStatusPage';
import DoctorCertPage from './components/DoctorCertPage';
import RegistrationForm from './components/RegistrationForm';
import RecruitmentScene from './components/RecruitmentScene';
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
import DonationPage from './components/DonationPage';
import ParticlesBackground from './components/ParticlesBackground';
import PublicInventory from './components/PublicInventory';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DEPARTMENTS as INITIAL_DEPARTMENTS, NEWS as INITIAL_NEWS, DEFAULT_FORMS, DEFAULT_RECRUITMENT_CONFIG, DEFAULT_PERMISSIONS } from './constants';
import { DeptInfo, NewsItem, AuthState, LeadershipMember, LegislativeDocument, FormConfig, RecruitmentConfig, PermissionConfig, CarouselItem, PawnItem } from './types';
import { loginWithSpreadsheet, signupUser } from './services/authService';
import { fetchFromDatabase } from './services/databaseService';
import { INITIAL_PAWN_DATA } from './constants';

// Initialize default leadership data
const INITIAL_LEADERSHIP: LeadershipMember[] = [
  { id: 'pres', role: 'Presiden San Andreas', name: 'His Excellency, Marcus Vane', icon: '👑', color: 'border-amber-500' },
  { id: 'vpres', role: 'Wakil Presiden', name: 'The Honorable, Sarah Jenkins', icon: '⚖️', color: 'border-amber-500/50' },
  { id: 'sec', role: 'Secretary of State', name: 'Dominic Sterling', icon: '🏢', color: 'border-blue-500' },
  { id: 'dsec', role: 'Deputy Secretary of State', name: 'Elara Vance', icon: '📝', color: 'border-blue-400' },
  { id: 'hr', role: 'Human Resources Director', name: 'Katherine Pierce', icon: '👥', color: 'border-emerald-500' }
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

type ViewState = 'home' | 'structural' | 'pawnshop' | 'loker' | 'news_archive' | 'attendance' | 'donation' | 'recruitment';

/**
 * Main App Component
 * Manages global state and coordinates navigation across the San Andreas Government portal.
 */
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [depts, setDepts] = useState<DeptInfo[]>(INITIAL_DEPARTMENTS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [leadership, setLeadership] = useState<LeadershipMember[]>(INITIAL_LEADERSHIP);
  const [docs, setDocs] = useState<LegislativeDocument[]>(INITIAL_DOCS);
  const [forms, setForms] = useState<FormConfig[]>(DEFAULT_FORMS);
  const [termsContent, setTermsContent] = useState(DEFAULT_TERMS);
  const [recruitmentConfig, setRecruitmentConfig] = useState<RecruitmentConfig>(DEFAULT_RECRUITMENT_CONFIG);
  const [permissionConfig, setPermissionConfig] = useState<PermissionConfig[]>(DEFAULT_PERMISSIONS);
  const [carouselSlides, setCarouselSlides] = useState<CarouselItem[]>(INITIAL_SLIDES); 
  const [pawnItems, setPawnItems] = useState<PawnItem[]>(INITIAL_PAWN_DATA);
  const [webhooks, setWebhooks] = useState<Record<string, string>>({});

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

    // FETCH PAWN INDEPENDENTLY
    try {
      const cloudPawn = await fetchFromDatabase('PAWN');
      if (cloudPawn && Array.isArray(cloudPawn)) {
          setPawnItems(cloudPawn);
          // Update localStorage for components that still use it
          localStorage.setItem('ls_gov_pawn_market', JSON.stringify(cloudPawn));
      }
    } catch (e) {
      console.warn("Failed to sync pawn data");
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
            fetchFromDatabase('PERMISSIONS'),
            fetchFromDatabase('WEBHOOKS')
        ]);

        if (results[0].status === 'fulfilled' && results[0].value) setDepts(results[0].value);
        if (results[1].status === 'fulfilled' && results[1].value) setLeadership(results[1].value);
        if (results[2].status === 'fulfilled' && results[2].value) setDocs(results[2].value);
        if (results[3].status === 'fulfilled' && results[3].value) setForms(results[3].value);
        if (results[4].status === 'fulfilled' && results[4].value) setTermsContent(results[4].value);
        if (results[5].status === 'fulfilled' && results[5].value) setRecruitmentConfig(results[5].value);
        if (results[6].status === 'fulfilled' && results[6].value) setPermissionConfig(results[6].value);
        if (results[7].status === 'fulfilled' && results[7].value) setWebhooks(results[7].value);
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
      navigate('/structural');
      window.scrollTo(0, 0);
      return;
    }
    
    if (sectionId === 'pawnshop') {
      navigate('/pawnshop');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'loker') {
      navigate('/loker');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'news_archive') {
      navigate('/news_archive');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'attendance') {
      navigate('/attendance');
      return;
    }

    if (sectionId === 'citizen-form') {
      navigate('/layanan-form');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'donation') {
      navigate('/donation');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'recruitment') {
      navigate('/RECUITMENT');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'departments') {
      navigate('/departments');
      window.scrollTo(0, 0);
      return;
    }

    if (sectionId === 'information') {
      navigate('/information');
      window.scrollTo(0, 0);
      return;
    }

    // Default to Home View for other sections
    if (location.pathname !== '/') {
      navigate('/');
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

  const handleLogin = async (username: string, password: string) => {
    const result = await loginWithSpreadsheet(username, password);
    if (result) {
      setAuth(result);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ isAdmin: false, staffName: null, role: 'NONE' });
  };

  const handleSignup = async (pin: string, icName: string, requestedRole: string, requestedDepartment: string) => {
    return await signupUser(pin, icName, requestedRole, requestedDepartment);
  };

  return (
    <div className="min-h-screen text-slate-200 relative">
      <ParticlesBackground />
      <Routes>
        <Route path="/attendance" element={<AttendancePage onBack={() => handleNavClick('home')} auth={auth} />} />
        <Route path="*" element={
          <>
            <Navbar onNavClick={handleNavClick} auth={auth} />
            
            <main>
              <Routes>
                <Route path="/" element={
                  <Hero 
                    onApplyClick={() => handleNavClick('recruitment')} 
                    onFormClick={() => handleNavClick('citizen-form')} 
                  />
                } />

                <Route path="/departments" element={
                  <div className="pt-24 bg-transparent min-h-screen">
                    <section id="departments" className="pb-24 pt-12 px-4 max-w-7xl mx-auto">
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
                            onClick={(d) => {
                              const slug = (d.name as string).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                              navigate(`/departments/${slug}`);
                              window.scrollTo(0, 0);
                            }} 
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                } />

                <Route path="/departments/health/bpom" element={<BpomStatusPage />} />
                <Route path="/departments/health/doctor-certs" element={<DoctorCertPage />} />
                <Route path="/departments/:deptId" element={<DepartmentPage depts={depts} />} />

                <Route path="/information" element={
                  <div className="pt-24 bg-transparent min-h-screen">
                    <CityCarousel slides={carouselSlides} />
                    <PublicInfo 
                      newsData={news} 
                      docs={docs} 
                      onNewsClick={setSelectedNews} 
                      onArchiveClick={() => handleNavClick('news_archive')}
                    />
                  </div>
                } />

                <Route path="/layanan-form" element={
                  <div className="min-h-screen pt-24 bg-transparent pb-12">
                    <CitizenIdentityForm forms={forms} webhooks={webhooks} />
                  </div>
                } />

                <Route path="/RECUITMENT" element={
                  <RecruitmentScene 
                    config={recruitmentConfig} 
                    onBack={() => handleNavClick('home')} 
                  />
                } />

                <Route path="/structural" element={
                  <div className="min-h-screen pt-24 bg-transparent">
                    <StructuralChart 
                        depts={depts} 
                        leadershipData={leadership} 
                    />
                  </div>
                } />

                <Route path="/pawnshop" element={
                  <div className="min-h-screen pt-24 bg-transparent">
                      <PawnshopMarket items={pawnItems} />
                  </div>
                } />

                <Route path="/loker" element={
                  <div className="min-h-screen pt-24 bg-transparent">
                    {auth.isLoggedIn ? (
                      <PublicInventory />
                    ) : (
                      <div className="flex items-center justify-center h-[60vh]">
                        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-rose-500/30 text-center max-w-md mx-4">
                          <div className="text-4xl mb-4">🔒</div>
                          <h2 className="text-2xl font-bold text-rose-500 mb-2">Akses Ditolak</h2>
                          <p className="text-slate-300 text-sm">Anda harus login terlebih dahulu untuk melihat informasi Loker Umum & Hitam.</p>
                        </div>
                      </div>
                    )}
                  </div>
                } />

                <Route path="/news_archive" element={
                  <NewsArchive 
                    news={news}
                    onNewsClick={setSelectedNews}
                  />
                } />

                <Route path="/donation" element={
                  <DonationPage />
                } />
              </Routes>
            </main>

            <Footer 
              onLogin={handleLogin} 
              onLogout={handleLogout} 
              onSignup={handleSignup}
              auth={auth} 
              onPrivacyClick={() => setIsPrivacyOpen(true)}
              onTermsClick={() => setIsTermsOpen(true)}
              onDonationClick={() => handleNavClick('donation')}
              lastSyncTime={lastSyncTime}
              onManualRefresh={handleManualRefresh}
              isSyncing={isSyncing}
            />

            {/* Administration Dashboard for authenticated staff */}
            {auth.isAdmin && (
                <NewsAdmin 
                  news={news}
                  setNews={setNews}
                  userRole={auth.role}
                  staffName={auth.staffName}
                  department={auth.department}
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
                  setRecruitmentConfig={setRecruitmentConfig}
                  permissionConfig={permissionConfig}   
                  carouselSlides={carouselSlides}
                  setCarouselSlides={setCarouselSlides}
                  pawnItems={pawnItems}
                  setPawnItems={setPawnItems}
                  webhooks={webhooks}
                  setWebhooks={setWebhooks}
                />
            )}

            {/* Modals and Overlays */}
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

            <FeedbackFloating auth={auth} webhooks={webhooks} />
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
