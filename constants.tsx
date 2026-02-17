
import { Department, DeptInfo, NewsItem, PawnItem, PawnStatus, PawnCategory, FormConfig, RecruitmentConfig, PermissionConfig } from './types';

// ============================================================================
// KONFIGURASI DATABASE PUSAT (GOOGLE SHEETS)
// ============================================================================

// LINK 1: SCRIPT DATABASE UTAMA (Config, Berita, KTP, SIM, Izin, dll)
// Digunakan untuk menyimpan dan mengambil data global
export const DATABASE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzd7i8QCxT24ux5nQIpoEvDOhcglUJ2AiS3g9RMEcpSrPMkXzoXgpXMwqrsSmdLZ17G9w/exec";

// LINK 2: SCRIPT KHUSUS REKRUTMEN (Hanya untuk Form Lamaran Kerja)
// Digunakan saat pelamar mengirim form "Karir Pemerintahan"
export const RESPONSES_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEwELc8Mx_OWR4tZMlGyEUXxTU4dMHSEHGrowsgX60lX3otdcus6Xv7uQ9p29HRFuR/exec"; 

// LINK 3: SCRIPT KHUSUS ABSENSI (Write Only / Clock In-Out & Read JSON)
// Digunakan untuk mencatat Clock-In/Clock-Out pegawai dan membaca data real-time
// UPDATED: Mendukung Auto-Create Tab Bulanan
export const ATTENDANCE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykfsIUO-f4sDh8QBrC4mCu1ZH1psVdPJFh_OfdEJtHdfC97EKiZRyXJDHtgyYdmx3I/exec";

// LINK 4: LINK DATA ABSENSI (Read Only / CSV)
// Digunakan oleh Admin Treasury untuk menarik data gaji (Lebih cepat untuk data banyak)
// DIKOSONGKAN AGAR SISTEM MENGGUNAKAN SCRIPT URL (JSON) SECARA OTOMATIS
export const ATTENDANCE_CSV_URL = ""; 

// ============================================================================

export const DEFAULT_MASTER_SCRIPT_URL = DATABASE_SCRIPT_URL; // Backward compatibility

// Default Config (Fallback jika internet mati)
export const DEFAULT_RECRUITMENT_CONFIG: RecruitmentConfig = {
  isOpen: true,
  title: "Penerimaan Calon Pegawai Pemerintah",
  description: "Harap membaca persyaratan berikut sebelum mendaftar:\n1. Warga Negara San Andreas yang sah.\n2. Tidak memiliki catatan kriminal berat.\n3. Siap bekerja di bawah tekanan dan profesional.",
  targetSheetName: "Rekrutmen_Batch_1",
  scriptUrl: RESPONSES_SCRIPT_URL, 
  spreadsheetUrl: "", 
  questions: [
    { id: 'q1', label: "Nama Lengkap (IC)", type: 'SHORT', required: true, isBold: true, placeholder: "Nama sesuai KTP..." },
    { id: 'q2', label: "Nomor Telepon", type: 'SHORT', required: true, isBold: false, placeholder: "555-xxxx" },
    { id: 'q3', label: "Departemen yang Dituju", type: 'CHOICE', options: ['Home Affairs', 'Treasury', 'Human Resource', 'Social Affairs'], required: true, isBold: true },
    { id: 'q4', label: "Jelaskan pengalaman kerja Anda sebelumnya", type: 'PARAGRAPH', required: true, isBold: false, placeholder: "Ceritakan pengalaman..." }
  ]
};

