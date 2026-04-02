-- ============================================
-- Supabase Database Setup
-- ============================================
-- Jalankan SQL ini di Supabase Dashboard:
-- Buka project > SQL Editor > New Query > Paste semua ini > Run
-- ============================================

-- === TABEL: works (Portfolio Designs) ===
CREATE TABLE IF NOT EXISTS works (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    slug TEXT UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === TABEL: work_layers (Layer per design) ===
CREATE TABLE IF NOT EXISTS work_layers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id UUID REFERENCES works(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- === TABEL: experiences (Pengalaman Kerja) ===
CREATE TABLE IF NOT EXISTS experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === ROW LEVEL SECURITY ===
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Public bisa baca (untuk website portfolio)
DROP POLICY IF EXISTS "Public read works" ON works;
DROP POLICY IF EXISTS "Public read work_layers" ON work_layers;
DROP POLICY IF EXISTS "Public read experiences" ON experiences;

CREATE POLICY "Public read works" ON works FOR SELECT USING (true);
CREATE POLICY "Public read work_layers" ON work_layers FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);

-- Hanya user yang login (admin) bisa tulis
DROP POLICY IF EXISTS "Auth insert works" ON works;
DROP POLICY IF EXISTS "Auth update works" ON works;
DROP POLICY IF EXISTS "Auth delete works" ON works;
CREATE POLICY "Auth insert works" ON works FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update works" ON works FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete works" ON works FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth insert work_layers" ON work_layers;
DROP POLICY IF EXISTS "Auth update work_layers" ON work_layers;
DROP POLICY IF EXISTS "Auth delete work_layers" ON work_layers;
CREATE POLICY "Auth insert work_layers" ON work_layers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update work_layers" ON work_layers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete work_layers" ON work_layers FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth insert experiences" ON experiences;
DROP POLICY IF EXISTS "Auth update experiences" ON experiences;
DROP POLICY IF EXISTS "Auth delete experiences" ON experiences;
CREATE POLICY "Auth insert experiences" ON experiences FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update experiences" ON experiences FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete experiences" ON experiences FOR DELETE USING (auth.role() = 'authenticated');

-- === STORAGE BUCKETS & POLICIES ===
-- Membuat bucket 'portfolio' secara otomatis menjadi public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Hapus kebijakan lama jika ada agar tidak bentrok (error)
DROP POLICY IF EXISTS "Public read portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Auth update portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete portfolio files" ON storage.objects;

-- Buat aturan yang benar untuk izin baca/tulis
CREATE POLICY "Public read portfolio files" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Auth upload portfolio files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update portfolio files" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete portfolio files" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

-- === SEED DATA: Pengalaman Kerja ===
INSERT INTO experiences (company, period, location, description, tags, sort_order) VALUES
(
    'Mr.Yos',
    '2020',
    'Jl. Mayor Oking, Cibinong, Kab. Bogor',
    'Bekerja sebagai Asisten Digital Marketing, mengatur workflow sebagai Workers dan juga Frontliner.',
    ARRAY['Digital Marketing', 'Frontliner'],
    1
),
(
    'Oke Print',
    '2020 — 2022',
    'Air Mancur, Kota Bogor',
    'Bekerja sebagai Frontdesk Printing yang bertugas mastering file agar siap cetak dan juga backup mock-up dengan client/customer jika cetakan tersebut custom.',
    ARRAY['Printing', 'Frontdesk', 'File Mastering'],
    2
),
(
    'Universitas Teknologi Nusantara & SMK Master Indonesia',
    '2022 — 2023',
    'Talang, Kota Bogor',
    'Bekerja sebagai Designer Grafis, Staff, Guru, dan Photography. Menangani seluruh kebutuhan desain visual institusi pendidikan.',
    ARRAY['Desain Grafis', 'Guru', 'Photography'],
    3
),
(
    'Indohouse',
    '2023 — 2024',
    'Cianjur',
    'Bekerja sebagai Agent Property, menawarkan jasa untuk menjualkan rumah client, dan juga mencarikan pembeli untuk rumah yang dipasarkan.',
    ARRAY['Property Agent', 'Sales'],
    4
);
