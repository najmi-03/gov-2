import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckSquare, X, Play, Trash2, Upload } from 'lucide-react';

interface ParsedLog {
  id: string;
  username: string;
  clockIn: string;
  clockOut: string;
  duration: string;
  durationHours: number;
}

interface DutyLogParserProps {
  onImportToDatabase: (logs: ParsedLog[]) => void;
}

const DutyLogParser: React.FC<DutyLogParserProps> = ({ onImportToDatabase }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedLog[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert("Hanya mendukung upload file .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRawText(prev => prev ? prev + '\n\n' + content : content);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Regex pattern to extract data directly from the text format
  const parseLogs = () => {
    setIsParsing(true);
    const results: ParsedLog[] = [];
    
    // Pecah jadi baris, bersihkan karakter markdown dan spasi ekstra
    const lines = rawText.split('\n').map(l => l.replace(/[\*\_`]/g, '').trim()).filter(l => l.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes('Clock In:')) {
            let clockIn = line.split('Clock In:')[1].trim();
            let name = "";
            let clockOut = "";
            let durationStr = "";

            // Cari nama di text baris-baris sebelumnya (maksimal 5 baris atas)
            for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
                const prev = lines[j].toLowerCase();
                if (!prev.includes('duty') && !prev.includes('bossmenu') && !prev.includes('app')) {
                   name = lines[j];
                   break;
                }
            }

            // Cek apakah di baris yang sama, atau baris setelahnya (maksimal 5 baris bawah) ada Clock Out / Duration
            for (let j = i; j <= Math.min(lines.length - 1, i + 5); j++) {
               const forwardLine = lines[j];
               if (forwardLine.includes('Clock Out:')) {
                 clockOut = forwardLine.split('Clock Out:')[1].trim();
               }
               if (forwardLine.includes('Duration:')) {
                 durationStr = forwardLine.split('Duration:')[1].trim();
               }
            }

            if (name && clockIn && clockOut && durationStr) {
                // Kalkulasi jam
                const parts = durationStr.split(':');
                let hours = 0;
                if (parts.length >= 2) {
                    hours = parseInt(parts[0], 10) + (parseInt(parts[1], 10) / 60);
                    if (parts.length >= 3) {
                        hours += parseInt(parts[2], 10) / 3600;
                    }
                }
                
                results.push({
                    id: `parsed-${Date.now()}-${results.length}`,
                    username: name,
                    clockIn,
                    clockOut,
                    duration: durationStr,
                    durationHours: hours
                });
            }
        }
    }

    setParsedData(results);
    setIsParsing(false);
  };

  const handleAggregateAndImport = () => {
    if (parsedData.length === 0) return;
    
    // Pass raw parsed data to Attendance page to inject into DB
    onImportToDatabase(parsedData);
    
    setIsOpen(false);
    setRawText('');
    setParsedData([]);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-xl text-[9px] font-bold uppercase border border-indigo-500/30 transition-all flex items-center gap-2"
      >
        <Clock className="w-3 h-3" /> PARSE LOG DISCORD
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Parser Duty Log Discord
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tempelkan copy-paste history chat dari channel #📋・duty-government ke kotak di bawah ini.
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                
                {/* Left Side: Input Text Area */}
                <div className="w-full md:w-1/2 flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border border-white/10 rounded-t-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       Input Teks Raw
                       <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded text-[9px] flex items-center gap-1 transition-colors">
                          <Upload className="w-3 h-3" /> Upload .txt
                          <input type="file" ref={fileInputRef} accept=".txt" className="hidden" onChange={handleFileUpload} />
                       </label>
                    </span>
                    <button 
                      onClick={() => setRawText('')} 
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Bersihkan
                    </button>
                  </div>
                  <textarea 
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Contoh format:&#10;**Oliver** Clock In: 2026-06-09 14:00:00 Clock Out: ... Duration: 02:30:00 Auto-generated by mi-bossmenu.&#10;&#10;Atau klik Upload .txt untuk mengunggah history logs dari Discord."
                    className="flex-1 bg-slate-950 border border-white/5 rounded-b-xl p-4 text-xs text-slate-300 font-mono outline-none focus:border-indigo-500/50 resize-none custom-scrollbar"
                  />
                  <button 
                    onClick={parseLogs}
                    disabled={!rawText || isParsing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isParsing ? 'Memproses...' : <><Play className="w-4 h-4 fill-current" /> Ekstrak Data</>}
                  </button>
                </div>

                {/* Right Side: Parsed Results */}
                <div className="w-full md:w-1/2 flex flex-col gap-3 bg-slate-950 border border-white/5 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Hasil Parsing ({parsedData.length})</span>
                    {parsedData.length > 0 && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold">Sukses</span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {parsedData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                        <CheckSquare className="w-12 h-12 mb-3" />
                        <p className="text-xs">Hasil parsing akan muncul di sini</p>
                      </div>
                    ) : (
                      parsedData.map((log, idx) => (
                        <div key={log.id} className="bg-slate-900/80 p-3 rounded-lg border border-white/5 flex flex-col gap-1.5 hover:border-indigo-500/30 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{log.username}</span>
                            <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{log.durationHours.toFixed(2)}h</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>IN: {log.clockIn.split(' ')[1] || log.clockIn}</span>
                            <span>OUT: {log.clockOut.split(' ')[1] || log.clockOut}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {parsedData.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-slate-900">
                      <button 
                        onClick={handleAggregateAndImport}
                        className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-green-600/20 flex justify-center items-center gap-2"
                      >
                        <CheckSquare className="w-4 h-4" /> Gabungkan ke Log Absensi
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DutyLogParser;
