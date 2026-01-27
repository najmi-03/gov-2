
import React from 'react';

const RegistrationForm: React.FC = () => {
  // Ganti URL ini dengan link Google Form yang asli
  const googleFormUrl = "https://docs.google.com/forms/d/e/your-form-id/viewform";

  const handleOpenForm = () => {
    window.open(googleFormUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="recruitment" className="py-24 px-4 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center bg-slate-900/40 p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Bangun <br/> <span className="text-amber-500">Warisan Publik</span>
            </h2>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed font-light">
              Melayani kota membutuhkan dedikasi, disiplin, dan visi untuk masa depan. 
              Klik tombol di samping untuk mengisi formulir pendaftaran resmi kami melalui portal eksternal.
            </p>
            <div className="p-4 bg-white/5 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-sm text-slate-300 italic font-medium">
                "Jangan tanyakan apa yang kota berikan padamu, tapi tanyakan apa yang bisa kau berikan pada kotamu."
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2 w-full flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-2xl border border-amber-500/10">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Portal Rekrutmen</h3>
            <p className="text-slate-500 text-sm text-center mb-8">
              Anda akan diarahkan ke formulir pendaftaran digital resmi kami.
            </p>
            <button 
              onClick={handleOpenForm}
              className="group relative w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">BUKA FORMULIR PENDAFTARAN</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <p className="mt-6 text-[10px] text-slate-600 uppercase font-bold tracking-widest">Powered by Google Forms</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
