
import React, { useState } from 'react';
import { PermissionConfig } from '../types';

interface PermissionManagerProps {
  permissions: PermissionConfig[];
  setPermissions: (permissions: PermissionConfig[]) => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ permissions, setPermissions }) => {
  const getWebhook = (key: string) => localStorage.getItem(key) || '';
  const setWebhook = (key: string, url: string) => {
    localStorage.setItem(key, url);
    // Force re-render not needed as we read from LS on render for inputs, but better to manage state in parent if possible.
    // However, for this simple case, we just rely on parent re-rendering or user interaction.
    // Ideally we update a state to trigger re-render.
    // Let's assume parent passes a state update function if needed, but here we just update LS.
  };

  // State local untuk memaksa update UI saat webhook berubah
  const [, setTick] = useState(0); 

  const handleWebhookChange = (key: string, val: string) => {
      setWebhook(key, val);
      setTick(t => t + 1);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 border-l-4 border-amber-500">
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <span>⚙️</span> Konfigurasi Izin Pegawai
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
          Atur jenis izin yang tersedia dan link Webhook Discord tujuan untuk setiap laporan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {permissions.map((perm) => (
          <div key={perm.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex flex-col gap-4">
             <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                 <span className="text-2xl">{perm.icon}</span>
                 <div>
                     <h4 className="font-bold text-white text-sm">{perm.title}</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: perm.color }}></div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono">{perm.color}</span>
                     </div>
                 </div>
             </div>
             
             <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Webhook Discord</label>
                <input 
                    type="text" 
                    value={getWebhook(perm.webhookKey)}
                    onChange={(e) => handleWebhookChange(perm.webhookKey, e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-2 text-[10px] text-white outline-none focus:border-blue-500/50"
                />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionManager;