export const DEFAULT_PERMISSIONS: PermissionConfig[] = [
  { 
    id: 'perm_cuti', 
    title: 'Pengajuan Cuti (LOA)', 
    icon: '🏖️', 
    color: '#3b82f6', 
    webhookKey: 'ls_gov_webhook_cuti', 
    requireDate: true,
    fields: [
      { id: 'f_reason', label: 'Alasan Cuti', placeholder: 'Jelaskan alasan pengajuan...', type: 'textarea', required: true },
      { id: 'f_contact', label: 'Kontak Darurat (Discord ID)', placeholder: 'username#1234', type: 'text', required: true }
    ]
  },
  { 
    id: 'perm_sakit', 
    title: 'Izin Sakit', 
    icon: '🤢', 
    color: '#eab308', 
    webhookKey: 'ls_gov_webhook_sakit', 
    requireDate: true,
    fields: [
      { id: 'f_diagnosis', label: 'Diagnosa / Keluhan', placeholder: 'Demam, Cedera, dll', type: 'text', required: true },
      { id: 'f_proof', label: 'Link Bukti Medis (Jika Ada)', placeholder: 'imgur.com/...', type: 'text', required: false }
    ]
  },
  { 
    id: 'perm_dinas', 
    title: 'Surat Dinas Luar', 
    icon: '🗺️', 
    color: '#8b5cf6', 
    webhookKey: 'ls_gov_webhook_dinas', 
    requireDate: true,
    fields: [
      { id: 'f_loc', label: 'Lokasi Tujuan', placeholder: 'Nama Kota / Area', type: 'text', required: true },
      { id: 'f_purpose', label: 'Tujuan Dinas', placeholder: 'Rapat / Investigasi / dll', type: 'textarea', required: true }
    ]
  },
  { 
    id: 'perm_resign', 
    title: 'Pengunduran Diri (Resign)', 
    icon: '🚪', 
    color: '#ef4444', 
    webhookKey: 'ls_gov_webhook_resign', 
    requireDate: false,
    fields: [
      { id: 'f_reason', label: 'Alasan Pengunduran Diri', placeholder: 'Jelaskan secara detail...', type: 'textarea', required: true },
      { id: 'f_handover', label: 'Status Inventaris', placeholder: 'Sudah dikembalikan / Belum', type: 'text', required: true }
    ]
  },
  { 
    id: 'perm_lembur', 
    title: 'Laporan Lembur', 
    icon: '⏰', 
    color: '#22c55e', 
    webhookKey: 'ls_gov_webhook_lembur', 
    requireDate: true,
    fields: [
      { id: 'f_activity', label: 'Aktivitas yang Dilakukan', placeholder: 'Patroli / Dokumen / dll', type: 'textarea', required: true },
      { id: 'f_hours', label: 'Total Jam Lembur', placeholder: 'Contoh: 2 Jam', type: 'text', required: true }
    ]
  }
];

