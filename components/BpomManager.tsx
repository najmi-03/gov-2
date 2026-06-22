import React, { useState, useEffect } from 'react';
import { BpomRecord } from '../types';
import { fetchFromDatabase, saveToDatabase } from '../services/databaseService';
import { Plus, Edit2, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

const BpomManager: React.FC = () => {
  const [records, setRecords] = useState<BpomRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Omit<BpomRecord, 'id'>>({
    productName: '',
    manufacturer: '',
    status: 'Aman',
    registrationNumber: '',
    imageUrl: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchFromDatabase('BPOM');
    if (data) setRecords(data);
    setIsLoading(false);
  };

  const saveData = async (newData: BpomRecord[]) => {
    setIsSaving(true);
    const success = await saveToDatabase('BPOM', newData);
    if (success) {
      setRecords(newData);
    } else {
      alert('Gagal menyimpan data ke database.');
    }
    setIsSaving(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.manufacturer.trim()) return;

    let updatedRecords;
    if (editingId) {
      updatedRecords = records.map(r => r.id === editingId ? { ...form, id: editingId } : r);
    } else {
      const newRecord: BpomRecord = {
        ...form,
        id: Date.now().toString()
      };
      updatedRecords = [...records, newRecord];
    }

    saveData(updatedRecords);
    resetForm();
  };

  const handleEdit = (record: BpomRecord) => {
    setEditingId(record.id);
    setForm({
      productName: record.productName,
      manufacturer: record.manufacturer,
      status: record.status,
      registrationNumber: record.registrationNumber || '',
      imageUrl: record.imageUrl || ''
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus record ini?')) return;
    const updatedRecords = records.filter(r => r.id !== id);
    saveData(updatedRecords);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ productName: '', manufacturer: '', status: 'Aman', registrationNumber: '', imageUrl: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Manajemen Status BPOM</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Produk</label>
              <input 
                type="text" 
                required 
                value={form.productName} 
                onChange={(e) => setForm({...form, productName: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Produsen / Pabrik</label>
              <input 
                type="text" 
                required 
                value={form.manufacturer} 
                onChange={(e) => setForm({...form, manufacturer: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Registrasi (Opsional)</label>
              <input 
                type="text" 
                value={form.registrationNumber || ''} 
                onChange={(e) => setForm({...form, registrationNumber: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Foto (Opsional)</label>
              <input 
                type="text" 
                value={form.imageUrl || ''} 
                onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50"
                placeholder="https://... (Pastikan Direct Link berakhiran .jpg/.png)"
              />
              <p className="text-[10px] text-slate-500 mt-1">Gunakan "Direct Link" jika dari Postimg atau Discord.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value as any})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50"
              >
                <option value="Aman">Aman / Legal</option>
                <option value="Berbahaya">Berbahaya / Ilegal</option>
                <option value="Belum Terdaftar">Belum Terdaftar</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Produk')}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>

        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="text-center p-8 text-slate-500">Memuat data BPOM...</div>
          ) : records.length === 0 ? (
            <div className="text-center p-8 text-slate-500">Belum ada data.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 border-b border-white/5 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Produsen</th>
                  <th className="px-6 py-4">No. Registrasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{record.productName}</td>
                    <td className="px-6 py-4">{record.manufacturer}</td>
                    <td className="px-6 py-4 font-mono text-xs">{record.registrationNumber || '-'}</td>
                    <td className="px-6 py-4">
                      {record.status === 'Aman' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wide">
                          Aman
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wide">
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(record)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BpomManager;
