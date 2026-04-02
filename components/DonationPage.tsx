import React from 'react';
import { motion } from 'framer-motion';

const DonationPage: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-transparent flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl w-full bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-amber-500/5"
            >
                <div className="p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <span className="text-4xl">☕</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-6">
                        Dukung Keberlanjutan Proyek Ini
                    </h1>
                    
                    <div className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
                        <p>
                            Proyek ini bermula dari niat untuk memberikan manfaat secara gratis bagi banyak orang. Selama satu bulan penuh, saya meracik baris kode demi baris kode menggunakan sumber daya open-source dan free tier demi hasil yang maksimal bagi kamu.
                        </p>
                        <p>
                            Donasi kamu bukan sekadar nominal, tapi bentuk apresiasi atas waktu yang saya curahkan. Dengan dukunganmu, saya bisa terus mengembangkan fitur baru dan meningkatkan kualitas website ini ke depannya.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                            Pilih Platform Donasi
                        </p>
                        
                        <div className="flex flex-col items-center justify-center gap-6">
                            <div className="bg-slate-800 p-2 rounded-2xl shadow-lg shadow-amber-500/10 overflow-hidden border border-white/10">
                                <iframe 
                                    src="https://tako.id/overlay/qr-code?overlay_key=d3xha3e8lr4pcs8uieme9phd" 
                                    width="320" 
                                    height="360" 
                                    className="border-0 rounded-xl"
                                    title="QR Code Tako.id"
                                    scrolling="no"
                                ></iframe>
                            </div>
                            
                            <a 
                                href="https://tako.id/overlay/qr-code?overlay_key=d3xha3e8lr4pcs8uieme9phd" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-3"
                            >
                                <span>Buka QR Code Penuh</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-6 italic">
                            *Scan QR Code di atas menggunakan aplikasi e-wallet atau m-banking Anda. Terima kasih atas dukungan Anda!
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DonationPage;