export const DEFAULT_FORMS: FormConfig[] = [
  {
    id: 'identitas',
    title: 'Kartu Identitas (KTP)',
    description: 'Pendaftaran biodata resmi warga negara San Andreas.',
    icon: '🪪',
    webhookKey: 'ls_gov_webhook_ktp',
    fields: [
      { id: 'f1', label: 'Nama Lengkap (IC)', placeholder: 'Contoh: Marcus Vane', type: 'text', required: true },
      { id: 'f2', label: 'Citizen ID (CID)', placeholder: 'ABC12345', type: 'text', required: true },
      { id: 'f3', label: 'No. Telepon', placeholder: '555-xxxx', type: 'text', required: true },
      { id: 'f4', label: 'Pekerjaan', placeholder: 'Pedagang, Supir, dll', type: 'text', required: true }
    ]
  },
  {
    id: 'identitas_hilang',
    title: 'Cetak Ulang ID Card (Hilang)',
    description: 'Permohonan cetak ulang kartu identitas yang hilang.',
    icon: '🆔',
    webhookKey: 'ls_gov_webhook_ktp_ulang',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Sesuai database', type: 'text', required: true },
      { id: 'f2', label: 'CID', placeholder: 'Nomor Identitas', type: 'text', required: true },
      { id: 'f3', label: 'Kronologi Kehilangan', placeholder: 'Jelaskan singkat...', type: 'textarea', required: true }
    ]
  },
  {
    id: 'doj_pengantar',
    title: 'Surat Pengantar ke DOJ',
    description: 'Surat rujukan ke Department of Justice karena kehilangan ID.',
    icon: '⚖️',
    webhookKey: 'ls_gov_webhook_doj',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Nama pelapor', type: 'text', required: true },
      { id: 'f2', label: 'CID', placeholder: 'Nomor Identitas', type: 'text', required: true },
      { id: 'f3', label: 'Alasan Ke DOJ', placeholder: 'Keperluan administrasi hukum...', type: 'textarea', required: true }
    ]
  },
  {
    id: 'id_update_foto',
    title: 'Pembaruan Foto ID Card',
    description: 'Pembaruan foto identitas pasca operasi plastik / ganti penampilan.',
    icon: '📸',
    webhookKey: 'ls_gov_webhook_ktp_foto',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Nama sesuai KTP', type: 'text', required: true },
      { id: 'f2', label: 'CID', placeholder: 'Nomor Identitas', type: 'text', required: true },
      { id: 'f3', label: 'Alasan Perubahan', placeholder: 'Oplas / Perubahan Gaya Rambut dll', type: 'text', required: true }
    ]
  },
  {
    id: 'id_ganti_data',
    title: 'Penggantian Data ID Card',
    description: 'Perubahan data nama atau informasi biodata lainnya.',
    icon: '📝',
    webhookKey: 'ls_gov_webhook_ktp_data',
    fields: [
      { id: 'f1', label: 'Nama Lama', placeholder: 'Sesuai KTP sebelumnya', type: 'text', required: true },
      { id: 'f2', label: 'Nama Baru (Jika Ganti Nama)', placeholder: 'Biarkan kosong jika tidak ganti nama', type: 'text', required: false },
      { id: 'f3', label: 'Data Lain yang Diubah', placeholder: 'Pekerjaan / Alamat / dll', type: 'textarea', required: true }
    ]
  },
  {
    id: 'sim_ulang',
    title: 'Cetak Ulang SIM',
    description: 'Cetak ulang Driving License karena ganti data / hilang / oplas.',
    icon: '🚗',
    webhookKey: 'ls_gov_webhook_sim',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Sesuai KTP', type: 'text', required: true },
      { id: 'f2', label: 'Jenis SIM', placeholder: 'Driver / Trucker / Pilot', type: 'text', required: true },
      { id: 'f3', label: 'Alasan Cetak Ulang', placeholder: 'Hilang / Oplas / Ganti Data', type: 'text', required: true }
    ]
  },
  {
    id: 'lisensi_ulang',
    title: 'Cetak Ulang Lisensi Umum',
    description: 'Cetak ulang lisensi lain (Berburu/Senjata) karena ganti data/hilang.',
    icon: '📜',
    webhookKey: 'ls_gov_webhook_lisensi_gen',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Sesuai KTP', type: 'text', required: true },
      { id: 'f2', label: 'Jenis Lisensi', placeholder: 'Hunting / Weapon / dll', type: 'text', required: true },
      { id: 'f3', label: 'Alasan Cetak Ulang', placeholder: 'Jelaskan alasan...', type: 'text', required: true }
    ]
  },
  {
    id: 'marriage_license',
    title: 'Marriage License',
    description: 'Permohonan izin untuk melaksanakan pernikahan resmi.',
    icon: '💍',
    webhookKey: 'ls_gov_webhook_marriage',
    fields: [
      { id: 'f1', label: 'Nama Calon Suami', placeholder: 'Nama Lengkap & CID', type: 'text', required: true },
      { id: 'f2', label: 'Nama Calon Istri', placeholder: 'Nama Lengkap & CID', type: 'text', required: true },
      { id: 'f3', label: 'Saksi Pernikahan', placeholder: 'Nama minimal 1 saksi', type: 'text', required: true }
    ]
  },
  {
    id: 'marriage_cert',
    title: 'Marriage Certificate',
    description: 'Penerbitan akta nikah resmi setelah prosesi pernikahan.',
    icon: '💒',
    webhookKey: 'ls_gov_webhook_marriage',
    fields: [
      { id: 'f1', label: 'Nama Suami', placeholder: 'Sesuai KTP', type: 'text', required: true },
      { id: 'f2', label: 'Nama Istri', placeholder: 'Sesuai KTP', type: 'text', required: true },
      { id: 'f3', label: 'Tanggal Pernikahan', placeholder: 'DD/MM/YYYY', type: 'text', required: true }
    ]
  },
  {
    id: 'izin_usaha',
    title: 'Surat Izin Usaha',
    description: 'Pendaftaran izin operasional bisnis/toko baru.',
    icon: '🏢',
    webhookKey: 'ls_gov_webhook_bisnis',
    fields: [
      { id: 'f1', label: 'Nama Pemilik Usaha', placeholder: 'Nama Lengkap', type: 'text', required: true },
      { id: 'f2', label: 'Nama Bisnis', placeholder: 'Contoh: Vane Coffee Shop', type: 'text', required: true },
      { id: 'f3', label: 'Jenis Usaha', placeholder: 'Restoran / Mekanik / dll', type: 'text', required: true },
      { id: 'f4', label: 'Lokasi Usaha', placeholder: 'Area / Alamat GPS', type: 'text', required: true }
    ]
  },
  {
    id: 'izin_usaha_update',
    title: 'Pembaruan Izin Usaha',
    description: 'Pembaruan masa berlaku atau perubahan data bisnis.',
    icon: '🔄',
    webhookKey: 'ls_gov_webhook_bisnis',
    fields: [
      { id: 'f1', label: 'Nama Bisnis', placeholder: 'Sesuai Izin Lama', type: 'text', required: true },
      { id: 'f2', label: 'ID Bisnis (Jika Ada)', placeholder: 'Nomor Izin', type: 'text', required: true },
      { id: 'f3', label: 'Perubahan Data', placeholder: 'Jelaskan bagian yang diubah...', type: 'textarea', required: true }
    ]
  },
  {
    id: 'izin_pers',
    title: 'Surat Izin Pers',
    description: 'Izin resmi untuk peliputan berita dan aktivitas jurnalistik.',
    icon: '📽️',
    webhookKey: 'ls_gov_webhook_pers',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Nama Jurnalis', type: 'text', required: true },
      { id: 'f2', label: 'Perusahaan Media', placeholder: 'Weazel News / dll', type: 'text', required: true },
      { id: 'f3', label: 'Jabatan', placeholder: 'Reporter / Kameramen / Editor', type: 'text', required: true }
    ]
  },
  {
    id: 'izin_pers_update',
    title: 'Pembaruan Izin Pers',
    description: 'Pembaruan masa berlaku kartu pers atau ganti perusahaan media.',
    icon: '📰',
    webhookKey: 'ls_gov_webhook_pers',
    fields: [
      { id: 'f1', label: 'Nama Lengkap', placeholder: 'Nama Jurnalis', type: 'text', required: true },
      { id: 'f2', label: 'Nomor Kartu Pers Lama', placeholder: 'Biarkan kosong jika hilang', type: 'text', required: false },
      { id: 'f3', label: 'Alasan Pembaruan', placeholder: 'Ganti Perusahaan / Habis Masa Berlaku', type: 'text', required: true }
    ]
  },
  {
    id: 'kk_baru',
    title: 'Kartu Keluarga',
    description: 'Pendaftaran Kartu Keluarga baru (Maksimal 5 Anggota).',
    icon: '👨‍👩-👧‍👦',
    webhookKey: 'ls_gov_webhook_kk',
    fields: [
      { id: 'f1', label: 'Nama Kepala Keluarga', placeholder: 'Nama & CID', type: 'text', required: true },
      { id: 'f2', label: 'Nama Anggota 2', placeholder: 'Nama & CID', type: 'text', required: true },
      { id: 'f3', label: 'Nama Anggota 3', placeholder: 'Nama & CID', type: 'text', required: true },
      { id: 'f4', label: 'Nama Anggota 4', placeholder: 'Nama & CID', type: 'text', required: true },
      { id: 'f5', label: 'Nama Anggota 5', placeholder: 'Nama & CID', type: 'text', required: true }
    ]
  },
  {
    id: 'kk_tambah',
    title: 'Penambahan Anggota KK',
    description: 'Menambahkan anggota baru ke dalam Kartu Keluarga yang ada.',
    icon: '➕',
    webhookKey: 'ls_gov_webhook_kk',
    fields: [
      { id: 'f1', label: 'Nomor KK / Nama KK', placeholder: 'ID Kartu Keluarga', type: 'text', required: true },
      { id: 'f2', label: 'Nama Anggota Baru', placeholder: 'Nama Lengkap & CID', type: 'text', required: true },
      { id: 'f3', label: 'Hubungan Keluarga', placeholder: 'Anak / Saudara / dll', type: 'text', required: true }
    ]
  },
  {
    id: 'kk_kurang',
    title: 'Pengurangan Anggota KK',
    description: 'Menghapus anggota dari Kartu Keluarga (Pindah/Meninggal).',
    icon: '➖',
    webhookKey: 'ls_gov_webhook_kk',
    fields: [
      { id: 'f1', label: 'Nomor KK / Nama KK', placeholder: 'ID Kartu Keluarga', type: 'text', required: true },
      { id: 'f2', label: 'Nama Anggota yang Dihapus', placeholder: 'Nama Lengkap', type: 'text', required: true },
      { id: 'f3', label: 'Alasan Pengurangan', placeholder: 'Pindah Domisili / Keluar Keluarga', type: 'text', required: true }
    ]
  },
  {
    id: 'kk_ubah',
    title: 'Perubahan Data Anggota KK',
    description: 'Update informasi biodata salah satu anggota dalam KK.',
    icon: '🔄',
    webhookKey: 'ls_gov_webhook_kk',
    fields: [
      { id: 'f1', label: 'Nomor KK / Nama KK', placeholder: 'ID Kartu Keluarga', type: 'text', required: true },
      { id: 'f2', label: 'Nama Anggota', placeholder: 'Nama yang datanya diubah', type: 'text', required: true },
      { id: 'f3', label: 'Data yang Diperbarui', placeholder: 'Pekerjaan / Status / dll', type: 'textarea', required: true }
    ]
  }
];

