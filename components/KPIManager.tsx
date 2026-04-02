
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AttendanceLog, PermissionLog, DeptInfo, LeadershipMember } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface KPIManagerProps {
  leadership: LeadershipMember[];
  depts: DeptInfo[];
}

interface StaffKPI {
    name: string;
    role: string;
    dept: string;
    dutyHours: number;
    daysPresent: number;
    daysIzin: number;
    daysAlpa: number;
    nip?: string;
}

const KPIManager: React.FC<KPIManagerProps> = ({ leadership, depts }) => {
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [permissionLogs, setPermissionLogs] = useState<PermissionLog[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterType, setFilterType] = useState<'WEEK' | 'MONTH'>('MONTH');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [targetDays, setTargetDays] = useState(20); // Default target days per month
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    // Manual Input State
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualForm, setManualForm] = useState({
        staffName: '',
        date: new Date().toISOString().split('T')[0],
        inTime: '08:00:00',
        outTime: '17:00:00',
        notes: ''
    });
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);

    const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const YEARS = [2025, 2026, 2027, 2028];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [attRes, permRes, usersRes] = await Promise.all([
                fetch('/api/attendance'),
                fetch('/api/permissions/logs'),
                fetch('/api/users')
            ]);
            
            if (attRes.ok) {
                const attData = await attRes.json();
                setAttendanceLogs(attData.map((row: any) => ({
                    staffName: row.staff_name || row.staffName || 'Unknown',
                    role: row.role || '-',
                    action: row.action || 'INFO',
                    timestamp: row.timestamp || new Date().toISOString()
                })));
            }

            if (permRes.ok) {
                const permData = await permRes.json();
                setPermissionLogs(permData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setAllUsers(usersData);
            }
        } catch (error) {
            console.error("Failed to fetch KPI data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const dateRange = useMemo(() => {
        const now = new Date();
        if (filterType === 'MONTH') {
            const start = new Date(selectedYear, selectedMonth, 1);
            const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
            return { start, end };
        } else {
            // This Week (Monday to Sunday)
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const start = new Date(today.setDate(diff));
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    }, [filterType, selectedMonth, selectedYear]);

    const kpiData = useMemo(() => {
        const startTs = dateRange.start.getTime();
        const endTs = dateRange.end.getTime();

        const filteredAtt = attendanceLogs.filter(log => {
            const t = new Date(log.timestamp).getTime();
            return t >= startTs && t <= endTs;
        });

        const filteredPerm = permissionLogs.filter(log => {
            const t = new Date(log.timestamp).getTime();
            return t >= startTs && t <= endTs;
        });

        const stats: Record<string, StaffKPI> = {};

        // Initialize with all approved users from Database
        allUsers.forEach(u => {
            const name = u.ic_name.trim();
            stats[name] = { 
                name: name, 
                role: u.role || 'STAFF', 
                dept: u.department_id || 'Umum', 
                nip: u.nip,
                dutyHours: 0, 
                daysPresent: 0, 
                daysIzin: 0, 
                daysAlpa: 0 
            };
        });

        // Also include anyone from logs who might not be in the users table (manual entry)
        filteredAtt.forEach(log => {
            const name = log.staffName.trim();
            if (!stats[name]) {
                stats[name] = { 
                    name: name, 
                    role: log.role || '-', 
                    dept: 'Manual/Guest', 
                    dutyHours: 0, 
                    daysPresent: 0, 
                    daysIzin: 0, 
                    daysAlpa: 0 
                };
            }
        });

        // Process Attendance
        const chronoAtt = [...filteredAtt].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const tempIn: Record<string, number> = {};
        const presentDays: Record<string, Set<string>> = {};

        chronoAtt.forEach(log => {
            const name = log.staffName;
            if (!stats[name]) return;

            const t = new Date(log.timestamp).getTime();
            const act = log.action.toUpperCase();
            const isEnter = act.includes('MASUK') || act.includes('IN') || act.includes('LOGIN');
            const isExit = act.includes('PULANG') || act.includes('OUT') || act.includes('KELUAR');

            if (isEnter) {
                if (!presentDays[name]) presentDays[name] = new Set();
                presentDays[name].add(new Date(log.timestamp).toLocaleDateString());
                if (!tempIn[name]) tempIn[name] = t;
            } else if (isExit && tempIn[name]) {
                const diff = t - tempIn[name];
                if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
                    stats[name].dutyHours += diff / (1000 * 60 * 60);
                }
                delete tempIn[name];
            }
        });

        Object.keys(presentDays).forEach(name => {
            if (stats[name]) stats[name].daysPresent = presentDays[name].size;
        });

        // Process Permissions
        filteredPerm.forEach(log => {
            const name = log.staff_name;
            if (!stats[name]) return;
            
            // Calculate days between start and end date
            if (log.start_date && log.end_date) {
                const s = new Date(log.start_date);
                const e = new Date(log.end_date);
                const diffTime = Math.abs(e.getTime() - s.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                stats[name].daysIzin += diffDays;
            } else {
                stats[name].daysIzin += 1;
            }
        });

        // Calculate Alpa
        Object.keys(stats).forEach(name => {
            const s = stats[name];
            const totalAccounted = s.daysPresent + s.daysIzin;
            s.daysAlpa = Math.max(0, targetDays - totalAccounted);
        });

        return Object.values(stats).filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.nip && s.nip.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => {
            const scoreA = Math.min(100, ((a.daysPresent / targetDays) * 70) + (Math.min(1, a.dutyHours / (targetDays * 2)) * 30));
            const scoreB = Math.min(100, ((b.daysPresent / targetDays) * 70) + (Math.min(1, b.dutyHours / (targetDays * 2)) * 30));
            return scoreB - scoreA;
        });

    }, [attendanceLogs, permissionLogs, dateRange, targetDays, searchTerm, leadership, depts, allUsers]);

    const chartData = useMemo(() => {
        return kpiData.slice(0, 10).map(s => {
            const attendanceRate = s.daysPresent / targetDays;
            const score = Math.min(100, (attendanceRate * 70) + (Math.min(1, s.dutyHours / (targetDays * 2)) * 30));
            return {
                originalName: s.name,
                name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
                Skor: Number(score.toFixed(1)),
                Hadir: s.daysPresent,
                Izin: s.daysIzin,
                Alpa: s.daysAlpa
            };
        });
    }, [kpiData, targetDays]);

    const summaryStats = useMemo(() => {
        if (kpiData.length === 0) return { title: 'Keseluruhan', avgScore: 0, totalPresent: 0, totalAlpa: 0, totalIzin: 0 };

        if (selectedStaff) {
            const staff = kpiData.find(s => s.name === selectedStaff);
            if (staff) {
                const attendanceRate = staff.daysPresent / targetDays;
                const score = Math.min(100, (attendanceRate * 70) + (Math.min(1, staff.dutyHours / (targetDays * 2)) * 30));
                return {
                    title: staff.name,
                    avgScore: score,
                    totalPresent: staff.daysPresent,
                    totalAlpa: staff.daysAlpa,
                    totalIzin: staff.daysIzin
                };
            }
        }

        let totalScore = 0;
        let totalPresent = 0;
        let totalAlpa = 0;
        let totalIzin = 0;

        kpiData.forEach(s => {
            const attendanceRate = s.daysPresent / targetDays;
            const score = Math.min(100, (attendanceRate * 70) + (Math.min(1, s.dutyHours / (targetDays * 2)) * 30));
            totalScore += score;
            totalPresent += s.daysPresent;
            totalAlpa += s.daysAlpa;
            totalIzin += s.daysIzin;
        });

        return {
            title: 'Rata-rata Keseluruhan',
            avgScore: totalScore / kpiData.length,
            totalPresent,
            totalAlpa,
            totalIzin
        };
    }, [kpiData, targetDays, selectedStaff]);

    const handleExportPDF = () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        
        // Wait for React to re-render the header before capturing
        setTimeout(async () => {
            try {
                if (!reportRef.current) return;
                const canvas = await html2canvas(reportRef.current, {
                    scale: 2,
                    backgroundColor: '#0f172a', // slate-900 to match theme
                    logging: false,
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                const period = filterType === 'MONTH' ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}` : 'Minggu Ini';
                pdf.save(`Laporan_KPI_${period.replace(' ', '_')}.pdf`);
            } catch (error) {
                console.error("Failed to export PDF", error);
                alert("Gagal mengekspor PDF. Silakan coba lagi.");
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    const handleSubmitManual = async () => {
        if (!manualForm.staffName || !manualForm.date || !manualForm.inTime || !manualForm.outTime) {
            alert("Mohon lengkapi semua data!");
            return;
        }

        setIsSubmittingManual(true);
        try {
            const user = allUsers.find(u => u.ic_name === manualForm.staffName);
            const role = user?.role || 'STAFF';
            
            // Convert to ISO strings
            const inTimestamp = new Date(`${manualForm.date}T${manualForm.inTime}`).toISOString();
            const outTimestamp = new Date(`${manualForm.date}T${manualForm.outTime}`).toISOString();
            
            const notes = `[MANUAL INPUT] ${manualForm.notes}`.trim();

            // Submit Clock In
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_name: manualForm.staffName,
                    role: role,
                    action: 'MASUK (Manual)',
                    notes: notes,
                    timestamp: inTimestamp
                })
            });

            // Submit Clock Out
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_name: manualForm.staffName,
                    role: role,
                    action: 'PULANG (Manual)',
                    notes: notes,
                    timestamp: outTimestamp
                })
            });

            alert("Data absensi manual berhasil disimpan!");
            setShowManualInput(false);
            setManualForm({
                staffName: '',
                date: new Date().toISOString().split('T')[0],
                inTime: '08:00:00',
                outTime: '17:00:00',
                notes: ''
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to submit manual attendance", error);
            alert("Gagal menyimpan data absensi manual.");
        } finally {
            setIsSubmittingManual(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-white/5">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">KPI & Performa Pegawai</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Monitoring Jam Duty, Izin, dan Alpa</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => { setFilterType('WEEK'); setTargetDays(5); }} 
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${filterType === 'WEEK' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                        >
                            Mingguan
                        </button>
                        <button 
                            onClick={() => { setFilterType('MONTH'); setTargetDays(20); }} 
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${filterType === 'MONTH' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                        >
                            Bulanan
                        </button>
                    </div>
                    {filterType === 'MONTH' && (
                        <div className="flex gap-2">
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-xl outline-none focus:border-amber-500"
                            >
                                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-950 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-xl outline-none focus:border-amber-500"
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button 
                        onClick={() => setShowManualInput(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 text-[10px] font-bold uppercase transition-all"
                    >
                        ➕ Input Manual
                    </button>
                    <button 
                        onClick={handleExportPDF} 
                        disabled={isExporting || kpiData.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl border border-emerald-500/20 text-[10px] font-bold uppercase transition-all disabled:opacity-50"
                    >
                        {isExporting ? (
                            <div className="w-3 h-3 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        )}
                        Export PDF
                    </button>
                </div>
            </div>

            <div ref={reportRef} className={`space-y-6 ${isExporting ? 'bg-slate-900 p-8' : 'bg-slate-950 p-2 md:p-4'} rounded-3xl`}>
                {/* Header for PDF */}
                {isExporting && (
                    <div className="text-center mb-8 pt-4">
                        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Laporan KPI Pegawai</h1>
                        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Periode: {filterType === 'MONTH' ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}` : 'Mingguan'}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Target Hari Kerja ({filterType === 'WEEK' ? 'Minggu' : 'Bulan'} Ini)</label>
                    <div className="flex items-center gap-3">
                        {isExporting ? (
                            <span className="text-xl font-bold text-white px-4 py-2">{targetDays}</span>
                        ) : (
                            <input 
                                type="number" 
                                value={targetDays}
                                onChange={(e) => setTargetDays(Number(e.target.value))}
                                className="bg-slate-950 border border-white/10 text-white text-xl font-bold px-4 py-2 rounded-xl w-24 outline-none focus:border-amber-500"
                            />
                        )}
                        <span className="text-xs text-slate-400 font-bold uppercase">Hari</span>
                    </div>
                </div>
                {!isExporting && (
                    <div className="md:col-span-2 bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center">
                        <div className="relative w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Cari Nama atau Departemen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 text-white text-sm px-12 py-3 rounded-xl outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {(!isExporting && kpiData.length > 0) && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                            Statistik: <span className="text-amber-500">{summaryStats.title}</span>
                        </h4>
                        {selectedStaff && (
                            <button 
                                onClick={() => setSelectedStaff(null)}
                                className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1 rounded-lg transition-colors uppercase font-bold"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rata-rata Skor</span>
                            <span className={`text-2xl font-black ${summaryStats.avgScore > 80 ? 'text-emerald-500' : summaryStats.avgScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {summaryStats.avgScore.toFixed(1)}%
                            </span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Hadir</span>
                            <span className="text-2xl font-black text-emerald-500">{summaryStats.totalPresent} <span className="text-xs text-slate-500">Hari</span></span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Izin</span>
                            <span className="text-2xl font-black text-amber-500">{summaryStats.totalIzin} <span className="text-xs text-slate-500">Hari</span></span>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Alpa</span>
                            <span className="text-2xl font-black text-rose-500">{summaryStats.totalAlpa} <span className="text-xs text-slate-500">Hari</span></span>
                        </div>
                    </div>
                </div>
            )}

            {chartData.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Top 10 Skor Performa</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#ffffff50" fontSize={10} tickFormatter={(val) => `${val}%`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                <Bar 
                                    dataKey="Skor" 
                                    fill="#f59e0b" 
                                    radius={[4, 4, 0, 0]} 
                                    onClick={(data) => setSelectedStaff(data.originalName)}
                                    cursor="pointer"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.Skor > 80 ? '#10b981' : entry.Skor > 50 ? '#f59e0b' : '#f43f5e'} 
                                            opacity={selectedStaff && selectedStaff !== entry.originalName ? 0.3 : 1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">NIP</th>
                                <th className="px-6 py-4">Pegawai</th>
                                <th className="px-6 py-4">Departemen</th>
                                <th className="px-6 py-4 text-center">Jam Duty</th>
                                <th className="px-6 py-4 text-center">Hadir</th>
                                <th className="px-6 py-4 text-center">Izin</th>
                                <th className="px-6 py-4 text-center">Alpa</th>
                                <th className="px-6 py-4 text-right">Skor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {kpiData.length > 0 ? kpiData.map((s, i) => {
                                const attendanceRate = s.daysPresent / targetDays;
                                const score = Math.min(100, (attendanceRate * 70) + (Math.min(1, s.dutyHours / (targetDays * 2)) * 30));
                                
                                return (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-amber-500/80">{s.nip || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white group-hover:text-amber-500 transition-colors">{s.name}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">{s.role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-950 border border-white/5 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {s.dept}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-blue-400 font-bold text-sm">{s.dutyHours.toFixed(1)}</span>
                                            <span className="text-[9px] text-slate-600 ml-1 uppercase">Jam</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-emerald-500 font-bold text-sm">{s.daysPresent}</span>
                                            <span className="text-[9px] text-slate-600 ml-1 uppercase">Hari</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-amber-500 font-bold text-sm">{s.daysIzin}</span>
                                            <span className="text-[9px] text-slate-600 ml-1 uppercase">Hari</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-mono font-bold text-sm ${s.daysAlpa > 0 ? 'text-rose-500' : 'text-slate-600'}`}>{s.daysAlpa}</span>
                                            <span className="text-[9px] text-slate-600 ml-1 uppercase">Hari</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-black text-sm ${score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                    {score.toFixed(0)}%
                                                </span>
                                                <div className="w-16 h-1 bg-slate-950 rounded-full mt-1 overflow-hidden border border-white/5">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <span className="text-4xl">📊</span>
                                            <p className="text-xs font-bold uppercase tracking-[0.3em]">Tidak ada data performa</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                <p className="text-[10px] text-amber-500/60 leading-relaxed italic">
                    * Skor performa dihitung berdasarkan persentase kehadiran (70%) dan intensitas jam duty (30%) terhadap target hari kerja yang ditentukan. Data Alpa dihitung otomatis dari (Target - [Hadir + Izin]).
                </p>
            </div>
            </div>

            {/* MANUAL INPUT MODAL */}
            <AnimatePresence>
                {showManualInput && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowManualInput(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Input Absen Manual</h3>
                                <button onClick={() => setShowManualInput(false)} className="text-slate-500 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pilih Pegawai</label>
                                    <select 
                                        value={manualForm.staffName} 
                                        onChange={(e) => setManualForm({...manualForm, staffName: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                                    >
                                        <option value="">-- Pilih Pegawai --</option>
                                        {allUsers.map(u => <option key={u.id} value={u.ic_name}>{u.ic_name} ({u.role})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={manualForm.date} 
                                        onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waktu Masuk</label>
                                        <input 
                                            type="time" 
                                            step="1"
                                            value={manualForm.inTime} 
                                            onChange={(e) => setManualForm({...manualForm, inTime: e.target.value})}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waktu Pulang</label>
                                        <input 
                                            type="time" 
                                            step="1"
                                            value={manualForm.outTime} 
                                            onChange={(e) => setManualForm({...manualForm, outTime: e.target.value})}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catatan</label>
                                    <textarea 
                                        rows={2} 
                                        value={manualForm.notes} 
                                        onChange={(e) => setManualForm({...manualForm, notes: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50" 
                                        placeholder="Alasan input manual..." 
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button onClick={() => setShowManualInput(false)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSubmitManual} 
                                    disabled={isSubmittingManual || !manualForm.staffName || !manualForm.date || !manualForm.inTime || !manualForm.outTime}
                                    className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                >
                                    {isSubmittingManual ? 'Menyimpan...' : '💾 Simpan Data'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KPIManager;
