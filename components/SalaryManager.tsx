
import React, { useState, useEffect, useMemo } from 'react';
import { SalaryRecord, Department, LeadershipMember, DeptInfo, StaffMember } from '../types';
import { sendToDiscord, formatSalarySlipEmbed } from '../services/discordService';
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

const SalaryManager: React.FC<SalaryManagerProps> = ({ leadership, depts }) => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalaryRecord | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHrDropdown, setShowHrDropdown] = useState(false);

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
    
    // Add Leadership
    leadership.forEach(l => {
      list.push({ name: l.name, role: l.role, dept: 'Executive Office', isLeader: true });
    });

    // Add All Dept Staff
    depts.forEach(d => {
      d.structuralStaff.forEach(s => {
        list.push({ name: s.name, role: s.role, dept: d.name, isLeader: false });
      });
    });

    return list;
  }, [leadership, depts]);

  const filteredEmployees = allEmployees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const saved = localStorage.getItem('ls_gov_salaries');
    if (saved) setSalaries(JSON.parse(saved));

    const savedUrl = localStorage.getItem('ls_discord_webhook');
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  const saveSalaries = (data: SalaryRecord[]) => {
    setSalaries(data);
    localStorage.setItem('ls_gov_salaries', JSON.stringify(data));
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

  const selectEmployee = (emp: FlatEmployee) => {
    setNewRecord({
      ...newRecord,
      staffName: emp.name,
      position: emp.role,
      deptName: emp.dept,
      baseSalary: emp.isLeader ? (emp.role.includes('Presiden') ? 50000 : 35000) : 10000
    });
    setSearchTerm(emp.name);
    setShowHrDropdown(false);
  };

  const deleteRecord = (id: string) => {
    saveSalaries(salaries.filter(s => s.id !== id));
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

  const deptsPlusExecutive = [...Object.values(Department), 'Executive Office'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 p-6 rounded-xl border border-white/5 gap-4">
        <div>
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Bendahara Negara</h3>
          <p className="text-[9px] text-slate-500">Sinkronisasi Database HR Aktif</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-amber-500 text-slate-950 text-[10px] font-black px-6 py-2.5 rounded uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          {isAdding ? 'TUTUP FORM' : '+ INPUT GAJI ASN'}
        </button>
      </div>

      {/* Input Form with HR Sync */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-950 border border-amber-500/20 p-6 rounded-2xl space-y-6 overflow-hidden"
          >
            <div className="relative">
              <label className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">Cari Database HR (Pilih Anggota)</label>
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
                    placeholder="Ketik nama atau jabatan ASN..."
                    className="w-full bg-slate-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none"
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
                              <p className="text-[9px] text-slate-500 uppercase tracking-tight">{emp.role}</p>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded uppercase">{emp.dept}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {showHrDropdown && (
                  <button onClick={() => setShowHrDropdown(false)} className="px-4 text-xs text-slate-500 hover:text-white">✕</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Jabatan</label>
                <input type="text" value={newRecord.position} onChange={e => setNewRecord({...newRecord, position: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" placeholder="Jabatan Resmi" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Departemen</label>
                <select value={newRecord.deptName} onChange={e => setNewRecord({...newRecord, deptName: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white">
                  {deptsPlusExecutive.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Gaji Pokok ($)</label>
                <input type="number" value={newRecord.baseSalary} onChange={e => setNewRecord({...newRecord, baseSalary: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Bonus ($)</label>
                <input type="number" value={newRecord.bonus} onChange={e => setNewRecord({...newRecord, bonus: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Status Penalti</label>
                <select value={newRecord.penaltyLevel} onChange={e => setNewRecord({...newRecord, penaltyLevel: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-xs text-white">
                  <option value="NONE">Bersih (Tanpa SP)</option>
                  <option value="SP1">SP 1 (Potong 50%)</option>
                  <option value="SP2">SP 2 (Potong 75%)</option>
                  <option value="SP3">SP 3 (Potong 100%)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAdd} 
              className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20"
            >
              SIMPAN KE PAYROLL NEGARA
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-white/5 text-slate-400 font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Penerima & Jabatan</th>
                <th className="px-6 py-4">Gaji Pokok</th>
                <th className="px-6 py-4">Penalti</th>
                <th className="px-6 py-4">Total Bersih</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {salaries.map(s => {
                const net = calculateTotal(s.baseSalary, s.bonus, s.penaltyLevel);
                const isExec = s.deptName === 'Executive Office';
                return (
                  <tr key={s.id} className={`hover:bg-white/[0.02] ${isExec ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isExec && <span className="text-amber-500 text-xs">👑</span>}
                        <div>
                          <p className="font-bold text-white">{s.staffName}</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-tighter">{s.position} • {s.deptName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">${s.baseSalary.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${s.penaltyLevel === 'NONE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                        {s.penaltyLevel === 'NONE' ? 'BERSIH' : s.penaltyLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-amber-500 font-mono">${net.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedSlip(s)}
                        className="bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold px-3 py-1.5 rounded uppercase tracking-widest border border-white/10"
                      >
                        LIHAT SLIP
                      </button>
                      <button onClick={() => deleteRecord(s.id)} className="text-slate-600 hover:text-red-500 p-1">✕</button>
                    </td>
                  </tr>
                );
              })}
              {salaries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600 uppercase tracking-widest text-[9px]">Belum ada data penggajian periode ini</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Discord Webhook</label>
        <input 
          type="text" 
          value={webhookUrl} 
          onChange={e => {
            setWebhookUrl(e.target.value);
            localStorage.setItem('ls_discord_webhook', e.target.value);
          }} 
          placeholder="https://discord.com/api/webhooks/..." 
          className="w-full bg-slate-950 border border-white/10 rounded px-4 py-2 text-[10px] text-white outline-none" 
        />
      </div>

      {/* Visual Modal (Remains same) */}
      <AnimatePresence>
        {selectedSlip && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSlip(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white text-slate-950 p-10 rounded-sm shadow-2xl overflow-hidden font-serif"
            >
              <div className="border-4 border-double border-slate-900 p-6 relative">
                <div className="absolute top-4 right-4 text-[8px] font-bold text-slate-400">Ref: GOV/SAL/{selectedSlip.id.slice(-6)}</div>
                
                <div className="text-center mb-8">
                   <h1 className="text-xl font-black uppercase tracking-[0.2em] border-b-2 border-slate-950 pb-2 inline-block">Official Salary Statement</h1>
                   <p className="text-[10px] font-bold mt-2 text-slate-600">STATE OF SAN ANDREAS GOVERNMENT</p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-[11px] mb-8">
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-1">Employee Name</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{selectedSlip.staffName}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-1">Department</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{selectedSlip.deptName}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-1">Position</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{selectedSlip.position}</div>
                  </div>
                  <div>
                    <label className="font-black uppercase text-slate-400 block mb-1">Payment Date</label>
                    <div className="font-bold border-b border-slate-200 pb-1">{new Date().toLocaleDateString('id-ID')}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-8 bg-slate-50 p-4 border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span>Base Salary</span>
                    <span className="font-bold">${selectedSlip.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Bonus / Overtime</span>
                    <span className="font-bold">+${selectedSlip.bonus.toLocaleString()}</span>
                  </div>
                  {selectedSlip.penaltyLevel !== 'NONE' && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Penalty ({selectedSlip.penaltyLevel})</span>
                      <span className="font-bold">-${(selectedSlip.baseSalary * (selectedSlip.penaltyLevel === 'SP1' ? 0.5 : selectedSlip.penaltyLevel === 'SP2' ? 0.75 : 1)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-xl font-black">
                    <span>TOTAL NET</span>
                    <span>${calculateTotal(selectedSlip.baseSalary, selectedSlip.bonus, selectedSlip.penaltyLevel).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                   <div className="text-[9px] text-slate-400 italic">This is an electronically generated document. <br/> No physical signature required.</div>
                   <div className="text-center">
                      <div className="w-24 h-px bg-slate-900 mb-1 mx-auto"></div>
                      <div className="text-[10px] font-black uppercase">Victoria Glass</div>
                      <div className="text-[8px] text-slate-500">State Treasurer</div>
                   </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4 no-print font-sans">
                <button 
                  onClick={() => handleSendToDiscord(selectedSlip)}
                  disabled={isSending}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSending ? 'MENGIRIM...' : '📤 KIRIM KE DISCORD'}
                </button>
                <button 
                  onClick={() => setSelectedSlip(null)}
                  className="flex-1 bg-slate-100 text-slate-950 py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
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