export const DEPARTMENTS: DeptInfo[] = [
  {
    id: 'ha',
    name: Department.HOME_AFFAIRS,
    icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEgqXo8LtommikmxINNui4ohO9aEFE3T2yQXFIsu4xf1PfdPj_pZn0fmpo3jxfIZH8BJ_NQe8RhZR5itW7t2DlZyd7Gz7JIX5ZBGK1f5zw_cSjszCzQ315irJctxxYrnhRBqA_EkZwhECpUiHgzXbdy0ochLzsOwTFTvzx_520qPrhUfJWbn09Q89oC60Xy0',
    shortDescription: 'Mengelola catatan kota, perizinan, and perencanaan tata ruang San Andreas.',
    longDescription: 'Departemen Home Affairs bertanggung jawab atas integritas sipil negara bagian. Kami memastikan setiap warga memiliki identitas yang sah and setiap bisnis beroperasi di bawah payung hukum yang tepat.',
    vision: 'Mewujudkan tata kelola yang transparan and administratif yang efisien di San Andreas.',
    responsibilities: ['Manajemen Basis Data Warga', 'Sertifikasi Properti', 'Izin Usaha', 'Tata Ruang'],
    requirements: ['Paham Prosedur Hukum', 'Kemampuan Administratif', 'Min. Usia 21 Tahun'],
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEjI0eG7lqgBCrlf22LB_3rdnaKmd9wzSNPNDHx0jniTUVB_7eTAN3BTjwIuxDSQDvN8Jjie3NNsf-96XFaAgYLQQh5lVuXfiKmKgGBG2fzBUVVVndsNt2knSa--p76Gw85UYY7oQMbjIxqvmtGlNKgXmObAvFNXkXqAivxGlE1IO-GsOAvtAtFoqY9YQUXP',
    structuralStaff: [
      { role: 'Kepala Departemen', name: 'Alaric Thorne', level: 1 },
      { role: 'Sekretaris Departemen', name: 'Elena Rodriguez', level: 2 },
      { role: 'Kabid Perizinan', name: 'Robert Chen', level: 3 },
      { role: 'Kabid Tata Ruang', name: 'Sarah Miller', level: 3 }
    ]
  },
  {
    id: 'hd',
    name: Department.HOMELAND_DEFENSE,
    icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEjitrq1I2eFRXT-N9Lomt94YLx081ed5G0kqpaS2gqQ9nJWlGMNWunEwDu3GCWDFZ5RJMPVlh39XTyCgmBJ176ErW9U2_ucU3K_475xWG2VLvj1pmdftXvl3KMPXwyvrP5InIThF3MPFP2XxeAESwRVMYSUeerLzNZ2zDPlnzrI4n3UOBPcC3m5UIa1sPzq',
    shortDescription: 'Menjamin keamanan and koordinasi penegakan hukum di seluruh wilayah metropolis San Andreas.',
    longDescription: 'Sebagai garda terdepan keamanan, Homeland & Defense mengkoordinasikan unit-unit taktis untuk menghadapi ancaman keamanan skala tinggi di San Andreas.',
    vision: 'Menjadikan San Andreas sebagai wilayah teraman bagi setiap penduduk.',
    responsibilities: ['Analisis Ancaman', 'Koordinasi Anti-Teror', 'Manajemen Krisis'],
    requirements: ['Pelatihan Fisik Lanjut', 'Disiplin Militer', 'Sertifikasi Senjata'],
    imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEhNmPlyrb3EFle1sRvkkPkeLhNwSQfgt9PY7_11Lf87T-JfiHBzR9_vZFpBN_TENBGUtSEvANmhrKq53KXoUjXohAzLZsAJlk3vze2Q_r9OUZJbna_vrKsUi-eRoyk80_F4pjR37G6xiACuCuk8h7yxH7YrRaK7qSE0ZNvzc_f8tXpYW3M_P7Sh7fGURiCD',
    structuralStaff: [
      { role: 'Kepala Departemen', name: 'Gen. Silas Vance', level: 1 },
      { role: 'Kepala Operasional', name: 'Col. Jack Steiner', level: 2 },
      { role: 'Komandan Taktis', name: 'Major Anya Volkov', level: 3 },
      { role: 'Intelijen Strategis', name: 'Dr. Leo Grant', level: 3 }
    ]
  },
  {
    id: 'health',
    name: Department.HEALTH,
    icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEjOdSGD7WFVoUXVcZLQfDhntyjDWN-bbRLZvVe_Qkl6SbZwZSxoYLd0VAmIk15Fk9qvbHoFcjMSjnpIyxpRN_7H-7v6Yg8G0dQzZJYc_9JiZfNoJJuKYk5PUtipbV88w3ComP3PqGdLnUjqlIOpIvyd2pCkxAIAjUS_WH4bofRJqLl4LPtiNS_dRk97ZdCV', 
    shortDescription: 'Otoritas medis tertinggi yang menjamin standar kesehatan and layanan darurat publik San Andreas.',
    longDescription: 'Health Services mengatur seluruh operasional medis di San Andreas, mulai dari audit rumah sakit hingga penanganan krisis kesehatan publik. Kami berdedikasi pada inovasi medis and keselamatan nyawa warga.',
    vision: 'Menjamin akses kesehatan berkualitas tinggi bagi setiap jiwa di San Andreas.',
    responsibilities: ['Audit Fasilitas Medis', 'Manajemen EMS & Paramedis', 'Penelitian Epidemiologi', 'Izin Praktik Medis'],
    requirements: ['Gelar Kedokteran/Kesehatan', 'Pengalaman Klinis Teruji', 'Etika Medis Tinggi', 'Sertifikasi ACLS'],
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    structuralStaff: [
      { role: 'Surgeon General', name: 'Dr. Arthur Sterling', level: 1 },
      { role: 'Deputy of Medicine', name: 'Dr. Julianne Moore', level: 2 },
      { role: 'Kepala Operasional EMS', name: 'Chief Marcus Webb', level: 3 },
      { role: 'Kepala Riset Farmasi', name: 'Dr. Elizabeth Swan', level: 3 }
    ]
  },
  {
    id: 'sa',
    name: Department.SOCIAL_AFFAIRS,
    icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEgIGurQI1uxBkygOBWtTDHRQBFssOiQhafX9Kp1S2Vodf-MnncDmLIf3f6uEOw1LA1-hwbUAEr-fHLISRQap5gYB91W2ROcJM0fms1v_gGRMsQ4Aor-yUOGH8YhYmDjkRIIGO9hSue_mnlatJD0Q5HVtUcUeUxwMjF0Uu2dLhG1zswAnfvXH8k9VO40OyCE',
    shortDescription: 'Berfokus pada kesejahteraan, pemberdayaan komunitas, and inklusivitas sosial di San Andreas.',
    longDescription: 'Social Affairs adalah jantung dari kemanusiaan di San Andreas. Kami percaya bahwa wilayah yang kuat dimulai dari komunitas yang harmonis and terlindungi.',
    vision: 'Membangun masyarakat San Andreas yang harmonis and berdaya saing.',
    responsibilities: ['Bantuan Sosial', 'Manajemen Panti & Rumah Singgah', 'Beasiswa Pendidikan', 'Perlindungan Anak'],
    requirements: ['Empati Tinggi', 'Komunikasi Massa', 'Latar Belakang Sosiologi'],
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
    structuralStaff: [
      { role: 'Kepala Departemen', name: 'Clara Beaumont', level: 1 },
      { role: 'Direktur Kesejahteraan', name: 'Dr. Simon Peter', level: 2 },
      { role: 'Koordinator Komunitas', name: 'Maria Garcia', level: 3 },
      { role: 'Kepala Edukasi', name: 'Prof. David Wu', level: 3 }
    ]
  },
  {
    id: 'te',
    name: Department.TREASURY_ECONOMIC,
    icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEhBc8I7KEY9lABvx_6pAp7j-uc8_tmUy9GfRHtlqYKFWmYwnq857BVOFH5Yspv2pjQImVpNEx-VCyUxkKNXLFXN2I4dJhj4f5SskOPp21feNNnC-hJjEYsTyZ9Eqn-X8vrO0i7hV8QlkBwZ0QArBIX2H-NYyeitOHPjD6F8PelAob6k8yk-esfmXm6m04Hm',
    shortDescription: 'Mengelola anggaran, perpajakan, and pertumbuhan ekonomi San Andreas.',
    longDescription: 'Keberlangsungan infrastruktur San Andreas bergantung pada efisiensi Treasury & Economic dalam mengelola sumber daya fiskal secara bijaksana.',
    vision: 'Stabilitas ekonomi and kemandirian fiskal berkelanjutan bagi San Andreas.',
    responsibilities: ['Audit Keuangan', 'Penagihan Pajak', 'Investasi Publik'],
    requirements: ['Gelar Akuntansi/Ekonomi', 'Etika Kerja Ketat', 'Analis Ekonomi'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    structuralStaff: [
      { role: 'Kepala Departemen', name: 'Julian Sterling', level: 1 },
      { role: 'Bendahara Negara', name: 'Victoria Glass', level: 2 },
      { role: 'Kepala Pajak', name: 'Marcus Flint', level: 3 },
      { role: 'Analis Ekonomi', name: 'Grace Hopper', level: 3 }
    ]
  },
  {
    id: 'hr',
    name: Department.HUMAN_RESOURCE,
    icon: '👥',
    shortDescription: 'Manajemen talenta, rekrutmen, and pengembangan karir aparatur sipil San Andreas.',
    longDescription: 'SDM adalah aset paling berharga. Departemen HR memastikan posisi pemerintahan San Andreas diisi oleh individu terbaik melalui proses seleksi yang ketat.',
    vision: 'Menciptakan birokrasi profesional yang melayani di seluruh San Andreas.',
    responsibilities: ['Seleksi Pegawai', 'Evaluasi Kinerja', 'Pelatihan Kepemimpinan'],
    requirements: ['Psikologi/Manajemen', 'Integritas Tinggi', 'Kemampuan Interpersonal'],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    structuralStaff: [
      { role: 'Kepala Departemen', name: 'Katherine Pierce', level: 1 },
      { role: 'Manajer Rekrutmen', name: 'Thomas Wayne', level: 2 },
      { role: 'Spesialis Pelatihan', name: 'Linda Belcher', level: 3 },
      { role: 'Analis Performa', name: 'James Moriarty', level: 3 }
    ]
  },
];

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Kebijakan Ekonomi Baru San Andreas diumumkan',
    date: '15 Mei 2026',
    summary: 'Departemen Treasury meluncurkan insentif pajak baru bagi pemilik usaha kecil di area pusat kota San Andreas.',
    tag: 'Ekonomi',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'n2',
    title: 'Penerimaan Pegawai Negeri: Musim Gugur 2026',
    date: '12 Mei 2026',
    summary: 'Human Resources membuka pendaftaran untuk beberapa posisi kunci di lima departemen pemerintahan San Andreas.',
    tag: 'Rekrutmen',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'n3',
    title: 'Pembaruan Kesehatan Masyarakat Wilayah',
    date: '10 Mei 2026',
    summary: 'Social Affairs meluncurkan kampanye kebugaran seluruh San Andreas untuk mendorong gaya hidup sehat.',
    tag: 'Kesehatan',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800'
  }
];

