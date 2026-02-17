
import React, { useState, useEffect, useMemo } from 'react';
import { SalaryRecord, Department, LeadershipMember, DeptInfo, AttendanceLog } from '../types';
import { sendToDiscord, formatSalarySlipEmbed } from '../services/discordService';
import { fetchFromDatabase } from '../services/databaseService';
import { motion, AnimatePresence } from 'framer-motion';

interface SalaryManagerProps {
  leadership: LeadershipMember[];
  depts: DeptInfo[];
}

interface FlatEmployee {
  name: string;
  role: string;
  dept: string;
  isLeader: boolean;
}

interface CalculatedStat {
    name: string;
    role: string;
    totalHours: number;
    daysPresent: number;
    salary: number;
}

const SalaryManager: React.FC<SalaryManagerProps> = ({ leadership, depts }) => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalaryRecord | null>(null);
  
  // State untuk Edit Full
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHrDropdown, setShowHrDropdown] = useState(false);
  
  // State untuk Rate Management
  const [showRateModal, setShowRateModal] = useState(false);
  const [roleRates, setRoleRates] = useState<Record<string, number>>({});
  const [defaultRate, setDefaultRate] = useState(2500);
  
  // State untuk Edit Nama Jabatan (Rate Modal)
  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [tempRoleName, setTempRoleName] = useState('');

  // State untuk Preview Statistik
  const [previewStats, setPreviewStats] = useState<CalculatedStat[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // === SOURCE SHEET SELECTOR ===
  const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const YEARS = [2025, 2026, 2027, 2028];
  
  const [importMonth, setImportMonth] = useState(new Date().getMonth());
  const [importYear, setImportYear] = useState(new Date().getFullYear());

  // State untuk Filter Tanggal (Mingguan/Bulanan)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [newRecord, setNewRecord] = useState<Partial<SalaryRecord>>({
    staffName: '',
    position: '',
    deptName: 'Executive Office',
    baseSalary: 0,
    bonus: 0,
    penaltyLevel: 'NONE',
    notes: ''
  });

  // Flat list of all employees from HR and Leadership
  const allEmployees = useMemo(() => {
    const list: FlatEmployee[] = [];
    leadership.forEach(l => list.push({ name: l.name, role: l.role, dept: 'Executive Office', isLeader: true }));
    depts.forEach(d => {
      d.structuralStaff.forEach(s => list.push({ name: s.name, role: s.role, dept: d.name, isLeader: false }));
    });
    return list;
  }, [leadership, depts]);

  // Extract unique roles for Rate Settings (Active Staff + Custom Saved Rates)
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    
    // 1. Dari Staff Aktif
    allEmployees.forEach(e => roles.add(e.role));
    
    // 2. Dari Database Rate yang tersimpan (agar custom role muncul)
    Object.keys(roleRates).forEach(r => roles.add(r));

    // 3. Default Roles
    roles.add('Staff');
    roles.add('Magang');
    roles.add('Security');
    
    return Array.from(roles).sort();
  }, [allEmployees, roleRates]);

  const filteredEmployees = allEmployees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const saved = localStorage.getItem('ls_gov_salaries');
    if (saved) setSalaries(JSON.parse(saved));

    const savedUrl = localStorage.getItem('ls_discord_webhook');
    if (savedUrl) setWebhookUrl(savedUrl);

    // Load Saved Rates
    const savedRates = localStorage.getItem('ls_gov_salary_rates');
    if (savedRates) setRoleRates(JSON.parse(savedRates));
  }, []);

  // Update default dates when month changes (Default: Full Month)
  useEffect(() => {
    const firstDay = new Date(importYear, importMonth, 1);
    const lastDay = new Date(importYear, importMonth + 1, 0);
    setStartDate(formatDateForInput(firstDay));
    setEndDate(formatDateForInput(lastDay));
  }, [importMonth, importYear]);

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSetThisWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setStartDate(formatDateForInput(monday));
    setEndDate(formatDateForInput(sunday));
  };

  const saveSalaries = (data: SalaryRecord[]) => {
    setSalaries(data);
    localStorage.setItem('ls_gov_salaries', JSON.stringify(data));
  };

  const handleUpdateRate = (role: string, amount: number) => {
    const updated = { ...roleRates, [role]: amount };
    setRoleRates(updated);
    localStorage.setItem('ls_gov_salary_rates', JSON.stringify(updated));
  };

  const handleDeleteRate = (role: string) => {
    if(confirm(`Hapus konfigurasi gaji untuk "${role}"?`)) {
        const updated = { ...roleRates };
        delete updated[role];
        setRoleRates(updated);
        localStorage.setItem('ls_gov_salary_rates', JSON.stringify(updated));
    }
  };

  const startEditingRole = (role: string) => {
      setEditingRoleKey(role);
      setTempRoleName(role);
  };

  const saveRoleName = (oldRole: string) => {
      if (!tempRoleName.trim() || tempRoleName === oldRole) {
          setEditingRoleKey(null);
          return;
      }

      // Copy old rate to new key, delete old key
      const currentRate = roleRates[oldRole] || defaultRate;
      const updated = { ...roleRates, [tempRoleName]: currentRate };
      delete updated[oldRole];
      
      setRoleRates(updated);
      localStorage.setItem('ls_gov_salary_rates', JSON.stringify(updated));
      setEditingRoleKey(null);
  };

  const calculateTotal = (base: number, bonus: number, penalty: string) => {
    let penaltyMultiplier = 1;
    if (penalty === 'SP1') penaltyMultiplier = 0.5;
    if (penalty === 'SP2') penaltyMultiplier = 0.25;
    if (penalty === 'SP3') penaltyMultiplier = 0;
    return (base * penaltyMultiplier) + bonus;
  };

  const handleAdd = () => {
    if (!newRecord.staffName) return alert("Pilih atau masukkan nama staff!");
    
    const record: SalaryRecord = {
      id: Date.now().toString(),
      staffName: newRecord.staffName || '',
      position: newRecord.position || '',
      deptName: newRecord.deptName || 'Executive Office',
      baseSalary: Number(newRecord.baseSalary) || 0,
      bonus: Number(newRecord.bonus) || 0,
      penaltyLevel: newRecord.penaltyLevel as any || 'NONE',
      notes: newRecord.notes || ''
    };
    saveSalaries([...salaries, record]);
    setIsAdding(false);
    setSearchTerm('');
    setNewRecord({ staffName: '', position: '', deptName: 'Executive Office', baseSalary: 0, bonus: 0, penaltyLevel: 'NONE', notes: '' });
  };

  const handleSaveEdit = () => {
      if (!editingRecord) return;
      const updatedList = salaries.map(s => s.id === editingRecord.id ? editingRecord : s);
      saveSalaries(updatedList);
      setEditingRecord(null);
  };

  const handleImportAttendance = async () => {
    setIsImporting(true);
      
    try {
      const targetSheetName = `Absensi_${MONTH_NAMES[importMonth]}_${importYear}`;
      console.log(`Treasury fetching from: ${targetSheetName}`);

      const rawData = await fetchFromDatabase('ATTENDANCE', targetSheetName);
      
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        alert(`⚠️ Database "${targetSheetName}" KOSONG.\n\nTips: Pastikan Database Absensi bulan tersebut sudah dibuat di panel Absensi.`);
        setIsImporting(false);
        return;
      }

      // 1. Parsing Logs
      let logs: AttendanceLog[] = rawData.map((row: any) => {
          const keys = Object.keys(row).reduce((acc, k) => {
              acc[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = row[k];
              return acc;
          }, {} as any);
          
          const name = keys['namapegawai'] || keys['nama'] || keys['name'] || keys['0'] || 'Unknown';
          const role = keys['jabatan'] || keys['role'] || keys['posisi'] || keys['1'] || 'Staff';
          const action = keys['clockstatus'] || keys['statusabsensi'] || keys['status'] || keys['action'] || keys['aksi'] || keys['2'] || 'INFO';
          const timestamp = keys['timestamp'] || keys['waktu'] || keys['date'] || keys['3'] || new Date().toISOString();

          return {
              staffName: name,
              role: role,
              action: action ? action.toString().toUpperCase().trim() : 'UNKNOWN',
              timestamp: timestamp
          };
      }).filter(log => log.staffName && log.action && !log.staffName.toLowerCase().includes('nama')); 

      // 2. Filter Date Range
      const startTs = new Date(startDate).setHours(0, 0, 0, 0);
      const endTs = new Date(endDate).setHours(23, 59, 59, 999);

      logs = logs.filter(log => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime >= startTs && logTime <= endTs;
      });

      if (logs.length === 0) {
          alert(`Tidak ada data absensi pada periode ${startDate} s/d ${endDate}.`);
          setIsImporting(false);
          return;
      }

      // 3. STATISTICAL CALCULATION (Same as AttendancePage)
      const workStats: Record<string, { totalHours: number, role: string, days: Set<string> }> = {};
      const tempCheckIn: Record<string, number> = {};

      // Sort Ascending (Older -> Newer)
      logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      logs.forEach(log => {
          const time = new Date(log.timestamp).getTime();
          if (isNaN(time)) return;
          
          const act = log.action;
          const isClockIn = act.includes('IN') || act.includes('MASUK') || act.includes('LOGIN');
          const isClockOut = act.includes('OUT') || act.includes('PULANG') || act.includes('KELUAR');
          const dateStr = new Date(log.timestamp).toLocaleDateString();

          // Init stats object
          if (!workStats[log.staffName]) {
              workStats[log.staffName] = { totalHours: 0, role: log.role, days: new Set() };
          }

          // Count presence days based on Clock IN
          if (isClockIn) {
              workStats[log.staffName].days.add(dateStr);
              tempCheckIn[log.staffName] = time;
              workStats[log.staffName].role = log.role; // Update latest role
          } else if (isClockOut && tempCheckIn[log.staffName]) {
              const durationMs = time - tempCheckIn[log.staffName];
              const durationHours = durationMs / (1000 * 60 * 60); 
              
              if (durationHours > 0 && durationHours < 24) { 
                  workStats[log.staffName].totalHours += durationHours;
              }
              delete tempCheckIn[log.staffName];
          }
      });

      // 4. Generate Calculated List
      const results: CalculatedStat[] = Object.entries(workStats)
        .filter(([_, stat]) => stat.totalHours > 0.1 || stat.days.size > 0)
        .map(([name, stat]) => {
            // Find Rate
            const roleKey = Object.keys(roleRates).find(key => key.toLowerCase() === stat.role.toLowerCase());
            const rate = roleKey ? roleRates[roleKey] : defaultRate;
            
            return {
                name: name,
                role: stat.role,
                totalHours: stat.totalHours,
                daysPresent: stat.days.size,
                salary: Math.floor(stat.totalHours * rate)
            };
        })
        .sort((a, b) => b.totalHours - a.totalHours); // Sort by hours descending

      setPreviewStats(results);
      setShowPreviewModal(true);

    } catch (e) {
      console.error(e);
      alert("Error saat memproses data absensi.");
    }

    setIsImporting(false);
  };

  const confirmImport = () => {
      const newSalaries: SalaryRecord[] = previewStats.map((stat, idx) => ({
          id: `auto-${Date.now()}-${idx}`,
          staffName: stat.name,
          position: stat.role,
          deptName: 'Government Staff',
          baseSalary: stat.salary,
          bonus: 0,
          penaltyLevel: 'NONE',
          notes: `Hadir: ${stat.daysPresent} Hari | Total: ${stat.totalHours.toFixed(2)} Jam`
      }));

      saveSalaries([...salaries, ...newSalaries]);
      setShowPreviewModal(false);
      alert(`✅ Berhasil mengimpor ${newSalaries.length} data gaji.`);
  };

  const selectEmployee = (emp: FlatEmployee) => {
    setNewRecord({
      ...newRecord,
      staffName: emp.name,
      position: emp.role,
      deptName: emp.dept,
      baseSalary: 0
    });
    setSearchTerm(emp.name);
    setShowHrDropdown(false);
  };

  const deleteRecord = (id: string) => {
    saveSalaries(salaries.filter(s => s.id !== id));
  };

  const updateRecord = (id: string, field: keyof SalaryRecord, value: any) => {
    setSalaries(salaries.map(s => s.id === id ? { ...s, [field]: value } : s));
    localStorage.setItem('ls_gov_salaries', JSON.stringify(salaries.map(s => s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSendToDiscord = async (salary: SalaryRecord) => {
    if (!webhookUrl) return alert("Silakan masukkan Discord Webhook di bagian bawah panel!");
    setIsSending(true);
    const success = await sendToDiscord(webhookUrl, formatSalarySlipEmbed(salary));
    if (success) {
      alert(`Slip Gaji ${salary.staffName} berhasil dikirim ke Discord!`);
      setSelectedSlip(null);
    } else {
      alert("Gagal mengirim slip. Periksa Webhook URL Anda.");
    }
    setIsSending(false);
  };

  const deptsPlusExecutive = [...Object.values(Department), 'Executive Office', 'Government Staff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-5 md:p-6 rounded-2xl border border-white/5 gap-4">
        <div>
          <h3 className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-widest">Bendahara Negara</h3>
          <p className="text-[10px] text-slate-500">Database Payroll Terpadu</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="flex-1 sm:flex-none bg-white/5 border border-white/10 text-white text-[10px] font-black px-4 py-3 rounded-xl uppercase tracking-widest hover:bg-white/10 transition-all"
            >
            {isAdding ? 'TUTUP MANUAL' : '+ INPUT MANUAL'}
            </button>
        </div>
      </div>

      {/* SECTION BARU: IMPORT OTOMATIS & DATE FILTER */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    🤖 Integrasi Gov Presensi
                </h4>
                <p className="text-[9px] text-slate-400 mt-1">
                    Hitung statistik jam kerja & gaji otomatis dari Database Absensi.
                </p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowRateModal(true)}
                    className="bg-slate-800 text-amber-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase border border-amber-500/20 hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                    ⚙️ ATUR RATE ($)
                </button>
            </div>
        </div>

        {/* SELECTOR SHEET SOURCE */}
        <div className="flex flex-col gap-3 bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-blue-600 px-2 py-0.5 rounded">Langkah 1</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Pilih Database Sumber</span>
            </div>
            <div className="flex gap-2">
                <select 
                    value={importMonth} 
                    onChange={(e) => setImportMonth(Number(e.target.value))}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase outline-none focus:border-blue-500/50"
                >
                    {MONTH_NAMES.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
                <select 
                    value={importYear} 
                    onChange={(e) => setImportYear(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase outline-none focus:border-blue-500/50"
                >
                    {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* DATE PICKER ROW */}
        <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-blue-600 px-2 py-0.5 rounded">Langkah 2</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Filter Statistik (Opsional)</span>
                </div>
                <div className="flex gap-2 items-center">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase outline-none focus:border-blue-500/50"
                    />
                    <span className="text-white self-center">-</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase outline-none focus:border-blue-500/50"
                    />
                    <button 
                        onClick={handleSetThisWeek}
                        className="bg-white/5 hover:bg-white/10 text-amber-500 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-amber-500/20 transition-all whitespace-nowrap h-full"
                    >
                        📅 Minggu Ini
                    </button>
                </div>
            </div>
            <button 
                onClick={handleImportAttendance}
                disabled={isImporting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 h-[38px] self-end"
            >
                {isImporting ? 'Menghitung...' : '📊 HITUNG STATISTIK'}
            </button>
        </div>
      </div>

      {/* PREVIEW MODAL (STATISTIK) */}
      <AnimatePresence>
        {showPreviewModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowPreviewModal(false)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Preview Statistik & Kalkulasi</h3>
                            <p className="text-[10px] text-slate-500">Periksa data sebelum masuk ke tabel penggajian.</p>
                        </div>
                        <button onClick={() => setShowPreviewModal(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950 rounded-xl border border-white/5">
                        <table className="w-full text-left text-[10px]">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 py-3">Nama Pegawai</th>
                                    <th className="px-4 py-3">Hari Hadir</th>
                                    <th className="px-4 py-3">Total Jam</th>
                                    <th className="px-4 py-3">Estimasi Gaji</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {previewStats.length > 0 ? (
                                    previewStats.map((stat, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02]">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-white">{stat.name}</div>
                                                <div className="text-[9px] text-slate-500 uppercase">{stat.role}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-amber-500 font-bold">{stat.daysPresent}</span> Hari
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-blue-400 font-bold">{stat.totalHours.toFixed(2)}</span> Jam
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-green-400">
                                                ${stat.salary.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Data statistik kosong (Total jam 0).</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => setShowPreviewModal(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            Batal
                        </button>
                        <button onClick={confirmImport} disabled={previewStats.length === 0} className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-600/20 disabled:opacity-50">
                            ✅ Import ke Payroll ({previewStats.length})
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* EDIT RECORD MODAL (NEW) */}
      <AnimatePresence>
        {editingRecord && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setEditingRecord(null)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Edit Data Payroll</h3>
                        <button onClick={() => setEditingRecord(null)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Pegawai</label>
                                <input type="text" value={editingRecord.staffName} onChange={(e) => setEditingRecord({...editingRecord, staffName: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                                <input type="text" value={editingRecord.position} onChange={(e) => setEditingRecord({...editingRecord, position: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departemen</label>
                            <select value={editingRecord.deptName} onChange={(e) => setEditingRecord({...editingRecord, deptName: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50">
                                {deptsPlusExecutive.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gaji Pokok ($)</label>
                                <input type="number" value={editingRecord.baseSalary} onChange={(e) => setEditingRecord({...editingRecord, baseSalary: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bonus ($)</label>
                                <input type="number" value={editingRecord.bonus} onChange={(e) => setEditingRecord({...editingRecord, bonus: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penalti (Potongan)</label>
                            <select value={editingRecord.penaltyLevel} onChange={(e) => setEditingRecord({...editingRecord, penaltyLevel: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50">
                                <option value="NONE">Bersih (0%)</option>
                                <option value="SP1">SP 1 (Potong 50%)</option>
                                <option value="SP2">SP 2 (Potong 75%)</option>
                                <option value="SP3">SP 3 (Potong 100%)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catatan / Keterangan</label>
                            <textarea rows={3} value={editingRecord.notes} onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" placeholder="Contoh: Telat 2x, Kinerja Bagus..." />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => setEditingRecord(null)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            Batal
                        </button>
                        <button onClick={handleSaveEdit} className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                            💾 Simpan Perubahan
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* RATE CONFIG MODAL */}
      <AnimatePresence>
        {showRateModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowRateModal(false)}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Konfigurasi Gaji per Jam</h3>
                        <button onClick={() => setShowRateModal(false)} className="text-slate-500 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {/* Default Rate */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Rate Standar (Default)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">$</span>
                                <input 
                                    type="number" 
                                    value={defaultRate}
                                    onChange={(e) => setDefaultRate(Number(e.target.value))}
                                    className="w-20 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white text-right outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/10 my-4"></div>

                        {/* List Jabatan */}
                        {availableRoles.map(role => (
                            <div key={role} className="flex justify-between items-center group py-1">
                                {editingRoleKey === role ? (
                                    <div className="flex gap-2 flex-1 mr-2">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={tempRoleName}
                                            onChange={(e) => setTempRoleName(e.target.value)}
                                            className="w-full bg-slate-800 border border-amber-500/50 rounded px-2 py-1 text-xs text-white"
                                        />
                                        <button onClick={() => saveRoleName(role)} className="text-green-500 hover:text-white px-1">✓</button>
                                        <button onClick={() => setEditingRoleKey(null)} className="text-red-500 hover:text-white px-1">✕</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                        <span className="text-[10px] font-bold text-white uppercase truncate max-w-[150px] md:max-w-[200px]" title={role}>{role}</span>
                                        <button 
                                            onClick={() => startEditingRole(role)}
                                            className="text-[9px] text-slate-600 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Edit Nama Jabatan"
                                        >
                                            ✎
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteRate(role)}
                                            className="text-[9px] text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Hapus Konfigurasi"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">$</span>
                                    <input 
                                        type="number" 
                                        value={roleRates[role] || ''}
                                        placeholder={defaultRate.toString()}
                                        onChange={(e) => handleUpdateRate(role, Number(e.target.value))}
                                        className="w-20 bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-amber-500 font-bold text-right outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        ))}
                        
                        {/* Custom Role Input */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-[9px] text-slate-500 mb-2">Tambah Role Manual (Jika tidak ada di list):</p>
                            <div className="flex gap-2">
                                <input id="customRoleName" type="text" placeholder="Nama Jabatan" className="flex-1 bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white" />
                                <button 
                                    onClick={() => {
                                        const input = document.getElementById('customRoleName') as HTMLInputElement;
                                        if(input.value) {
                                            handleUpdateRate(input.value, defaultRate);
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-amber-500 text-slate-950 px-3 rounded text-[9px] font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 text-right">
                        <button onClick={() => setShowRateModal(false)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                            Selesai & Simpan
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Input Form with HR Sync */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-950 border border-amber-500/20 p-5 md:p-6 rounded-2xl space-y-6 overflow-hidden"
          >
            <div className="relative">
              <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">Cari Database HR (Staff Aktif)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onFocus={() => setShowHrDropdown(true)}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setNewRecord({...newRecord, staffName: e.target.value});
                    }}
                    placeholder="Nama ASN..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none"
                  />
                  <AnimatePresence>
                    {showHrDropdown && filteredEmployees.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        {filteredEmployees.map((emp, i) => (
                          <button 
                            key={i}
                            onClick={() => selectEmployee(emp)}
                            className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-amber-500">{emp.name}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-tight truncate">{emp.role}</p>
                            </div>
                            <span className="text-[7px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded uppercase flex-shrink-0">{emp.dept}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                <input type="text" value={newRecord.position} onChange={e => setNewRecord({...newRecord, position: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departemen</label>
                <select value={newRecord.deptName} onChange={e => setNewRecord({...newRecord, deptName: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                  {deptsPlusExecutive.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gaji Pokok ($)</label>
                <input type="number" value={newRecord.baseSalary} onChange={e => setNewRecord({...newRecord, baseSalary: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bonus ($)</label>
                <input type="number" value={newRecord.bonus} onChange={e => setNewRecord({...newRecord, bonus: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Penalti</label>
                <select value={newRecord.penaltyLevel} onChange={e => setNewRecord({...newRecord, penaltyLevel: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                  <option value="NONE">Bersih</option>
                  <option value="SP1">SP 1 (50%)</option>
                  <option value="SP2">SP 2 (75%)</option>
                  <option value="SP3">SP 3 (100%)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAdd} 
              className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20"
            >
              SIMPAN PAYROLL
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest">
              <tr>
                <th className="px-5 py-4">Penerima</th>
                <th className="px-5 py-4">Gaji</th>
                <th className="px-5 py-4">Bonus</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {salaries.map(s => {
                const net = calculateTotal(s.baseSalary, s.bonus, s.penaltyLevel);
                const isExec = s.deptName === 'Executive Office';
                const isAuto = s.id && s.id.startsWith('auto-'); 
                return (
                  <tr key={s.id} className={`hover:bg-white/[0.02] ${isExec ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isExec && <span className="text-amber-500">👑</span>}
                        {isAuto && <span className="text-blue-500" title="Data Otomatis">🤖</span>}
                        <div>
                          <p className="font-bold text-white truncate max-w-[120px]">{s.staffName}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{s.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                       <input 
                         type="number" 
                         value={s.baseSalary} 
                         onChange={(e) => updateRecord(s.id, 'baseSalary', Number(e.target.value))}
                         className="bg-transparent border-b border-transparent hover:border-white/20 text-slate-300 font-mono w-20 outline-none text-xs focus:border-amber-500 transition-all"
                       />
                    </td>
                    <td className="px-5 py-4">
                       <input 
                         type="number" 
                         value={s.bonus} 
                         onChange={(e) => updateRecord(s.id, 'bonus', Number(e.target.value))}
                         className="bg-transparent border-b border-transparent hover:border-white/20 text-green-400 font-mono w-16 outline-none text-xs focus:border-green-500 transition-all"
                       />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs md:text-sm font-black text-amber-500 font-mono">${net.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button 
                        onClick={() => setEditingRecord(s)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-500 p-1.5 rounded border border-white/5 transition-all"
                        title="Edit Detail"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setSelectedSlip(s)}
                        className="bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-white/10"
                      >
                        SLIP
                      </button>
                      <button onClick={() => deleteRecord(s.id)} className="text-slate-600 hover:text-red-500 p-1">✕</button>
                    </td>
                  </tr>
                );
              })}
              {salaries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600 uppercase tracking-widest text-[10px]">Belum ada data penggajian</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Discord Webhook</label>
        <input 
          type="text" 
          value={webhookUrl} 
          onChange={e => {
            setWebhookUrl(e.target.value);
            localStorage.setItem('ls_discord_webhook', e.target.value);
          }} 
          placeholder="https://discord.com/api/webhooks/..." 
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-[10px] text-white outline-none" 
        />
      </div>

      {/* Slip Gaji Modal */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSlip(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full h-full md:h-auto md:max-w-lg bg-white text-slate-950 p-6 md:p-10 md:rounded-xl shadow-2xl overflow-y-auto font-serif flex flex-col"
            >
              <div className="border-2 md:border-4 border-double border-slate-900 p-4 md:p-6 relative flex-1 md:flex-none">
                <div className="absolute top-2 right-2 md:top-4 md:right-4 text-[9px] font-bold text-slate-400">Ref: GOV/SAL/{selectedSlip.id.slice(-6)}</div>
                
                <div className="text-center mb-6 md:mb-8 mt-4 md:mt-0">
                   <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] border-b-2 border-slate-950 pb-2 inline-block">Official Salary Slip</h1>
                   <p className="text-[10px] font-bold mt-2 text-slate-600">STATE OF SAN ANDREAS GOVERNMENT</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-[10px] md:text-[11px] mb-6 md:mb-8">
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-0.5 md:mb-1">Employee Name</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{selectedSlip.staffName}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-0.5 md:mb-1">Department</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{selectedSlip.deptName}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-0.5 md:mb-1">Position</label>
                    <div className="font-bold border-b border-slate-200 pb-1 truncate">{selectedSlip.position}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-0.5 md:mb-1">Date</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{new Date().toLocaleDateString('id-ID')}</div>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 bg-slate-50 p-4 border border-slate-100">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Base Salary</span>
                    <span className="font-bold">${selectedSlip.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-blue-600">
                    <span>Bonus / OT</span>
                    <span className="font-bold">+${selectedSlip.bonus.toLocaleString()}</span>
                  </div>
                  {selectedSlip.notes && (
                      <div className="text-[9px] text-slate-500 italic mt-1 pb-2 border-b border-slate-200">
                          Catatan: {selectedSlip.notes}
                      </div>
                  )}
                  {selectedSlip.penaltyLevel !== 'NONE' && (
                    <div className="flex justify-between text-xs md:text-sm text-red-600">
                      <span>Penalty ({selectedSlip.penaltyLevel})</span>
                      <span className="font-bold">-${(selectedSlip.baseSalary * (selectedSlip.penaltyLevel === 'SP1' ? 0.5 : selectedSlip.penaltyLevel === 'SP2' ? 0.75 : 1)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-lg md:text-xl font-black">
                    <span>NET TOTAL</span>
                    <span>${calculateTotal(selectedSlip.baseSalary, selectedSlip.bonus, selectedSlip.penaltyLevel).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-auto">
                   <div className="text-[9px] text-slate-400 italic">Electronic generated doc.</div>
                   <div className="text-center">
                      <div className="w-20 md:w-24 h-px bg-slate-900 mb-1 mx-auto"></div>
                      <div className="text-[10px] font-black uppercase">Victoria Glass</div>
                      <div className="text-[8px] text-slate-500">State Treasurer</div>
                   </div>
                </div>
              </div>

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 no-print font-sans">
                <button 
                  onClick={() => handleSendToDiscord(selectedSlip)}
                  disabled={isSending}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {isSending ? 'MENGIRIM...' : '📤 DISCORD'}
                </button>
                <button 
                  onClick={() => setSelectedSlip(null)}
                  className="w-full sm:flex-1 bg-slate-100 text-slate-950 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalaryManager;
