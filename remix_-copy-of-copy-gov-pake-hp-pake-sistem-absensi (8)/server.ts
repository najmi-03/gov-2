import fs from 'fs';
import express from "express";
import { createClient } from "@libsql/client";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { startDiscordBot, getBotLogs, forceProcessHistory } from "./discordBot";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Koneksi ke Turso
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://gov-ime-minjadev-alt.aws-ap-northeast-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMwOTY0OTUsImlkIjoiMDE5Y2Q0YzktMmQwMS03Mjk1LTk2OTEtODY1YTBmOTUwZmI4IiwicmlkIjoiZTJhNmViNDUtNDUxYy00YjhmLTg2MDYtOGJjMGM5N2Q1YWMyIn0.vyQDCZ3AL6oLorMstNOh0c5ID6aHKCFVZVAVZ8gbqtJp4hJUtf5SdBxL_vmIqI8ApSQKXuKrhu7hzyQFgoWDBg",
  });

  // START BOT SEGERA SETELAH DB CONNECTED
  try {
     // startDiscordBot(client); // NONAKTIF SEMENTARA SESUAI PERMINTAAN
  } catch(e) {
     console.error("Bot throw error sync:", e);
  }

  // Inisialisasi Tabel
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        nip TEXT UNIQUE,
        password TEXT NOT NULL,
        ic_name TEXT NOT NULL,
        role TEXT DEFAULT 'CITIZEN',
        status TEXT DEFAULT 'APPROVED', -- Default APPROVED for existing/manual users
        requested_role TEXT,
        department_id TEXT,
        salary_per_hour INTEGER DEFAULT 0,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure nip column exists for existing databases
    try {
      await client.execute("ALTER TABLE users ADD COLUMN nip TEXT");
    } catch (e) {
      // Column might already exist
    }
    try {
      await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nip ON users(nip)");
    } catch (e) {}

    await client.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        staff_name TEXT,
        role TEXT,
        action TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT,
        summary TEXT,
        tag TEXT,
        imageUrl TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS pawnshop_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        category TEXT,
        base_price INTEGER,
        stock INTEGER,
        status TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS recruitment_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        is_open INTEGER DEFAULT 1,
        title TEXT,
        description TEXT,
        target_sheet_name TEXT,
        script_url TEXT,
        spreadsheet_url TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS recruitment_questions (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT,
        required INTEGER DEFAULT 1,
        is_bold INTEGER DEFAULT 0,
        placeholder TEXT,
        sort_order INTEGER
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS recruitment_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        batch_name TEXT,
        data TEXT
      );
    `);

    // Ensure batch_name exists for older databases
    try {
      await client.execute("ALTER TABLE recruitment_responses ADD COLUMN batch_name TEXT");
    } catch (e) {}

    await client.execute(`
      CREATE TABLE IF NOT EXISTS app_configs (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS permission_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_name TEXT NOT NULL,
        type TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        reason TEXT,
        status TEXT DEFAULT 'APPROVED',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database initialized successfully");

    // Seed initial data if empty
    const userCount = await client.execute("SELECT COUNT(*) as count FROM users");
    if (Number(userCount.rows[0].count) === 0) {
      console.log("Seeding initial staff data...");
      const initialStaff = [
        { pin: "PRES1", name: "Marcus Vane", role: "SUPER_ADMIN" },
        { pin: "SECSTATE1", name: "Dominic Sterling", role: "SECRETARY_OF_STATE" },
        { pin: "HRD1", name: "Katherine Pierce", role: "HR_ADMIN" },
        { pin: "MONEY1", name: "Julian Sterling", role: "TREASURY_ADMIN" },
        { pin: "DHA1", name: "Alaric Thorne", role: "DHA_ADMIN" },
        { pin: "NEWS1", name: "Clara Beaumont", role: "NEWS_ADMIN" },
        { pin: "PAWN1", name: "Victoria Glass", role: "PAWN_ADMIN" }
      ];

      for (const staff of initialStaff) {
        await client.execute({
          sql: "INSERT INTO users (username, password, ic_name, role) VALUES (?, ?, ?, ?)",
          args: [staff.pin, "password123", staff.name, staff.role]
        });
      }
      console.log("Seeding complete.");
    }

    // Ensure HEALTH_ADMIN exists with pin 1
    const healthUserCount = await client.execute("SELECT COUNT(*) as count FROM users WHERE username = '1'");
    if (Number(healthUserCount.rows[0].count) === 0) {
      console.log("Seeding HEALTH_ADMIN user...");
      await client.execute({
        sql: "INSERT INTO users (username, password, ic_name, role) VALUES (?, ?, ?, ?)",
        args: ["1", "password123", "Admin Health", "HEALTH_ADMIN"]
      });
    }

    // Seed recruitment config if empty
    const recruitCount = await client.execute("SELECT COUNT(*) as count FROM recruitment_config");
    if (Number(recruitCount.rows[0].count) === 0) {
      console.log("Seeding initial recruitment config...");
      await client.execute({
        sql: "INSERT INTO recruitment_config (id, is_open, title, description, target_sheet_name) VALUES (1, 1, ?, ?, ?)",
        args: ["Rekrutmen Staff Pemerintahan", "Kami mencari individu berbakat untuk bergabung dalam pelayanan publik.", "Batch_1"]
      });
      
      const initialQuestions = [
        { id: 'q1', label: 'Nama Lengkap (IC)', type: 'SHORT', required: 1, is_bold: 1, sort_order: 0 },
        { id: 'q2', label: 'Umur / Tanggal Lahir', type: 'SHORT', required: 1, is_bold: 0, sort_order: 1 },
        { id: 'q3', label: 'Motivasi Bergabung', type: 'PARAGRAPH', required: 1, is_bold: 0, sort_order: 2 }
      ];

      for (const q of initialQuestions) {
        await client.execute({
          sql: "INSERT INTO recruitment_questions (id, label, type, required, is_bold, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
          args: [q.id, q.label, q.type, q.required, q.is_bold, q.sort_order]
        });
      }
      console.log("Recruitment seeding complete.");
    }

    // Seed news if empty or missing political news
    const newsCount = await client.execute("SELECT COUNT(*) as count FROM news");
    const polNewsCount = await client.execute("SELECT COUNT(*) as count FROM news WHERE tag = 'POLITIK'");
    
    if (Number(newsCount.rows[0].count) === 0 || Number(polNewsCount.rows[0].count) === 0) {
      console.log("Seeding initial/political news...");
      const initialNews = [
        { id: 'n1', title: 'Portal Pemerintah Turso Aktif', date: new Date().toLocaleDateString('id-ID'), summary: 'Sistem database pemerintah kini menggunakan Turso Cloud untuk performa maksimal.', tag: 'INFO', imageUrl: 'https://picsum.photos/seed/gov/800/400' },
        { id: 'n2', title: 'Rekrutmen Batch 1 Dibuka', date: new Date().toLocaleDateString('id-ID'), summary: 'Pendaftaran staff baru telah dibuka. Silakan cek halaman rekrutmen.', tag: 'REKRUTMEN', imageUrl: 'https://picsum.photos/seed/staff/800/400' },
        { id: 'n3', title: 'Debat Publik Calon Walikota San Andreas', date: new Date().toLocaleDateString('id-ID'), summary: 'Debat perdana akan dilaksanakan di City Hall besok malam pukul 20:00.', tag: 'POLITIK', imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800' },
        { id: 'n4', title: 'RUU Tata Ruang Baru Disahkan', date: new Date().toLocaleDateString('id-ID'), summary: 'Senat telah menyetujui perubahan zona komersial di wilayah utara.', tag: 'POLITIK', imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800' }
      ];

      for (const n of initialNews) {
        await client.execute({
          sql: "INSERT OR IGNORE INTO news (id, title, date, summary, tag, imageUrl) VALUES (?, ?, ?, ?, ?, ?)",
          args: [n.id, n.title, n.date, n.summary, n.tag, n.imageUrl]
        });
      }
      console.log("News seeding complete.");
    }

    // Ensure status and requested_role exist for older databases
    try {
      await client.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'APPROVED'");
    } catch (e) {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN requested_role TEXT");
    } catch (e) {}
    try {
      await client.execute("ALTER TABLE users ADD COLUMN requested_department TEXT");
    } catch (e) {}

    // Seed departement if empty
    const departementConfig = await client.execute("SELECT * FROM app_configs WHERE key = 'DEPARTEMENT'");
    if (departementConfig.rows.length === 0) {
      const initialDepartement = [
        "DEPARTEMEN KEADILAN",
        "DEPARTEMEN KEUANGAN",
        "DEPARTEMEN KESEHATAN",
        "DEPARTEMEN KEAMANAN",
        "DEPARTEMEN PERHUBUNGAN",
        "DEPARTEMEN SOSIAL"
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('DEPARTEMENT', ?)",
        args: [JSON.stringify(initialDepartement)]
      });
    }

    // Seed jabatan if empty
    const jabatanConfig = await client.execute("SELECT * FROM app_configs WHERE key = 'JABATAN'");
    if (jabatanConfig.rows.length === 0) {
      const initialJabatan = [
        "STAFF MAGANG",
        "STAFF JUNIOR",
        "STAFF SENIOR",
        "SEKRETARIS DEPARTEMEN",
        "BENDAHARA DEPARTEMEN",
        "KEPALA DIVISI",
        "WAKIL KEPALA DEPARTEMEN",
        "KEPALA DEPARTEMEN"
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('JABATAN', ?)",
        args: [JSON.stringify(initialJabatan)]
      });
    }

    // Seed roles if empty
    const rolesConfig = await client.execute("SELECT * FROM app_configs WHERE key = 'ROLES'");
    if (rolesConfig.rows.length === 0) {
      const initialRoles = [
        "STAFF",
        "NEWS_ADMIN",
        "PAWN_ADMIN",
        "PAWN_STAFF",
        "HR_ADMIN",
        "TREASURY_ADMIN",
        "DHA_ADMIN",
        "SECRETARY_ADMIN",
        "SECRETARY_OF_STATE"
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('ROLES', ?)",
        args: [JSON.stringify(initialRoles)]
      });
    }

    // Seed legislative docs if empty
    const docsCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'DOCS'");
    if (Number(docsCount.rows[0].count) === 0) {
      console.log("Seeding initial legislative documents...");
      const initialDocs = [
        { id: 'doc1', title: 'Kode Etik Warga', icon: '📜', desc: 'Hukum dasar yang mengatur perilaku harian.', link: '#' },
        { id: 'doc2', title: 'Undang-Undang Bisnis', icon: '🏢', desc: 'Aturan untuk operasional komersial.', link: '#' },
        { id: 'doc3', title: 'Piagam Keamanan', icon: '👮', desc: 'Protokol tanggap darurat publik.', link: '#' },
        { id: 'doc4', title: 'Pedoman Perpajakan', icon: '📊', desc: 'Tarif saat ini dan tanggal pembayaran.', link: '#' },
        { id: 'doc5', title: 'Konstitusi San Andreas', icon: '⚖️', desc: 'Dokumen politik tertinggi negara bagian.', link: '#' }
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('DOCS', ?)",
        args: [JSON.stringify(initialDocs)]
      });
      console.log("Docs seeding complete.");
    }

    // Seed webhooks if empty
    const webhooksCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'WEBHOOKS'");
    if (Number(webhooksCount.rows[0].count) === 0) {
      console.log("Seeding initial webhooks...");
      const initialWebhooks: Record<string, string> = {
        'ls_gov_webhook_ktp': '',
        'ls_gov_webhook_skck': '',
        'ls_gov_webhook_rekrutmen': '',
        'ls_gov_webhook_cuti': '',
        'ls_gov_webhook_sakit': '',
        'ls_gov_webhook_resign': '',
        'ls_gov_webhook_lembur': '',
        'ls_gov_sec_webhook': '', 
        'ls_gov_salary_webhook': '',
        'ls_gov_pawn_webhook': '',
        'ls_gov_locker_webhook': '',
        'ls_gov_feedback_public': '',
        'ls_gov_feedback_staff': '',
        'ls_discord_webhook': ''
      };
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('WEBHOOKS', ?)",
        args: [JSON.stringify(initialWebhooks)]
      });
      console.log("Webhooks seeding complete.");
    }

    // Seed carousel if empty
    const carouselCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'CAROUSEL'");
    if (Number(carouselCount.rows[0].count) === 0) {
      console.log("Seeding initial carousel...");
      const initialCarousel = [
        {
          id: 'slide1',
          imageUrl: "https://blogger.googleusercontent.com/img/a/AVvXsEjaXIjnkB3jrrHYq0gTWWZwzEBlvj3q4tR9RWxppWhLLbDh6UcoH1tUPsyJcRKstJtuddulcnjJ8ZXhp4QvVuA9aXYFlcq522L9P2KWJ_j9VpkQFAZzaLx7IqDpaCmtKAryBFW_CS73run7Ah9GLZKqcFbrnKqdiyRZX1M5t9zClMbMt-iuNzJCQHJxXd3I",
          title: "Selamat Datang di San Andreas",
          subtitle: "Pusat Pelayanan Publik dan Administrasi Pemerintahan Terpadu."
        },
        {
          id: 'slide2',
          imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1920",
          title: "Membangun Masa Depan",
          subtitle: "Inovasi dan Transparansi untuk Kesejahteraan Seluruh Warga."
        }
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('CAROUSEL', ?)",
        args: [JSON.stringify(initialCarousel)]
      });
      console.log("Carousel seeding complete.");
    }

    // Seed pawn data if empty
    const pawnCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'PAWN'");
    if (Number(pawnCount.rows[0].count) === 0) {
      console.log("Seeding initial pawn data...");
      const initialPawn = [
        { id: 'p-Carrot', name: 'Carrot', category: 'PERTANIAN', basePrice: 5, status: 'BLUE', stock: 100 },
        { id: 'p-Corn', name: 'Corn', category: 'PERTANIAN', basePrice: 5, status: 'BLUE', stock: 100 },
        { id: 'm1', name: 'Copper', category: 'PERTAMBANGAN', basePrice: 15, status: 'BLUE', stock: 100 },
        { id: 'm2', name: 'Iron', category: 'PERTAMBANGAN', basePrice: 21, status: 'BLUE', stock: 100 },
        { id: 'j1', name: 'Emerald Ring', category: 'PERHIASAN', basePrice: 355, status: 'BLUE', stock: 100 }
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('PAWN', ?)",
        args: [JSON.stringify(initialPawn)]
      });
      console.log("Pawn seeding complete.");
    }

    // Seed bpom data if empty
    const bpomCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'BPOM'");
    if (Number(bpomCount.rows[0].count) === 0) {
      console.log("Seeding initial BPOM data...");
      const initialBpom = [
        { id: '1', productName: 'Paracetamol 500mg', manufacturer: 'PharmaCorp', status: 'Aman', registrationNumber: 'BPOM-SA-2023-001' },
        { id: '2', productName: 'Minuman Energi Banteng', manufacturer: 'Beverage Inc', status: 'Berbahaya' },
        { id: '3', productName: 'Vitamin C 1000mg', manufacturer: 'HealthPlus', status: 'Aman', registrationNumber: 'BPOM-SA-2023-045' },
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('BPOM', ?)",
        args: [JSON.stringify(initialBpom)]
      });
      console.log("BPOM seeding complete.");
    }

    // Seed doctor cert data if empty
    const docCertCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'DOCTOR_CERT'");
    if (Number(docCertCount.rows[0].count) === 0) {
      console.log("Seeding initial Doctor Cert data...");
      const initialCerts = [
        { id: '1', doctorName: 'Dr. John Doe', specialization: 'Dokter Umum', status: 'Aktif', licenseNumber: 'SIP-112233', expiryDate: '2027-12-31' },
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('DOCTOR_CERT', ?)",
        args: [JSON.stringify(initialCerts)]
      });
      console.log("Doctor Cert seeding complete.");
    }

    // Seed departments if empty
    const deptsCount = await client.execute("SELECT COUNT(*) as count FROM app_configs WHERE key = 'DEPTS'");
    if (Number(deptsCount.rows[0].count) === 0) {
      console.log("Seeding initial departments...");
      const initialDepts = [
        {
          id: 'ha',
          name: 'Home Affairs',
          icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEgqXo8LtommikmxINNui4ohO9aEFE3T2yQXFIsu4xf1PfdPj_pZn0fmpo3jxfIZH8BJ_NQe8RhZR5itW7t2DlZyd7Gz7JIX5ZBGK1f5zw_cSjszCzQ315irJctxxYrnhRBqA_EkZwhECpUiHgzXbdy0ochLzsOwTFTvzx_520qPrhUfJWbn09Q89oC60Xy0',
          shortDescription: 'Mengelola catatan kota, perizinan, and perencanaan tata ruang San Andreas.',
          longDescription: 'Departemen Home Affairs bertanggung jawab atas integritas sipil negara bagian. Kami memastikan setiap warga memiliki identitas yang sah and setiap bisnis beroperasi di bawah payung hukum yang tepat.',
          vision: 'Mewujudkan tata kelola yang transparan and administratif yang efisien di San Andreas.',
          responsibilities: ['Manajemen Basis Data Warga', 'Sertifikasi Properti', 'Izin Usaha', 'Tata Ruang'],
          requirements: ['Paham Prosedur Hukum', 'Kemampuan Administratif', 'Min. Usia 21 Tahun'],
          imageUrl: 'https://blogger.googleusercontent.com/img/a/AVvXsEjI0eG7lqgBCrlf22LB_3rdnaKmd9wzSNPNDHx0jniTUVB_7eTAN3BTjwIuxDSQDvN8Jjie3NNsf-96XFaAgYLQQh5lVuXfiKmKgGBG2fzBUVVVndsNt2knSa--p76Gw85UYY7oQMbjIxqvmtGlNKgXmObAvFNXkXqAivxGlE1IO-GsOAvtAtFoqY9YQUXP',
          structuralStaff: [
            { role: 'Kepala Departemen', name: 'Alaric Thorne', level: 1 },
            { role: 'Sekretaris Departemen', name: 'Elena Rodriguez', level: 2 }
          ]
        },
        {
          id: 'te',
          name: 'Treasury & Economic',
          icon: 'https://blogger.googleusercontent.com/img/a/AVvXsEhBc8I7KEY9lABvx_6pAp7j-uc8_tmUy9GfRHtlqYKFWmYwnq857BVOFH5Yspv2pjQImVpNEx-VCyUxkKNXLFXN2I4dJhj4f5SskOPp21feNNnC-hJjEYsTyZ9Eqn-X8vrO0i7hV8QlkBwZ0QArBIX2H-NYyeitOHPjD6F8PelAob6k8yk-esfmXm6m04Hm',
          shortDescription: 'Mengelola anggaran, perpajakan, and pertumbuhan ekonomi San Andreas.',
          longDescription: 'Keberlangsungan infrastruktur San Andreas bergantung pada efisiensi Treasury & Economic dalam mengelola sumber daya fiskal secara bijaksana.',
          vision: 'Stabilitas ekonomi and kemandirian fiskal berkelanjutan bagi San Andreas.',
          responsibilities: ['Audit Keuangan', 'Penagihan Pajak', 'Investasi Publik'],
          requirements: ['Gelar Akuntansi/Ekonomi', 'Etika Kerja Ketat', 'Analis Ekonomi'],
          imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
          structuralStaff: [
            { role: 'Kepala Departemen', name: 'Julian Sterling', level: 1 },
            { role: 'Bendahara Negara', name: 'Victoria Glass', level: 2 }
          ]
        },
        {
          id: 'hr',
          name: 'Human Resource',
          icon: '👥',
          shortDescription: 'Manajemen talenta, rekrutmen, and pengembangan karir aparatur sipil San Andreas.',
          longDescription: 'SDM adalah aset paling berharga. Departemen HR memastikan posisi pemerintahan San Andreas diisi oleh individu terbaik melalui proses seleksi yang ketat.',
          vision: 'Menciptakan birokrasi profesional yang melayani di seluruh San Andreas.',
          responsibilities: ['Seleksi Pegawai', 'Evaluasi Kinerja', 'Pelatihan Kepemimpinan'],
          requirements: ['Psikologi/Manajemen', 'Integritas Tinggi', 'Kemampuan Interpersonal'],
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
          structuralStaff: [
            { role: 'Kepala Departemen', name: 'Katherine Pierce', level: 1 },
            { role: 'Manajer Rekrutmen', name: 'Thomas Wayne', level: 2 }
          ]
        }
      ];
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('DEPTS', ?)",
        args: [JSON.stringify(initialDepts)]
      });
      console.log("Departments seeding complete.");
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
  }

  app.use(express.json());

  // API Routes
  app.get("/api/bot-debug", (req, res) => {
    res.json(getBotLogs());
  });

  app.get("/api/bot-process-history", async (req, res) => {
    try {
      const msgs = await forceProcessHistory();
      res.json({ success: true, count: msgs, logs: getBotLogs() });
    } catch (err: any) {
      res.json({ success: false, error: err.message, logs: getBotLogs() });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      // Check in Turso - Only allow login with username
      const result = await client.execute({
        sql: "SELECT * FROM users WHERE username = ? AND password = ?",
        args: [username, password]
      });

      if (result.rows.length > 0) {
        const user = result.rows[0] as any;
        
        if (user.status === 'PENDING') {
          return res.status(403).json({ error: "Akun Anda sedang menunggu persetujuan HRD." });
        }
        if (user.status === 'REJECTED') {
          return res.status(403).json({ error: "Pendaftaran Anda ditolak oleh HRD." });
        }

        res.json({
          isAdmin: user.role !== 'CITIZEN' && user.role !== 'NONE',
          staffName: user.ic_name,
          role: user.role,
          nip: user.nip || user.username,
          username: user.username
        });
      } else {
        res.status(401).json({ error: "Invalid PIN" });
      }
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM users WHERE status = 'APPROVED'");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { username, password, ic_name, role } = req.body;
    try {
      await client.execute({
        sql: "INSERT INTO users (username, password, ic_name, role) VALUES (?, ?, ?, ?)",
        args: [username, password, ic_name, role]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/signup", async (req, res) => {
    const { pin, ic_name, requested_role, requested_department } = req.body;
    try {
      // Use a temporary username for pending users
      const tempUsername = `PENDING_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      await client.execute({
        sql: "INSERT INTO users (username, password, ic_name, role, status, requested_role, requested_department) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [tempUsername, pin, ic_name, "CITIZEN", "PENDING", requested_role || "STAFF", requested_department || "UNASSIGNED"]
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mendaftar." });
    }
  });

  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM users WHERE status = 'PENDING'");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.post("/api/admin/approve-user", async (req, res) => {
    const { userId, status, role, nip, username, department } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ error: "Data tidak lengkap (userId/status missing)" });
    }

    try {
      if (status === 'APPROVED') {
        if (!username || !nip) {
          return res.status(400).json({ error: "Username dan NIP wajib diisi untuk persetujuan." });
        }

        // Check if username or NIP already exists for OTHER users
        const checkExisting = await client.execute({
          sql: "SELECT id, username, nip FROM users WHERE (username = ? OR nip = ?) AND id != ?",
          args: [username, nip, userId]
        });

        if (checkExisting.rows.length > 0) {
          const existing = checkExisting.rows[0];
          if (existing.username === username) {
            return res.status(400).json({ error: `Username '${username}' sudah digunakan oleh user lain.` });
          }
          if (existing.nip === nip) {
            return res.status(400).json({ error: `NIP '${nip}' sudah digunakan oleh user lain.` });
          }
        }

        await client.execute({
          sql: "UPDATE users SET status = ?, role = ?, nip = ?, username = ?, department_id = ? WHERE id = ?",
          args: [status, role || 'STAFF', nip, username, department || 'UNASSIGNED', userId]
        });
      } else {
        await client.execute({
          sql: "UPDATE users SET status = ? WHERE id = ?",
          args: [status, userId]
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error in approve-user:", err);
      res.status(500).json({ error: "Gagal memperbarui status user: " + (err.message || "Internal Server Error") });
    }
  });

  app.get("/api/departement", async (req, res) => {
    try {
      const result = await client.execute("SELECT value FROM app_configs WHERE key = 'DEPARTEMENT'");
      if (result.rows.length > 0) {
        res.json(JSON.parse(result.rows[0].value as string));
      } else {
        res.json([]);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch departement" });
    }
  });

  app.post("/api/departement", async (req, res) => {
    const { departement } = req.body;
    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO app_configs (key, value) VALUES ('DEPARTEMENT', ?)",
        args: [JSON.stringify(departement)]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update departement" });
    }
  });

  app.get("/api/jabatan", async (req, res) => {
    try {
      const result = await client.execute("SELECT value FROM app_configs WHERE key = 'JABATAN'");
      if (result.rows.length > 0) {
        res.json(JSON.parse(result.rows[0].value as string));
      } else {
        res.json([]);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch jabatan" });
    }
  });

  app.post("/api/jabatan", async (req, res) => {
    const { jabatan } = req.body;
    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO app_configs (key, value) VALUES ('JABATAN', ?)",
        args: [JSON.stringify(jabatan)]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update jabatan" });
    }
  });

  app.get("/api/roles", async (req, res) => {
    try {
      const result = await client.execute("SELECT value FROM app_configs WHERE key = 'ROLES'");
      if (result.rows.length > 0) {
        res.json(JSON.parse(result.rows[0].value as string));
      } else {
        res.json([]);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    const { roles } = req.body;
    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO app_configs (key, value) VALUES ('ROLES', ?)",
        args: [JSON.stringify(roles)]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update roles" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM news ORDER BY date DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    const { id, title, date, summary, tag, imageUrl } = req.body;
    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO news (id, title, date, summary, tag, imageUrl) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, title, date, summary, tag, imageUrl]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save news" });
    }
  });

  app.get("/api/attendance", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM attendance ORDER BY timestamp DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    const { staff_name, role, action, notes, timestamp } = req.body;
    try {
      if (timestamp) {
        await client.execute({
          sql: "INSERT INTO attendance (staff_name, role, action, notes, timestamp) VALUES (?, ?, ?, ?, ?)",
          args: [staff_name, role, action, notes || "", timestamp]
        });
      } else {
        await client.execute({
          sql: "INSERT INTO attendance (staff_name, role, action, notes) VALUES (?, ?, ?, ?)",
          args: [staff_name, role, action, notes || ""]
        });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save attendance" });
    }
  });

  app.get("/api/permissions/logs", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM permission_logs ORDER BY timestamp DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch permission logs" });
    }
  });

  app.post("/api/permissions/logs", async (req, res) => {
    const { staff_name, type, start_date, end_date, reason } = req.body;
    try {
      await client.execute({
        sql: "INSERT INTO permission_logs (staff_name, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)",
        args: [staff_name, type, start_date || "", end_date || "", reason || ""]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save permission log" });
    }
  });

  // Recruitment Endpoints
  app.get("/api/recruitment", async (req, res) => {
    try {
      const configResult = await client.execute("SELECT * FROM recruitment_config WHERE id = 1");
      const questionsResult = await client.execute("SELECT * FROM recruitment_questions ORDER BY sort_order ASC");
      
      if (configResult.rows.length === 0) {
        return res.json(null);
      }

      const config = configResult.rows[0];
      const questions = questionsResult.rows.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : [],
        required: !!q.required,
        isBold: !!q.is_bold
      }));

      res.json({
        isOpen: !!config.is_open,
        title: config.title,
        description: config.description,
        targetSheetName: config.target_sheet_name,
        scriptUrl: config.script_url,
        spreadsheetUrl: config.spreadsheet_url,
        questions
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch recruitment config" });
    }
  });

  app.post("/api/recruitment", async (req, res) => {
    const { isOpen, title, description, targetSheetName, scriptUrl, spreadsheetUrl, questions } = req.body;
    try {
      // Update Config
      await client.execute({
        sql: "INSERT OR REPLACE INTO recruitment_config (id, is_open, title, description, target_sheet_name, script_url, spreadsheet_url) VALUES (1, ?, ?, ?, ?, ?, ?)",
        args: [isOpen ? 1 : 0, title, description, targetSheetName, scriptUrl, spreadsheetUrl]
      });

      // Update Questions (Delete and Re-insert for simplicity)
      await client.execute("DELETE FROM recruitment_questions");
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await client.execute({
          sql: "INSERT INTO recruitment_questions (id, label, type, options, required, is_bold, placeholder, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [q.id, q.label, q.type, JSON.stringify(q.options || []), q.required ? 1 : 0, q.isBold ? 1 : 0, q.placeholder || "", i]
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save recruitment config" });
    }
  });

  app.get("/api/responses/debug", async (req, res) => {
    try {
      const result = await client.execute("SELECT * FROM recruitment_responses ORDER BY submitted_at DESC LIMIT 10");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/responses", async (req, res) => {
    const { batch } = req.query;
    try {
      let sql = "SELECT * FROM recruitment_responses";
      let args: any[] = [];
      
      if (batch) {
        sql += " WHERE batch_name = ?";
        args.push(batch);
      }
      
      sql += " ORDER BY submitted_at DESC";
      
      const result = await client.execute({ sql, args });
      res.json(result.rows.map(r => {
        let parsedData = {};
        try {
          parsedData = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
        } catch (e) {
          console.error("Failed to parse response data for ID", r.id, "Data:", r.data);
          parsedData = { "Error": "Data format invalid", "Raw Data": String(r.data) };
        }
        return {
          ...r,
          data: parsedData
        };
      }));
    } catch (err) {
      console.error("GET /api/responses error:", err);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/responses", async (req, res) => {
    console.log("Received POST /api/responses", req.body);
    const { data, batch_name } = req.body;
    try {
      await client.execute({
        sql: "INSERT INTO recruitment_responses (data, batch_name) VALUES (?, ?)",
        args: [JSON.stringify(data), batch_name || "Unknown"]
      });
      console.log("Successfully saved response");
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to save response", err);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // Generic Config Endpoints
  app.get("/api/config/:key", async (req, res) => {
    const { key } = req.params;
    try {
      const result = await client.execute({
        sql: "SELECT value FROM app_configs WHERE key = ?",
        args: [key]
      });
      if (result.rows.length > 0) {
        res.json(JSON.parse(result.rows[0].value as string));
      } else {
        res.json(null);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.post("/api/config/:key", async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    try {
      await client.execute({
        sql: "INSERT OR REPLACE INTO app_configs (key, value) VALUES (?, ?)",
        args: [key, JSON.stringify(value)]
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save config" });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