export const getStatusFromStock = (stock: number): PawnStatus => {
  if (stock > 500000) return 'BLACK'; 
  if (stock > 200000) return 'RED';   
  if (stock > 20000) return 'YELLOW'; 
  if (stock > 5000) return 'GREEN';   
  return 'BLUE';                      
};

export const INITIAL_PAWN_DATA: PawnItem[] = [
  // PERTANIAN ($5)
  ...['Carrot', 'Corn', 'Cucumber', 'Garlic', 'Potato', 'Tomato', 'Watermelon', 'Cabbage', 'Onion', 'Wheat', 'Barley', 'Sugar Beet', 'Rice', 'Red Pepper', 'Strawberry', 'Orange', 'Lemon'].map(name => ({
    id: `p-${name}`, name, category: 'PERTANIAN' as PawnCategory, basePrice: 5, status: 'BLUE' as PawnStatus, stock: 100
  })),
  // PERTAMBANGAN
  { id: 'm1', name: 'Copper', category: 'PERTAMBANGAN', basePrice: 15, status: 'BLUE', stock: 100 },
  { id: 'm2', name: 'Iron', category: 'PERTAMBANGAN', basePrice: 21, status: 'BLUE', stock: 100 },
  { id: 'm3', name: 'Silver Ingot', category: 'PERTAMBANGAN', basePrice: 25, status: 'BLUE', stock: 100 },
  { id: 'm4', name: 'Gold Ingot', category: 'PERTAMBANGAN', basePrice: 31, status: 'BLUE', stock: 100 },
  { id: 'm5', name: 'Glass', category: 'PERTAMBANGAN', basePrice: 18, status: 'BLUE', stock: 100 },
  { id: 'm6', name: 'Emerald', category: 'PERTAMBANGAN', basePrice: 42, status: 'BLUE', stock: 100 },
  { id: 'm7', name: 'Diamond', category: 'PERTAMBANGAN', basePrice: 25, status: 'BLUE', stock: 100 },
  { id: 'm8', name: 'Ruby', category: 'PERTAMBANGAN', basePrice: 31, status: 'BLUE', stock: 100 },
  { id: 'm9', name: 'Sapphire', category: 'PERTAMBANGAN', basePrice: 10, status: 'BLUE', stock: 100 },
  { id: 'm10', name: 'Steel', category: 'PERTAMBANGAN', basePrice: 56, status: 'BLUE', stock: 100 },
  { id: 'm11', name: 'Aluminum', category: 'PERTAMBANGAN', basePrice: 10, status: 'BLUE', stock: 100 },
  { id: 'm12', name: 'Coal', category: 'PERTAMBANGAN', basePrice: 5, status: 'BLUE', stock: 100 },
  // PERHIASAN
  { id: 'j1', name: 'Emerald Ring', category: 'PERHIASAN', basePrice: 355, status: 'BLUE', stock: 100 },
  { id: 'j2', name: 'Ruby Ring', category: 'PERHIASAN', basePrice: 280, status: 'BLUE', stock: 100 },
  { id: 'j3', name: 'Sapphire Ring', category: 'PERHIASAN', basePrice: 168, status: 'BLUE', stock: 100 },
  { id: 'j4', name: 'Diamond Ring (Silver)', category: 'PERHIASAN', basePrice: 234, status: 'BLUE', stock: 100 },
  { id: 'j5', name: 'Emerald Ring (Silver)', category: 'PERHIASAN', basePrice: 345, status: 'BLUE', stock: 100 },
  { id: 'j6', name: 'Ruby Ring (Silver)', category: 'PERHIASAN', basePrice: 271, status: 'BLUE', stock: 100 },
  { id: 'j7', name: 'Sapphire Ring (Silver)', category: 'PERHIASAN', basePrice: 159, status: 'BLUE', stock: 100 },
  { id: 'j8', name: 'Ruby Necklace', category: 'PERHIASAN', basePrice: 786, status: 'BLUE', stock: 100 },
  { id: 'j9', name: 'Sapphire Necklace', category: 'PERHIASAN', basePrice: 280, status: 'BLUE', stock: 100 },
  { id: 'j10', name: 'Emerald Necklace', category: 'PERHIASAN', basePrice: 561, status: 'BLUE', stock: 100 },
  { id: 'j11', name: 'Diamond Necklace (Silver)', category: 'PERHIASAN', basePrice: 375, status: 'BLUE', stock: 100 },
  { id: 'j12', name: 'Ruby Necklace (Silver)', category: 'PERHIASAN', basePrice: 768, status: 'BLUE', stock: 100 },
  { id: 'j13', name: 'Sapphire Necklace (Silver)', category: 'PERHIASAN', basePrice: 261, status: 'BLUE', stock: 100 },
  { id: 'j14', name: 'Emerald Necklace (Silver)', category: 'PERHIASAN', basePrice: 543, status: 'BLUE', stock: 100 },
  { id: 'j15', name: 'Diamond Earring', category: 'PERHIASAN', basePrice: 148, status: 'BLUE', stock: 100 },
  { id: 'j16', name: 'Ruby Earring', category: 'PERHIASAN', basePrice: 168, status: 'BLUE', stock: 100 },
  { id: 'j17', name: 'Sapphire Earring', category: 'PERHIASAN', basePrice: 112, status: 'BLUE', stock: 100 },
  { id: 'j18', name: 'Emerald Earring', category: 'PERHIASAN', basePrice: 195, status: 'BLUE', stock: 100 },
  { id: 'j19', name: 'Diamond Earring (Silver)', category: 'PERHIASAN', basePrice: 139, status: 'BLUE', stock: 100 },
  { id: 'j20', name: 'Ruby Earring (Silver)', category: 'PERHIASAN', basePrice: 159, status: 'BLUE', stock: 100 },
  { id: 'j21', name: 'Sapphire Earring (Silver)', category: 'PERHIASAN', basePrice: 103, status: 'BLUE', stock: 100 },
  { id: 'j22', name: 'Emerald Earring (Silver)', category: 'PERHIASAN', basePrice: 195, status: 'BLUE', stock: 100 },
  // ALKOHOL ($38 - $45)
  { id: 'a1', name: 'Red Wine', category: 'ALKOHOL', basePrice: 45, status: 'BLUE', stock: 100 },
  { id: 'a2', name: 'White Wine', category: 'ALKOHOL', basePrice: 45, status: 'BLUE', stock: 100 },
  ...['Gin', 'Vodka', 'Whiskey', 'Cognag', 'Rum', 'Tonic', 'Carbonated Water', 'Sake', 'Soju', 'Arak', 'Tuak'].map(name => ({
    id: `a-${name}`, name, category: 'ALKOHOL' as PawnCategory, basePrice: 38, status: 'BLUE' as PawnStatus, stock: 100
  })),
  // HUNTING
  { id: 'h1', name: 'Skin Deer Low', category: 'HUNTING', basePrice: 9, status: 'BLUE', stock: 100 },
  { id: 'h2', name: 'Skin Deer Medium', category: 'HUNTING', basePrice: 11, status: 'BLUE', stock: 100 },
  { id: 'h3', name: 'Skin Deer Good', category: 'HUNTING', basePrice: 15, status: 'BLUE', stock: 100 },
  { id: 'h4', name: 'Skin Boar Low', category: 'HUNTING', basePrice: 9, status: 'BLUE', stock: 100 },
  { id: 'h5', name: 'Skin Boar Medium', category: 'HUNTING', basePrice: 11, status: 'BLUE', stock: 100 },
  { id: 'h6', name: 'Skin Boar Good', category: 'HUNTING', basePrice: 15, status: 'BLUE', stock: 100 },
  { id: 'h7', name: 'Skin Mtlion Low', category: 'HUNTING', basePrice: 11, status: 'BLUE', stock: 100 },
  { id: 'h8', name: 'Skin Mtlion Medium', category: 'HUNTING', basePrice: 15, status: 'BLUE', stock: 100 },
  { id: 'h9', name: 'Skin Mtlion Good', category: 'HUNTING', basePrice: 18, status: 'BLUE', stock: 100 },
  { id: 'h10', name: 'Raw Meat', category: 'HUNTING', basePrice: 9, status: 'BLUE', stock: 100 },
  { id: 'h11', name: 'Packaged Chicken', category: 'HUNTING', basePrice: 13, status: 'BLUE', stock: 100 },
  // RONGSOK
  { id: 'r1', name: 'Metal Scrap', category: 'RONGSOK', basePrice: 75, status: 'BLUE', stock: 100 },
  { id: 'r2', name: 'Broken Phone', category: 'RONGSOK', basePrice: 150, status: 'BLUE', stock: 100 },
  { id: 'r3', name: 'Empty Bottle', category: 'RONGSOK', basePrice: 2, status: 'BLUE', stock: 100 },
  { id: 'r4', name: 'Empty Can', category: 'RONGSOK', basePrice: 0, status: 'BLUE', stock: 100 },
];
