
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-serif font-bold text-white">Kebijakan <span className="text-amber-500">Privasi</span></h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-400 leading-relaxed">
              <section>
                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">1. PENDAHULUAN</h3>
                <p>
                  Pemerintah San Andreas berkomitmen untuk melindungi privasi data warga dalam ekosistem digital kami. Kebijakan ini disusun berdasarkan standar perlindungan data pribadi di Indonesia (UU PDP) dan disesuaikan untuk kebutuhan integritas Roleplay.
                </p>
              </section>

              <section>
                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">2. INFORMASI YANG KAMI KUMPULKAN</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Data Karakter: Nama, Tanggal Lahir, Status Kewarganegaraan.</li>
                  <li>Identitas Digital: Discord ID dan nomor telepon dalam kota untuk verifikasi rekrutmen.</li>
                  <li>Log Aktivitas: Catatan interaksi pada portal logistik dan berita untuk tujuan transparansi pemerintahan.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">3. PENGGUNAAN INFORMASI</h3>
                <p>
                  Informasi yang dikumpulkan digunakan semata-mata untuk:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Proses seleksi dan penempatan pegawai pada Departemen Pemerintah.</li>
                  <li>Manajemen inventaris logistik umum dan barang sitaan (Loker Hitam).</li>
                  <li>Otomasi laporan melalui integrasi Webhook Discord untuk koordinasi staff.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">4. KEAMANAN DATA</h3>
                <p>
                  Kami menggunakan enkripsi protokol standar untuk melindungi data Anda. Data inventaris dan berita disimpan secara lokal pada infrastruktur server kami dan tidak akan diperjualbelikan kepada faksi ilegal atau pihak ketiga di luar struktur pemerintahan.
                </p>
              </section>

              <section>
                <h3 className="text-amber-500 font-bold uppercase tracking-widest text-[10px] mb-2">5. HAK WARGA</h3>
                <p>
                  Setiap warga berhak meminta peringkasan atau penghapusan data jika sudah tidak lagi terdaftar sebagai aparatur sipil atau ingin menarik lamaran pekerjaan melalui Departemen Human Resource.
                </p>
              </section>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] italic">
                *Dengan menggunakan portal ini, Anda dianggap telah menyetujui seluruh ketentuan privasi yang berlaku demi kelancaran operasional negara.
              </div>
            </div>

            <div className="p-6 border-t border-white/5 text-center">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all uppercase text-[10px] tracking-widest"
              >
                SAYA MENGERTI
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyModal;