
import React, { useState, useRef, useEffect } from 'react';
import { getCitizenSupport } from '../services/geminiService';
import { DEPARTMENTS, NEWS } from '../constants';

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Salam, warga. Saya adalah Humas AI Pemerintah San Andreas. Saya di sini khusus untuk membantu menjawab pertanyaan Anda mengenai departemen, berita kota, dan struktur pemerintahan yang ada di portal ini. Apa yang ingin Anda ketahui?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Menyusun seluruh data portal menjadi satu string context untuk AI
  const portalKnowledgeBase = `
    Daftar Departemen:
    ${DEPARTMENTS.map(d => `
      - Nama: ${d.name}
      - Visi: ${d.vision}
      - Deskripsi: ${d.longDescription}
      - Tanggung Jawab: ${d.responsibilities.join(', ')}
      - Syarat Pendaftaran: ${d.requirements.join(', ')}
      - Struktural Utama: ${d.structuralStaff.map(s => `${s.role} (${s.name})`).join(', ')}
    `).join('\n')}

    Berita Terbaru:
    ${NEWS.map(n => `- ${n.title} (${n.date}): ${n.summary}`).join('\n')}

    Struktur Pemerintahan Tertinggi:
    - Presiden: Marcus Vane
    - Wakil Presiden: Sarah Jenkins
    - Secretary of State: Dominic Sterling
    - Deputy Secretary of State: Elara Vance
  `;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Kirim query bersama context data portal
    const response = await getCitizenSupport(userMsg, portalKnowledgeBase);
    setChat(prev => [...prev, { role: 'assistant', text: response || '' }]);
    setLoading(false);
  };

  return (
    <section id="assistant" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            Grounding AI Enabled
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Layanan Bantuan Warga (AI)</h2>
          <p className="text-slate-400">Asisten ini diprogram hanya untuk memberikan informasi resmi seputar portal pemerintahan San Andreas.</p>
        </div>
        
        <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[400px] overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-amber-500 text-slate-950 font-medium' 
                  : 'bg-white/5 text-slate-200 border border-white/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-xl text-sm border border-white/10 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-slate-400">Memeriksa database portal...</span>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-slate-900/50 flex gap-4">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tanya tentang syarat pendaftaran, visi departemen, atau struktural kota..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-amber-500 text-slate-950 font-bold px-6 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              KIRIM
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;