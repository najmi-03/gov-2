
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingUser {
  id: number;
  username: string;
  ic_name: string;
  requested_role: string;
  requested_department: string;
  created_at: string;
}

const UserApprovalManager: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [availableJabatan, setAvailableJabatan] = useState<string[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [newJabatan, setNewJabatan] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [nipInputs, setNipInputs] = useState<Record<number, string>>({});
  const [usernameInputs, setUsernameInputs] = useState<Record<number, string>>({});
  const [roleInputs, setRoleInputs] = useState<Record<number, string>>({});
  const [deptInputs, setDeptInputs] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, jabatanRes, deptRes] = await Promise.all([
        fetch('/api/admin/pending-users'),
        fetch('/api/jabatan'),
        fetch('/api/departement')
      ]);
      
      if (!usersRes.ok || !jabatanRes.ok || !deptRes.ok) {
        throw new Error("Gagal mengambil data dari server");
      }

      const users = await usersRes.json();
      const jabatan = await jabatanRes.json();
      const depts = await deptRes.json();
      
      setPendingUsers(Array.isArray(users) ? users : []);
      setAvailableJabatan(Array.isArray(jabatan) ? jabatan : []);
      setAvailableDepartments(Array.isArray(depts) ? depts : []);

      // Initialize inputs with requested values
      if (Array.isArray(users)) {
        const initialRoles: Record<number, string> = {};
        const initialDepts: Record<number, string> = {};
        users.forEach(u => {
          initialRoles[u.id] = u.requested_role || 'STAFF';
          initialDepts[u.id] = u.requested_department || 'UNASSIGNED';
        });
        setRoleInputs(initialRoles);
        setDeptInputs(initialDepts);
      }
    } catch (err) {
      showToast("Gagal mengambil data", "error");
      setPendingUsers([]);
      setAvailableJabatan([]);
      setAvailableDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (userId: number) => {
    const nip = nipInputs[userId];
    const username = usernameInputs[userId];
    const role = roleInputs[userId];
    const department = deptInputs[userId];

    if (!nip) {
      showToast("Harap isi NIP Pegawai!", "error");
      return;
    }
    if (!username) {
      showToast("Harap isi Username Login!", "error");
      return;
    }

    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'APPROVED', role, nip, username, department })
      });
      if (res.ok) {
        showToast("User disetujui dengan NIP: " + nip, "success");
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyetujui user", "error");
      }
    } catch (err) {
      showToast("Gagal menyetujui user", "error");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleReject = async (userId: number) => {
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'REJECTED' })
      });
      if (res.ok) {
        showToast("User ditolak", "success");
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        showToast("Gagal menolak user", "error");
      }
    } catch (err) {
      showToast("Gagal menolak user", "error");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAddJabatan = async () => {
    if (!newJabatan) return;
    const updatedJabatan = [...availableJabatan, newJabatan];
    try {
      const res = await fetch('/api/jabatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jabatan: updatedJabatan })
      });
      if (res.ok) {
        setAvailableJabatan(updatedJabatan);
        setNewJabatan('');
        showToast("Jabatan ditambahkan", "success");
      }
    } catch (err) {
      showToast("Gagal menambah jabatan", "error");
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment) return;
    const updatedDepts = [...availableDepartments, newDepartment];
    try {
      const res = await fetch('/api/departement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departement: updatedDepts })
      });
      if (res.ok) {
        setAvailableDepartments(updatedDepts);
        setNewDepartment('');
        showToast("Departemen ditambahkan", "success");
      }
    } catch (err) {
      showToast("Gagal menambah departemen", "error");
    }
  };

  const handleRemoveJabatan = async (jabatanToRemove: string) => {
    const updatedJabatan = availableJabatan.filter(j => j !== jabatanToRemove);
    try {
      const res = await fetch('/api/jabatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jabatan: updatedJabatan })
      });
      if (res.ok) {
        setAvailableJabatan(updatedJabatan);
        showToast("Jabatan dihapus", "success");
      }
    } catch (err) {
      showToast("Gagal menghapus jabatan", "error");
    }
  };

  const handleRemoveDepartment = async (deptToRemove: string) => {
    const updatedDepts = availableDepartments.filter(d => d !== deptToRemove);
    try {
      const res = await fetch('/api/departement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departement: updatedDepts })
      });
      if (res.ok) {
        setAvailableDepartments(updatedDepts);
        showToast("Departemen dihapus", "success");
      }
    } catch (err) {
      showToast("Gagal menghapus departemen", "error");
    }
  };

  const handleResetJabatan = async () => {
    if (!confirm("Reset semua jabatan ke pengaturan awal?")) return;
    const defaultJabatan = [
      "STAFF MAGANG",
      "STAFF JUNIOR",
      "STAFF SENIOR",
      "SEKRETARIS DEPARTEMEN",
      "BENDAHARA DEPARTEMEN",
      "KEPALA DIVISI",
      "WAKIL KEPALA DEPARTEMEN",
      "KEPALA DEPARTEMEN"
    ];
    try {
      const res = await fetch('/api/jabatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jabatan: defaultJabatan })
      });
      if (res.ok) {
        setAvailableJabatan(defaultJabatan);
        showToast("Jabatan direset ke default", "success");
      }
    } catch (err) {
      showToast("Gagal meriset jabatan", "error");
    }
  };

  const handleResetDepartments = async () => {
    if (!confirm("Reset semua departemen ke pengaturan awal?")) return;
    const defaultDepts = [
      "DEPARTEMEN KEADILAN",
      "DEPARTEMEN KEUANGAN",
      "DEPARTEMEN KESEHATAN",
      "DEPARTEMEN KEAMANAN",
      "DEPARTEMEN PERHUBUNGAN",
      "DEPARTEMEN SOSIAL"
    ];
    try {
      const res = await fetch('/api/departement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departement: defaultDepts })
      });
      if (res.ok) {
        setAvailableDepartments(defaultDepts);
        showToast("Departemen direset ke default", "success");
      }
    } catch (err) {
      showToast("Gagal meriset departemen", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl border ${
              toast.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* PENDING USERS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Persetujuan Akun Baru</h3>
            <button onClick={fetchData} className="text-[10px] text-slate-500 hover:text-white transition-colors">🔄 REFRESH</button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-slate-500 text-xs">Tidak ada pendaftaran akun yang tertunda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-amber-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 font-bold text-lg">
                      {user.ic_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">{user.ic_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-950/50 px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Role:</span>
                          <select 
                            value={roleInputs[user.id] || ''}
                            onChange={e => setRoleInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
                            className="bg-transparent border-none text-[10px] font-bold text-amber-500 outline-none cursor-pointer"
                          >
                            {availableJabatan.map(j => (
                              <option key={j} value={j} className="bg-slate-900">{j}</option>
                            ))}
                            {!availableJabatan.includes(user.requested_role) && (
                              <option value={user.requested_role} className="bg-slate-900">{user.requested_role}</option>
                            )}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-950/50 px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Dept:</span>
                          <select 
                            value={deptInputs[user.id] || ''}
                            onChange={e => setDeptInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
                            className="bg-transparent border-none text-[10px] font-bold text-blue-400 outline-none cursor-pointer"
                          >
                            {availableDepartments.map(d => (
                              <option key={d} value={d} className="bg-slate-900">{d}</option>
                            ))}
                            {!availableDepartments.includes(user.requested_department) && (
                              <option value={user.requested_department} className="bg-slate-900">{user.requested_department}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <label className="text-[8px] font-bold text-slate-500 uppercase px-1 mb-1 block">Tentukan NIP Pegawai</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: NIP-001"
                          value={nipInputs[user.id] || ''}
                          onChange={e => setNipInputs(prev => ({ ...prev, [user.id]: e.target.value.toUpperCase() }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-500 uppercase px-1 mb-1 block">Username Login (Wajib)</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: budi_keren"
                          value={usernameInputs[user.id] || ''}
                          onChange={e => setUsernameInputs(prev => ({ ...prev, [user.id]: e.target.value.toLowerCase() }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReject(user.id)}
                        disabled={processingIds.has(user.id)}
                        className="px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                      >
                        {processingIds.has(user.id) ? '...' : 'TOLAK'}
                      </button>
                      <button 
                        onClick={() => handleApprove(user.id)}
                        disabled={processingIds.has(user.id)}
                        className="px-6 py-2 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                      >
                        {processingIds.has(user.id) ? 'PROSES...' : 'SETUJUI'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JABATAN & DEPT MANAGEMENT */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* JABATAN */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Jabatan</h3>
              <button 
                onClick={handleResetJabatan}
                className="text-[8px] font-bold text-slate-600 hover:text-amber-500 transition-colors uppercase tracking-tighter active:scale-95"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Baru..." 
                  value={newJabatan}
                  onChange={e => setNewJabatan(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                />
                <button 
                  onClick={handleAddJabatan}
                  className="bg-amber-500 text-slate-950 px-4 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all active:scale-95"
                >
                  +
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {availableJabatan.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-600">Kosong.</p>
                  </div>
                ) : (
                  availableJabatan.map(jabatan => (
                    <div key={jabatan} className="flex justify-between items-center p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all">
                      <span className="text-[10px] font-bold text-slate-300 tracking-wider">{jabatan}</span>
                      <button 
                        onClick={() => handleRemoveJabatan(jabatan)}
                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DEPARTEMEN */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Departemen</h3>
              <button 
                onClick={handleResetDepartments}
                className="text-[8px] font-bold text-slate-600 hover:text-amber-500 transition-colors uppercase tracking-tighter active:scale-95"
              >
                Reset
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Baru..." 
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                />
                <button 
                  onClick={handleAddDepartment}
                  className="bg-amber-500 text-slate-950 px-4 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all active:scale-95"
                >
                  +
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {availableDepartments.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-600">Kosong.</p>
                  </div>
                ) : (
                  availableDepartments.map(dept => (
                    <div key={dept} className="flex justify-between items-center p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-all">
                      <span className="text-[10px] font-bold text-slate-300 tracking-wider">{dept}</span>
                      <button 
                        onClick={() => handleRemoveDepartment(dept)}
                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'
            }`}
          >
            <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserApprovalManager;
