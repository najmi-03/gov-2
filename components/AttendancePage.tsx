
import React, { useState, useEffect, useMemo } from 'react';
import { ATTENDANCE_SCRIPT_URL } from '../constants';
import { AuthState, AttendanceLog } from '../types'; 
import { fetchFromDatabase } from '../services/databaseService'; 

interface AttendancePageProps {
  onBack: () => void;
  auth: AuthState;
}

interface StaffSummary {
  name: string;
  role: string;
  totalHours: number;
  daysPresent: number;
  lastSeen: string;
  status: string; 
}

const AttendancePage: React.FC<AttendancePageProps> = ({ onBack, auth }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [adminViewMode, setAdminViewMode] = useState<'MANUAL' | 'LOGS'>('LOGS'); 
  const [logViewType, setLogViewType] = useState<'RAW' | 'STATS'>('RAW');
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [alertData, setAlertData] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // State Input Manual
  const [manualId, setManualId] = useState('');
  
  // Admin Form States
  const [adminId, setAdminId] = useState('');
  const [adminName, setAdminName] = useState('');

  // Data Logs State
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);

  // === NEW: MONTHLY SELECTOR STATES ===
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // === NEW: DATE RANGE FILTER (MINGGUAN/HARIAN) ===
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const YEARS = [2025, 2026, 2027, 2028];

  // Access Control Logic
  const canAccessAdmin = auth.role === 'SUPER_ADMIN' || auth.role === 'HR_ADMIN';
  const isLoggedIn = !!auth.staffName; 

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update default Date Filter when Month/Year changes
  useEffect(() => {
    // Set to 1st of month until End of month
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    setFilterStartDate(formatDateForInput(firstDay));
    setFilterEndDate(formatDateForInput(lastDay));
  }, [selectedMonth, selectedYear]);

  const handleSetThisWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setFilterStartDate(formatDateForInput(monday));
    setFilterEndDate(formatDateForInput(sunday));
  };

  // Calculate Active Duty Count (Realtime, ignore filter)
  const activeDutyCount = useMemo(() => {
    const latestStatus: Record<string, string> = {};
    logs.forEach(log => {
      const key = log.staffName.trim().toLowerCase();
      if (!latestStatus[key]) {
        latestStatus[key] = log.action; 
      }
    });
    
    return Object.values(latestStatus).filter(s => 
      s.toUpperCase().includes('MASUK') || 
      s.toUpperCase().includes('IN') || 
      s.toUpperCase().includes('LOGIN')
    ).length;
  }, [logs]);

  // Calculate Weekly/Monthly Stats (RESPECT DATE FILTER)
  const weeklyStats = useMemo(() => {
    // 1. Filter Logs by Date Range
    const startTs = filterStartDate ? new Date(filterStartDate).setHours(0, 0, 0, 0) : 0;
    const endTs = filterEndDate ? new Date(filterEndDate).setHours(23, 59, 59, 999) : 9999999999999;

    const filteredLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= startTs && logTime <= endTs;
    });

    const grouped: Record<string, AttendanceLog[]> = {};
    // Reverse needed for calculating duration logic if logs are newest first
    const chronoLogs = [...filteredLogs].reverse(); 

    chronoLogs.forEach(log => {
      const name = log.staffName;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(log);
    });

    const summaries: StaffSummary[] = Object.keys(grouped).map(name => {
      const userLogs = grouped[name];
      const recentLogs = userLogs; 

      // 2. Calculate Days Present
      const uniqueDays = new Set<string>();
      recentLogs.forEach(l => {
        const act = l.action.toUpperCase();
        if (act.includes('MASUK') || act.includes('IN')) {
          const d = new Date(l.timestamp);
          if (!isNaN(d.getTime())) {
             const dayStr = d.toLocaleDateString('id-ID');
             uniqueDays.add(dayStr);
          }
        }
      });

      // 3. Calculate Total Hours
      let totalMs = 0;
      let tempIn: number | null = null;

      recentLogs.forEach(l => {
        const t = new Date(l.timestamp).getTime();
        if (isNaN(t)) return;

        const act = l.action.toUpperCase();
        const isEnter = act.includes('MASUK') || act.includes('IN') || act.includes('LOGIN');
        const isExit = act.includes('PULANG') || act.includes('OUT') || act.includes('KELUAR');

        if (isEnter) {
          if (tempIn === null) tempIn = t; 
        } else if (isExit && tempIn !== null) {
          let diff = t - tempIn;
          // Validasi anomali (misal lupa logout > 24 jam)
          if (diff < 24 * 60 * 60 * 1000 && diff > 0) {
            totalMs += diff;
          }
          tempIn = null;
        }
      });

      const lastLog = userLogs[userLogs.length - 1]; 
      
      return {
        name: name,
        role: lastLog?.role || '-',
        totalHours: totalMs / (1000 * 60 * 60),
        daysPresent: uniqueDays.size,
        lastSeen: lastLog?.timestamp || '',
        status: lastLog?.action || ''
      };
    });

    return summaries.sort((a, b) => b.totalHours - a.totalHours);
  }, [logs, filterStartDate, filterEndDate]);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertData({ message, type });
    setTimeout(() => setAlertData(null), 5000);
  };

  const sendRequest = async (action: string, payload: any) => {
    if (!ATTENDANCE_SCRIPT_URL) {
      showAlert("System Error: URL Database Absensi belum dikonfigurasi.", 'error');
      return null;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('action', action);
      Object.keys(payload).forEach(key => {
        params.append(key, payload[key]);
      });

      await fetch(ATTENDANCE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      setIsLoading(false);
      return { success: true, message: "DATA TERKIRIM KE SERVER" };
    } catch (error) {
      console.error("Fetch Error:", error);
      setIsLoading(false);
      showAlert("Gagal terhubung ke server.", 'error');
      return null;
    }
  };

  const handleInitDatabase = async () => {
    const targetName = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    if (!confirm(`⚠️ Buat Database Baru untuk periode: ${targetName}?\n\nLakukan ini jika data bulan tersebut belum ada / belum bisa dibaca.`)) return;

    setIsLoading(true);
    try {
        const params = new URLSearchParams();
        params.append('action', 'initSheet');
        params.append('monthIndex', selectedMonth.toString());
        params.append('year', selectedYear.toString());

        await fetch(ATTENDANCE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        setTimeout(() => {
            setIsLoading(false);
            showAlert(`Database ${targetName} berhasil dibuat/diperbarui!`, 'success');
            handleFetchLogs(); 
        }, 1500);

    } catch (error) {
        setIsLoading(false);
        showAlert("Gagal inisialisasi database.", 'error');
    }
  };

  const handleFetchLogs = async () => {
    setIsFetchingLogs(true);
    try {
      const targetSheetName = `Absensi_${MONTH_NAMES[selectedMonth]}_${selectedYear}`;
      console.log(`Fetching Attendance from Sheet: ${targetSheetName}`);

      const rawData = await fetchFromDatabase('ATTENDANCE', targetSheetName);
      
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        setLogs([]);
        if (rawData && rawData.length === 0) {
            showAlert("Data log kosong.", 'error');
        }
      } else {
        const formattedLogs: AttendanceLog[] = rawData.map((row: any) => {
            // Normalize keys to support various script versions
            const keys = Object.keys(row).reduce((acc, k) => {
                acc[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = row[k];
                return acc;
            }, {} as any);

            const name = keys['namapegawai'] || keys['nama'] || keys['name'] || keys['0'] || 'Unknown';
            const role = keys['jabatan'] || keys['role'] || keys['posisi'] || keys['1'] || '-';
            // CRITICAL FIX: Add 'clockstatus' key mapping
            const status = keys['clockstatus'] || keys['statusabsensi'] || keys['status'] || keys['action'] || keys['2'] || 'INFO';
            const rawTime = keys['timestamp'] || keys['waktu'] || keys['date'] || keys['3'] || new Date().toISOString();

            return {
                staffName: name,
                role: role,
                action: status,
                timestamp: rawTime
            };
        }).reverse(); 

        setLogs(formattedLogs);
        if(formattedLogs.length > 0) {
            showAlert(`Data ${MONTH_NAMES[selectedMonth]} dimuat (${formattedLogs.length} baris).`, 'success');
        }
      }
    } catch (error) {
      console.error(error);
      showAlert("Gagal menarik data log.", "error");
    }
    setIsFetchingLogs(false);
  };

  const handleAbsen = async (status: 'MASUK' | 'PULANG') => {
    const finalId = isLoggedIn ? (auth.nip || auth.staffName) : manualId;
    const finalName = isLoggedIn ? auth.staffName : manualId; 
    const finalRole = isLoggedIn ? auth.role : 'GUEST/MANUAL';

    if (!finalId) return showAlert("IDENTITAS TIDAK TERDETEKSI!", 'error');
    
    const payload = { 
        staffName: finalName, 
        id: finalId, 
        role: finalRole,
        status: status, 
        device: navigator.userAgent.includes('Mobile') ? 'HP/Mobile' : 'PC/Desktop',
        clientTime: new Date().toLocaleString('id-ID')
    };
    
    const res = await sendRequest('prosesAbsensi', payload);
    if (res) {
        showAlert(`Berhasil: ${status} - ${finalName}`, 'success');
        if (!isLoggedIn) setManualId(''); 
    }
  };

  const handleRegister = async () => {
    if (!adminId.trim() || !adminName.trim()) return showAlert("LENGKAPI DATA PEGAWAI!", 'error');
    const payload = { 
        id: adminId, 
        staffName: adminName,
        role: 'PEGAWAI BARU',
        status: 'REGISTRASI MANUAL',
        device: 'Admin Panel'
    };
    const res = await sendRequest('tambahPegawai', payload);
    if (res) {
        showAlert("Pegawai Manual Terdaftar", 'success');
        if (res.success) {
            setAdminId('');
            setAdminName('');
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050a18] text-white font-sans fixed inset-0 z-[200] overflow-y-auto">
      {/* Header Navbar */}
      <nav className="bg-[#050a18] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30 group transition-all hover:scale-110">
                <span className="text-orange-500 font-bold text-xl font-serif italic group-hover:text-white">←</span>
            </div>
            <div className="flex flex-col">
                <span className="font-extrabold tracking-tighter text-lg hidden sm:block leading-none">GOV <span className="text-orange-500">PRESENSI</span></span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest hidden sm:block">Portal Kembali</span>
            </div>
        </div>
        <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <button 
                onClick={() => setActiveTab('user')} 
                className={`hover:text-white py-2 transition border-b-2 ${activeTab === 'user' ? 'text-orange-500 border-orange-500' : 'border-transparent'}`}
            >
                Absensi
            </button>
            {canAccessAdmin && (
              <button 
                  onClick={() => setActiveTab('admin')} 
                  className={`hover:text-white py-2 transition border-b-2 ${activeTab === 'admin' ? 'text-orange-500 border-orange-500' : 'border-transparent'}`}
              >
                  Panel HRD
              </button>
            )}
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-4 relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className={`w-full ${activeTab === 'admin' && adminViewMode === 'LOGS' ? 'max-w-5xl' : 'max-w-4xl'} grid ${activeTab === 'admin' && adminViewMode === 'LOGS' ? 'grid-cols-1' : 'md:grid-cols-2'} gap-12 items-center relative z-10`}>
            
            {/* Branding Kiri */}
            {!(activeTab === 'admin' && adminViewMode === 'LOGS') && (
                <div className="hidden md:block space-y-6">
                    <h1 className="text-6xl font-black leading-none uppercase tracking-tighter text-white">
                        Karir <br/> <span className="text-orange-500">Pemerintah</span>
                    </h1>
                    <p className="text-gray-400 text-lg border-l-4 border-orange-500 pl-4 italic">
                        Sistem Pencatatan Kehadiran Aparatur Sipil Negara.
                    </p>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl w-32 text-center">
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Status DB</p>
                            <p className={`font-bold text-xs uppercase ${ATTENDANCE_SCRIPT_URL ? 'text-green-500' : 'text-red-500'}`}>
                                {ATTENDANCE_SCRIPT_URL ? 'Connected' : 'No Config'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Kartu Form Kanan */}
            <div className={`bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col ${activeTab === 'admin' && adminViewMode === 'LOGS' ? 'h-[80vh] w-full' : 'p-8'}`}>
                
                {alertData && (
                    <div className={`absolute top-4 left-4 right-4 p-4 rounded-xl text-xs font-black z-20 text-center shadow-lg animate-bounce ${alertData.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'}`}>
                        {alertData.message}
                    </div>
                )}

                {(activeTab === 'user' || !canAccessAdmin) && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center">
                            <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Presensi Digital</p>
                            <h2 className="text-4xl font-bold tracking-tight mb-1 text-white">
                                {time.toLocaleTimeString('id-ID', { hour12: false })}
                            </h2>
                            <p className="text-gray-500 text-xs uppercase tracking-widest">
                                {time.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            {isLoggedIn ? (
                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-center mb-2">
                                    <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest mb-1">IDENTITAS TERVERIFIKASI</p>
                                    <h3 className="text-lg font-bold text-white">{auth.staffName}</h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                            {auth.role}
                                        </p>
                                        {auth.nip && (
                                            <p className="text-[9px] text-slate-500 font-mono bg-slate-900/50 inline-block px-2 py-0.5 rounded mx-auto border border-white/5">
                                                NIP: {auth.nip}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1">ID Personel (Manual) *</label>
                                    <input 
                                        type="text" 
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 text-white py-4 px-6 rounded-2xl text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600" 
                                        placeholder="Masukkan Nama/ID..." 
                                    />
                                    <p className="text-[9px] text-slate-500 italic ml-1">*Login Staff di menu utama untuk absen otomatis.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button onClick={() => handleAbsen('MASUK')} className="bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 active:scale-95 transition-all">CLOCK IN</button>
                                <button onClick={() => handleAbsen('PULANG')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">CLOCK OUT</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'admin' && canAccessAdmin && (
                    <div className={`space-y-6 animate-fade-in-up ${adminViewMode === 'LOGS' ? 'h-full flex flex-col' : ''}`}>
                        
                        <div className={`flex items-center justify-center gap-2 ${adminViewMode === 'LOGS' ? 'p-6 pb-0' : ''}`}>
                            <button onClick={() => setAdminViewMode('LOGS')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${adminViewMode === 'LOGS' ? 'bg-orange-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}>📜 Data Log</button>
                            <button onClick={() => setAdminViewMode('MANUAL')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${adminViewMode === 'MANUAL' ? 'bg-orange-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}>✍️ Input Manual</button>
                        </div>

                        {adminViewMode === 'LOGS' && (
                            <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
                                <div className="flex flex-col gap-4 mb-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-xl font-bold text-white uppercase">Riwayat Absensi</h2>
                                            
                                            {/* FILTER CONTROLS */}
                                            <div className="flex flex-col gap-2 mt-2">
                                                <div className="flex gap-2">
                                                    <select 
                                                        value={selectedMonth} 
                                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                        className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-1 rounded outline-none focus:border-orange-500"
                                                    >
                                                        {MONTH_NAMES.map((m, i) => (
                                                            <option key={i} value={i}>{m}</option>
                                                        ))}
                                                    </select>
                                                    <select 
                                                        value={selectedYear} 
                                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                        className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-1 rounded outline-none focus:border-orange-500"
                                                    >
                                                        {YEARS.map((y) => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                {/* FILTER TANGGAL (MINGGUAN) */}
                                                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                                    <div className="flex gap-2 items-center">
                                                        <input 
                                                            type="date" 
                                                            value={filterStartDate}
                                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                                            className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded outline-none focus:border-blue-500"
                                                        />
                                                        <span className="text-slate-500 text-[10px]">-</span>
                                                        <input 
                                                            type="date" 
                                                            value={filterEndDate}
                                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                                            className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-2 py-1 rounded outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleSetThisWeek}
                                                        className="bg-white/5 hover:bg-white/10 text-amber-500 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all"
                                                    >
                                                        📅 Minggu Ini
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleInitDatabase}
                                                disabled={isFetchingLogs || isLoading}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 h-fit"
                                                title="Klik jika data tidak muncul / Sheet belum ada"
                                            >
                                                📁 Init DB
                                            </button>

                                            <button 
                                                onClick={handleFetchLogs}
                                                disabled={isFetchingLogs}
                                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 h-fit"
                                            >
                                                {isFetchingLogs ? 'Memuat...' : '🔄 Refresh'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
                                                {activeDutyCount} Personel Sedang Bertugas
                                            </p>
                                        </div>
                                        {/* Toggle View */}
                                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/10">
                                            <button onClick={() => setLogViewType('RAW')} className={`px-2 py-1 text-[8px] font-bold uppercase rounded ${logViewType === 'RAW' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Log Mentah</button>
                                            <button onClick={() => setLogViewType('STATS')} className={`px-2 py-1 text-[8px] font-bold uppercase rounded ${logViewType === 'STATS' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}>Statistik</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden relative">
                                    <div className="absolute inset-0 overflow-auto custom-scrollbar">
                                        
                                        {/* VIEW RAW LOGS */}
                                        {logViewType === 'RAW' && (
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-widest sticky top-0 backdrop-blur-md z-10">
                                                    <tr>
                                                        <th className="px-4 py-3">Waktu</th>
                                                        <th className="px-4 py-3">Nama</th>
                                                        <th className="px-4 py-3 hidden sm:table-cell">Jabatan</th>
                                                        <th className="px-4 py-3 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {logs.length > 0 ? (
                                                        logs.map((log, i) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">
                                                                    {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} <span className="text-slate-600">|</span> {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="px-4 py-3 font-bold text-white">
                                                                    {log.staffName}
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                                                                    {log.role}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`px-2 py-1 rounded text-[9px] font-black ${
                                                                        log.action.includes('MASUK') || log.action.includes('IN') ? 'bg-green-500/10 text-green-400' : 
                                                                        log.action.includes('PULANG') || log.action.includes('OUT') ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                                                                    }`}>
                                                                        {log.action}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                                                <p className="mb-2">Data log tidak ditemukan / sheet belum dibuat.</p>
                                                                <p className="text-[9px] text-amber-500 font-bold">
                                                                    Klik tombol "📁 Init DB" di atas untuk inisialisasi sheet bulan ini.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}

                                        {/* VIEW STATISTICS */}
                                        {logViewType === 'STATS' && (
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-widest sticky top-0 backdrop-blur-md z-10">
                                                    <tr>
                                                        <th className="px-4 py-3">Nama Pegawai</th>
                                                        <th className="px-4 py-3">Kehadiran (Hari)</th>
                                                        <th className="px-4 py-3">Total Jam</th>
                                                        <th className="px-4 py-3 text-right">Status Terkini</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {weeklyStats.length > 0 ? (
                                                        weeklyStats.map((stat, i) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="font-bold text-white">{stat.name}</div>
                                                                    <div className="text-[9px] text-slate-500 uppercase">{stat.role}</div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="font-mono text-amber-500 font-bold">{stat.daysPresent}</span>
                                                                    <span className="text-[9px] text-slate-500 ml-1">Hari</span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="font-mono text-blue-400 font-bold">{stat.totalHours.toFixed(1)}</span>
                                                                    <span className="text-[9px] text-slate-500 ml-1">Jam</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`px-2 py-1 rounded text-[9px] font-black ${
                                                                        stat.status.includes('MASUK') || stat.status.includes('IN') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                        {stat.status || 'OFF'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                                                Belum ada data statistik untuk periode tanggal ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                        {adminViewMode === 'MANUAL' && (
                            <div className="px-2">
                                <div className="text-center mb-6">
                                    <p className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-2">Darurat / Perbaikan</p>
                                    <h2 className="text-2xl font-bold text-white">Input Manual</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 text-left">ID Baru *</label>
                                        <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 text-white py-4 px-6 rounded-2xl text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600" placeholder="Contoh: 1001" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 text-left">Nama Lengkap *</label>
                                        <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 text-white py-4 px-6 rounded-2xl text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600" placeholder="Nama sesuai KTP..." />
                                    </div>
                                    <button onClick={handleRegister} className="w-full bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] mt-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Simpan Database</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </main>

      <footer className="p-8 border-t border-white/5 text-center">
        <p className="font-black italic text-xs tracking-[0.3em] text-white/30 uppercase">Pemerintah San Andreas • 2026</p>
      </footer>

      {isLoading && (
        <div className="fixed inset-0 bg-[#050a18]/90 z-[300] flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="mt-6 font-bold text-orange-500 tracking-[0.2em] text-[10px] uppercase animate-pulse">Mengirim Data...</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
