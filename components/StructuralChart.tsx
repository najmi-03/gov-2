import React from 'react';
import { motion } from 'framer-motion';

interface StructuralChartProps {
  depts?: any;
  leadershipData?: any;
}

const StructuralChart: React.FC<StructuralChartProps> = ({ depts, leadershipData }) => {
  return (
    <section id="structural" className="py-16 md:py-24 px-4 bg-[#0A0D14] relative overflow-hidden min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto relative z-10 text-center">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6">
            <span className="text-xl">⚖️</span> STATE OF SAN ANDREAS
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-amber-500 mb-2 tracking-tight uppercase shadow-amber-500/20 drop-shadow-lg">
            Government Structure
          </h2>
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold">
            City Hall • Organizational Chart • GTA Roleplay
          </p>
        </div>

        {/* --- LEMBAGA TINGGI & PENGAWAS --- */}
        <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Lembaga Tinggi & Pengawas</span>
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
        </div>

        {/* Top 3 Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-slate-700/50 -z-10 border-dashed border-t"></div>
            
            {/* Box 1: Supreme Court */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#111622] border border-blue-500/30 rounded-xl p-6 text-left shadow-lg">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Lembaga Yudikatif</h4>
                <h3 className="text-lg font-black text-white uppercase mb-1">Supreme Court</h3>
                <p className="text-[10px] text-slate-500 italic mb-4">Pengadilan Tertinggi</p>
                <ul className="text-[10px] md:text-xs text-slate-300 space-y-2 list-none mb-4 pl-3 relative">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Lembaga yudikatif tertinggi</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani kasus hukum tingkat tinggi</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Judicial review terhadap peraturan negara</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengeluarkan keputusan pengadilan final</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Memastikan seluruh tindakan pemerintah sesuai hukum negara</li>
                </ul>
                <div className="inline-block px-2 py-1 border border-amber-500/50 text-amber-500 text-[9px] font-bold uppercase rounded bg-amber-500/10 tracking-widest">
                    ⇌ Sejajar
                </div>
            </motion.div>

            {/* Box 2: Inspector General */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#111622] border border-blue-500/30 rounded-xl p-6 text-left shadow-lg relative">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Lembaga Pengawas</h4>
                <h3 className="text-lg font-black text-white uppercase mb-1">Inspector General</h3>
                <p className="text-[10px] text-slate-500 italic mb-4">Pengawas Tertinggi Pemerintahan</p>
                <ul className="text-[10px] md:text-xs text-slate-300 space-y-2 list-none mb-4 pl-3 relative">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengawasi seluruh aktivitas pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Investigasi penyalahgunaan jabatan & korupsi</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Audit dan pengecekan seluruh divisi</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Memastikan kepatuhan terhadap SOP government</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani pelanggaran pejabat pemerintah</li>
                </ul>
                <div className="inline-block px-2 py-1 border border-amber-500/50 text-amber-500 text-[9px] font-bold uppercase rounded bg-amber-500/10 tracking-widest">
                    ⇌ Sejajar
                </div>
                {/* Line down connection */}
                <div className="hidden md:block absolute -bottom-16 left-1/2 w-0.5 h-16 bg-slate-700/50 border-dashed border-l"></div>
            </motion.div>

            {/* Box 3: House of Representatives */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#111622] border border-blue-500/30 rounded-xl p-6 text-left shadow-lg">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Lembaga Legislatif</h4>
                <h3 className="text-lg font-black text-white uppercase mb-1">House of Representatives</h3>
                <p className="text-[10px] text-slate-500 italic mb-4">Lembaga Perwakilan Rakyat</p>
                <ul className="text-[10px] md:text-xs text-slate-300 space-y-2 list-none mb-4 pl-3 relative">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Membahas dan mengusulkan regulasi pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mewakili suara masyarakat</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengadakan hearing & pengawasan pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Membahas anggaran negara</li>
                </ul>
                <div className="inline-block px-2 py-1 border border-amber-500/50 text-amber-500 text-[9px] font-bold uppercase rounded bg-amber-500/10 tracking-widest">
                    ⇌ Sejajar
                </div>
            </motion.div>
        </div>

        <div className="flex flex-col items-center justify-center mb-8 gap-4 hidden md:flex">
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded">Di Bawah Pengawasan Inspector General</span>
            <div className="h-6 w-px bg-amber-500/50"></div>
        </div>

        {/* --- PIMPINAN TERTINGGI & PEMBANTU EKSEKUTIF --- */}
        <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-amber-500/30 w-8 md:w-16"></div>
            <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest">Pimpinan Tertinggi & Pembantu Eksekutif</span>
            <div className="h-px bg-amber-500/30 w-8 md:w-16"></div>
        </div>

        {/* Box 4: Executive Chancellor */}
        <div className="max-w-4xl mx-auto relative z-20">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-[#1A180E] border border-amber-500/50 rounded-xl p-6 text-left shadow-lg shadow-amber-500/5">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Kepala Pemerintahan</h4>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-4">Executive Chancellor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <ul className="text-[10px] md:text-sm text-slate-300 space-y-2 list-none pl-3 relative">
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-amber-500">Memimpin dan mengelola pemerintahan national</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-amber-500">Menentukan kebijakan eksekutif negara</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-amber-500">Mengangkat / memberhentikan kepala divisi</li>
                    </ul>
                    <ul className="text-[10px] md:text-sm text-slate-300 space-y-2 list-none pl-3 relative">
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-amber-500">Mengkoordinasikan seluruh divisi pemerintahan</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-amber-500">Menjaga stabilitas dan arah pemerintahan national</li>
                    </ul>
                </div>
            </motion.div>
        </div>

        {/* Connections from Chancellor to Deputy & Secretary */}
        <div className="hidden md:block w-full relative h-12 mb-2">
            <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-amber-500/30 -translate-x-1/2"></div>
            <div className="absolute top-6 left-[25%] right-[25%] h-0.5 bg-amber-500/30 border-dashed border-t border-amber-500/30"></div>
            <div className="absolute top-6 left-[25%] w-0.5 h-6 bg-amber-500/30 -translate-x-[1px]"></div>
            <div className="absolute top-6 right-[25%] w-0.5 h-6 bg-amber-500/30 translate-x-[1px]"></div>
            
            {/* Center line continue down */}
            <div className="absolute top-6 left-1/2 w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-1/2"></div>
        </div>

        {/* Box 5 & 6: Deputy & Secretary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-20">
            {/* Central vertical line continuing through this row */}
            <div className="hidden md:block absolute top-0 left-1/2 w-0.5 h-full bg-slate-700/50 border-dashed border-l -translate-x-1/2 -z-10"></div>
            
            {/* Horizontal dashed line connecting Deputy & Secretary */}
            <div className="hidden md:block absolute top-1/2 left-[25%] right-[25%] h-px bg-slate-700/50 border-dashed border-t -z-10"></div>

            {/* Deputy */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#14121A] border border-purple-500/30 rounded-xl p-6 text-left shadow-lg">
                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Wakil Kepala Pemerintahan</h4>
                <h3 className="text-lg font-black text-white uppercase mb-4">Deputy Executive Chancellor</h3>
                <ul className="text-[10px] md:text-xs text-slate-300 space-y-2 list-none mb-6 pl-3 relative">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Membantu Executive Chancellor dalam operasional</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Menggantikan Chancellor saat tidak aktif</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Mengkoordinasikan divisi dan program pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Mengawasi pelaksanaan kebijakan national</li>
                </ul>
                <div className="inline-block px-2 py-1 border border-amber-500/50 text-amber-500 text-[9px] font-bold uppercase rounded bg-amber-500/10 tracking-widest">
                    ⇌ Sejajar dengan Executive Secretary
                </div>
            </motion.div>

            {/* Secretary */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#14121A] border border-purple-500/30 rounded-xl p-6 text-left shadow-lg">
                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Sekretaris Eksekutif</h4>
                <h3 className="text-lg font-black text-white uppercase mb-4">Executive Secretary</h3>
                <ul className="text-[10px] md:text-xs text-slate-300 space-y-2 list-none mb-6 pl-3 relative">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Mengelola dokumen & arsip resmi pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Mengatur jadwal rapat & agenda resmi</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Membuat pengumuman & memorandum pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-purple-500">Mengurus administrasi dan surat menyurat eksekutif</li>
                </ul>
                <div className="inline-block px-2 py-1 border border-amber-500/50 text-amber-500 text-[9px] font-bold uppercase rounded bg-amber-500/10 tracking-widest">
                    ⇌ Sejajar dengan Deputy Executive Chancellor
                </div>
            </motion.div>
        </div>

        {/* Central vertical line down to Manajemen SDM */}
        <div className="hidden md:flex w-full justify-center h-8 relative z-10">
            <div className="w-0.5 h-full bg-slate-700/50 border-dashed border-l"></div>
        </div>


        {/* --- MANAJEMEN SDM --- */}
        <div className="flex items-center justify-center gap-4 mb-4 relative z-20">
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#0A0D14] px-2">Manajemen SDM</span>
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
        </div>

        {/* Box 7: Division of Government Personnel */}
        <div className="max-w-3xl mx-auto mb-20 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#0F1713] border border-emerald-500/30 rounded-xl p-6 text-left shadow-lg">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Manajemen SDM Pemerintahan</h4>
                <h3 className="text-xl font-black text-white uppercase mb-4">Division of Government Personnel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <ul className="text-[10px] md:text-sm text-slate-300 space-y-2 list-none pl-3 relative">
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Mengelola kebutuhan SDM pemerintah</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Rekrutmen, penempatan & pengembangan pegawai</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Mengelola data, absensi & catatan kinerja pegawai</li>
                    </ul>
                    <ul className="text-[10px] md:text-sm text-slate-300 space-y-2 list-none pl-3 relative">
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Menyusun kebijakan SDM & sistem karier</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Mengevaluasi kinerja Kepala Divisi dan pejabat tinggi</li>
                        <li className="before:content-['•'] before:absolute before:left-0 before:text-emerald-500">Memberikan rekomendasi promosi, mutasi atau sanksi ke Chancellor</li>
                    </ul>
                </div>
            </motion.div>
        </div>

        {/* Line down to Divisi Eksekutif */}
        <div className="hidden md:flex w-full justify-center h-8 relative -top-4">
            <div className="w-0.5 h-full bg-slate-700/50 border-dashed border-l"></div>
        </div>

        {/* --- DIVISI EKSEKUTIF --- */}
        <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Divisi Eksekutif</span>
            <div className="h-px bg-slate-700/50 w-8 md:w-16"></div>
        </div>

        {/* Connection from Divisi Eksekutif to 5 divisions */}
        <div className="hidden md:block w-full relative h-12 mb-8">
            {/* Center vertical down from Divisi Eksekutif text */}
            <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-1/2"></div>
            
            {/* Horizontal Split Line for 5 Departments Below */}
            <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-700/50 border-dashed border-t"></div>
            
            {/* 5 Drop Lines */}
            <div className="absolute top-6 left-[10%] w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-[1px]"></div>
            <div className="absolute top-6 left-[30%] w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-[1px]"></div>
            <div className="absolute top-6 left-[50%] w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-[1px]"></div>
            <div className="absolute top-6 left-[70%] w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-[1px]"></div>
            <div className="absolute top-6 left-[90%] w-0.5 h-6 bg-slate-700/50 border-dashed border-l -translate-x-[1px]"></div>
        </div>

        {/* 5 Bottom Divs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-20">
            
            {/* 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#111622] border border-blue-500/20 rounded-xl p-5 text-left shadow-lg hover:border-blue-500/50 transition-colors">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Keamanan Publik</h4>
                <h3 className="text-sm font-black text-white uppercase mb-4">Division of Public Safety</h3>
                <ul className="text-[9px] sm:text-[10px] text-slate-300 space-y-2 list-none pl-3 relative leading-relaxed">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengatur keamanan publik</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani keadaan darurat</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Koordinasi emergency response</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Membuat SOP & protokol keamanan</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjaga stabilitas dan ketertiban</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjadi lembaga asesor pengadaan alat keamanan</li>
                </ul>
            </motion.div>

            {/* 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#111622] border border-blue-500/20 rounded-xl p-5 text-left shadow-lg hover:border-blue-500/50 transition-colors">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Keuangan</h4>
                <h3 className="text-sm font-black text-white uppercase mb-4">Division of Finance</h3>
                <ul className="text-[9px] sm:text-[10px] text-slate-300 space-y-2 list-none pl-3 relative leading-relaxed">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengelola keuangan negara</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengatur pajak & pendapatan</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menyusun dan mengelola anggaran pemerintah</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengawasi pengeluaran negara</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjaga stabilitas ekonomi</li>
                </ul>
            </motion.div>

            {/* 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-[#111622] border border-blue-500/20 rounded-xl p-5 text-left shadow-lg hover:border-blue-500/50 transition-colors">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Urusan Sipil</h4>
                <h3 className="text-sm font-black text-white uppercase mb-4">Division of Civil Affairs</h3>
                <ul className="text-[9px] sm:text-[10px] text-slate-300 space-y-2 list-none pl-3 relative leading-relaxed">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengurus administrasi & perizinan</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Memberikan pelayanan publik</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengelola data kependudukan</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani dokumen sipil</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjadi penghubung antara pemerintah dan warga</li>
                </ul>
            </motion.div>

            {/* 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#111622] border border-blue-500/20 rounded-xl p-5 text-left shadow-lg hover:border-blue-500/50 transition-colors">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Layanan Kesehatan</h4>
                <h3 className="text-sm font-black text-white uppercase mb-4">Division of Health Services</h3>
                <ul className="text-[9px] sm:text-[10px] text-slate-300 space-y-2 list-none pl-3 relative leading-relaxed">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengatur layanan kesehatan national</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengawasi fasilitas & tenaga medis</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani keadaan darurat medis</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Membuat kebijakan & SOP kesehatan</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Meningkatkan kualitas layanan medis</li>
                </ul>
            </motion.div>

            {/* 5 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="bg-[#111622] border border-blue-500/20 rounded-xl p-5 text-left shadow-lg hover:border-blue-500/50 transition-colors">
                <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Sosial & Komunitas</h4>
                <h3 className="text-sm font-black text-white uppercase mb-4">Division of Social & Community Affairs</h3>
                <ul className="text-[9px] sm:text-[10px] text-slate-300 space-y-2 list-none pl-3 relative leading-relaxed">
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengelola program sosial & charity</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjadi mediator saat demo warga</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menangani aspirasi & keluhan masyarakat</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Mengadakan event sosial & community engagement</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjalin hubungan baik dengan masyarakat</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjadi penghubung & mediator dengan warga, instansi dan komunitas</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Membuat surat komunitas dan surat keramaian</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Segala urusan warga & komunitas dikomunikasikan ke divisi sosial terlebih dahulu</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Jika terjadi demo, Divisi Sosial menghadapi dengan seadanya jika tidak ada pendampingan divisi terkait</li>
                    <li className="before:content-['•'] before:absolute before:left-0 before:text-blue-500">Menjadi asesor untuk semua yang berhubungan dengan warga, komunitas dan sosial masyarakat</li>
                </ul>
            </motion.div>
        </div>

      </div>
    </section>
  );
};

export default StructuralChart;
