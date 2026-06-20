import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Database, 
  Link as LinkIcon, 
  RefreshCw, 
  Save, 
  Wand2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- MOCK DATA ---
const MOCK_WEBHOOK_PAYLOAD = {
  "cust_nm": "Budi Santoso",
  "usr_mail": "budi.santoso@example.com",
  "trx_id": "INV-2026-0899",
  "amt": 250000,
  "stat": "PAID",
  "x_ref_code": "REF-XYZ-123"
};

type InternalField = { id: string; label: string; type: string; required: boolean };
type FeatureGroup = { id: string; name: string; fields: InternalField[] };

const INTERNAL_FEATURES: FeatureGroup[] = [
  {
    id: "crm", 
    name: "Data Pelanggan (CRM)", 
    fields: [
      { id: "crm_name", label: "Nama Lengkap", type: "text", required: true },
      { id: "crm_email", label: "Alamat Email", type: "email", required: true },
      { id: "crm_phone", label: "Nomor WhatsApp", type: "text", required: false },
    ]
  },
  {
    id: "inv", 
    name: "Sistem Invoice & Pembayaran", 
    fields: [
      { id: "inv_id", label: "Nomor Invoice", type: "text", required: true },
      { id: "inv_amount", label: "Total Pembayaran", type: "number", required: true },
      { id: "inv_status", label: "Status Pembayaran", type: "text", required: true },
      { id: "inv_notes", label: "Catatan Tambahan", type: "text", required: false },
    ]
  }
];

// --- COMPONENT ---
export default function WebhookMapper() {
  const [isListening, setIsListening] = useState(false);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simulate catching a webhook
  const handleCatchWebhook = () => {
    setIsListening(true);
    setPayload(null);
    setMapping({});
    setSaved(false);
    
    // Fake delay to simulate network request
    setTimeout(() => {
      setPayload(MOCK_WEBHOOK_PAYLOAD);
      setIsListening(false);
    }, 1500);
  };

  // Handle dropdown change
  const handleMapChange = (webhookKey: string, internalFieldId: string) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      if (internalFieldId === "") {
        delete newMapping[webhookKey];
      } else {
        newMapping[webhookKey] = internalFieldId;
      }
      return newMapping;
    });
    setSaved(false);
  };

  // Auto-map feature (Smart Suggestion)
  const handleAutoMap = () => {
    if (!payload) return;
    
    const suggestions: Record<string, string> = {};
    const keys = Object.keys(payload);
    
    // Simple mock logic for auto-mapping based on keywords
    keys.forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('nm') || lowerKey.includes('name')) suggestions[key] = 'crm_name';
      if (lowerKey.includes('mail')) suggestions[key] = 'crm_email';
      if (lowerKey.includes('trx') || lowerKey.includes('id')) suggestions[key] = 'inv_id';
      if (lowerKey.includes('amt') || lowerKey.includes('amount')) suggestions[key] = 'inv_amount';
      if (lowerKey.includes('stat')) suggestions[key] = 'inv_status';
    });

    setMapping(suggestions);
    setSaved(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
    }, 800);
  };

  // Helper to get field label by ID
  const getFieldLabel = (fieldId: string) => {
    for (const group of INTERNAL_FEATURES) {
      const field = group.fields.find(f => f.id === fieldId);
      if (field) return `${group.name} - ${field.label}`;
    }
    return "";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            Integrasi Webhook
          </h1>
          <p className="text-gray-500 mt-1">
            Hubungkan data dari aplikasi luar ke fitur internal kita tanpa pusing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-sm text-gray-500 font-mono">https://api.appkita.com/wh/v1/xyz</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Copy URL</button>
          </div>
        </div>
      </div>

      {/* Step 1: Catch Data */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-semibold text-gray-800">Tangkap Sample Data</h2>
          </div>
          <button 
            onClick={handleCatchWebhook}
            disabled={isListening}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isListening ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Menunggu Data...</>
            ) : (
              <><Database className="w-4 h-4" /> Simulasikan Terima Data</>
            )}
          </button>
        </div>
        
        {!payload && !isListening && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
            <Database className="w-12 h-12 text-gray-300 mb-3" />
            <p>Belum ada data webhook yang diterima.</p>
            <p className="text-sm mt-1">Klik tombol di atas untuk mensimulasikan penerimaan data dari aplikasi luar.</p>
          </div>
        )}

        {isListening && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-blue-500">
            <RefreshCw className="w-12 h-12 animate-spin mb-3 opacity-50" />
            <p className="animate-pulse">Mendengarkan event webhook...</p>
          </div>
        )}

        {payload && !isListening && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-green-50/50 border-t border-green-100"
          >
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Berhasil menangkap 1 payload baru!</span>
            </div>
            <p className="text-sm text-green-600/80">Data ini akan digunakan sebagai referensi untuk melakukan mapping ke fitur internal.</p>
          </motion.div>
        )}
      </div>

      {/* Step 2: Visual Mapper */}
      {payload && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Pasangkan Data (Mapping)</h2>
                <p className="text-sm text-gray-500">Pilih data dari luar ingin dimasukkan ke form/fitur mana.</p>
              </div>
            </div>
            
            <button 
              onClick={handleAutoMap}
              className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Map Cerdas
            </button>
          </div>

          <div className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-5 pl-2">Data dari Luar (Webhook)</div>
              <div className="col-span-2 flex justify-center"><ArrowRightLeft className="w-4 h-4 opacity-50" /></div>
              <div className="col-span-5">Fitur Internal Kita</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {Object.entries(payload).map(([key, value]) => {
                const isMapped = !!mapping[key];
                
                return (
                  <div key={key} className={cn(
                    "grid grid-cols-12 gap-4 p-4 items-center transition-colors",
                    isMapped ? "bg-blue-50/30" : "hover:bg-gray-50"
                  )}>
                    {/* Left Column: Webhook Data */}
                    <div className="col-span-5 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {key}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 pl-1">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Contoh:</span>
                        <span className="truncate max-w-[200px] text-gray-700">
                          {typeof value === 'string' ? `"${value}"` : value}
                        </span>
                      </div>
                    </div>

                    {/* Middle Column: Arrow */}
                    <div className="col-span-2 flex justify-center items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isMapped ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                      )}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Right Column: Internal Feature Dropdown */}
                    <div className="col-span-5">
                      <select
                        value={mapping[key] || ""}
                        onChange={(e) => handleMapChange(key, e.target.value)}
                        className={cn(
                          "w-full p-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white",
                          isMapped ? "border-blue-300 text-blue-900 font-medium" : "border-gray-300 text-gray-600"
                        )}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                      >
                        <option value="">-- Jangan masukkan ke mana-mana (Abaikan) --</option>
                        
                        {INTERNAL_FEATURES.map(group => (
                          <optgroup key={group.id} label={group.name} className="font-semibold text-gray-900 bg-gray-50">
                            {group.fields.map(field => (
                              <option key={field.id} value={field.id} className="font-normal text-gray-700 bg-white">
                                {field.label} {field.required ? '(Wajib)' : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      
                      {isMapped && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terhubung ke <strong>{getFieldLabel(mapping[key])}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing Required Fields Warning */}
          {(() => {
            const mappedFieldIds = Object.values(mapping);
            const missingRequired: string[] = [];
            
            INTERNAL_FEATURES.forEach(group => {
              group.fields.forEach(field => {
                if (field.required && !mappedFieldIds.includes(field.id)) {
                  missingRequired.push(`${group.name} - ${field.label}`);
                }
              });
            });

            if (missingRequired.length > 0) {
              return (
                <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Perhatian: Ada Field Wajib yang Belum Terhubung</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Fitur internal Anda membutuhkan data berikut agar bisa berjalan normal:
                    </p>
                    <ul className="list-disc list-inside text-sm text-amber-700 mt-1 ml-1">
                      {missingRequired.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-4">
            {saved && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-medium text-green-600 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Mapping Tersimpan!
              </motion.span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving || Object.keys(mapping).length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Integrasi</>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
