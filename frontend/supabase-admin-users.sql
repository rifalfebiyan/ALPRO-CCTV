-- Mengaktifkan ekstensi kriptografi (bawaan Supabase) untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Hapus tabel lama jika ada agar skema baru (dengan username) bisa terbentuk
DROP TABLE IF EXISTS public.admins;

-- 2. Membuat tabel admin dengan atribut lengkap
CREATE TABLE public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Super Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bersihkan dulu data yang ada (opsional, untuk mencegah duplikat saat jalan berkali-kali)
TRUNCATE TABLE public.admins;

-- 3. Membuat Akun Admin Default
-- Email: admin@alpro.co.id
-- Password: password123
INSERT INTO public.admins (username, name, email, password_hash, role)
VALUES (
    'admin.alpro',
    'Super Admin', 
    'admin@alpro.co.id', 
    crypt('password123', gen_salt('bf')),
    'Super Admin'
);

-- Pesan untuk memastikan sukses:
-- Anda sekarang bisa login di dashboard lokal dengan email: admin@alpro.co.id dan password: password123
