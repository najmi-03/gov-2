import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Camera, Lock, Mail, CreditCard, Building, Banknote } from 'lucide-react';
import { AuthState } from '../types';
import { updateProfile } from '../services/authService';

interface ProfilePageProps {
  auth: AuthState;
  onUpdateAuth: (updates: Partial<AuthState>) => void;
  onLogout: () => void;
}

export default function ProfilePage({ auth, onUpdateAuth, onLogout }: ProfilePageProps) {
  const [icName, setIcName] = useState(auth.staffName || '');
  const [avatarUrl, setAvatarUrl] = useState(auth.avatar_url || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ text: 'Password dan Konfirmasi Password tidak cocok.', type: 'error' });
      return;
    }
    
    if (!auth.username) {
      setMessage({ text: 'Gagal mengidentifikasi user.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile(auth.username, icName, password || undefined, avatarUrl);
    
    setIsSaving(false);
    
    if (result.success) {
      setMessage({ text: 'Profil berhasil diperbarui.', type: 'success' });
      onUpdateAuth({ staffName: icName, avatar_url: avatarUrl });
      setPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ text: result.error || 'Gagal memperbarui profil.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-transparent text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-900 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-500" />
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 group-hover:scale-110">
                <Camera className="w-5 h-5 text-white" />
                <input 
                  type="text"
                  id="avatar-upload"
                  className="hidden"
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{auth.staffName || 'Citizen'}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50">
                  <CreditCard className="w-4 h-4" />
                  NIP: {auth.nip || '-'}
                </span>
                <span className="flex items-center gap-1 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50">
                  <Building className="w-4 h-4" />
                  Dept: {auth.department || '-'}
                </span>
                <span className="flex items-center gap-1 bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800/50">
                  <User className="w-4 h-4" />
                  Role: {auth.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Salary Card */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-400" />
                Informasi Gaji
              </h2>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 text-center">
                <p className="text-sm text-slate-400 mb-1">Gaji per Jam (Estimasi)</p>
                <p className="text-3xl font-bold text-green-400">
                  ${(auth.salary_per_hour || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-6">Pengaturan Akun</h2>
              
              {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${
                  message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nama IC</label>
                  <input
                    type="text"
                    value={icName}
                    onChange={(e) => setIcName(e.target.value)}
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">URL Foto Profil</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  <p className="mt-2 text-xs text-slate-500">Gunakan link gambar langsung (.jpg, .png, .gif)</p>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-400" />
                    Ubah Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Password Baru</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Konfirmasi Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
