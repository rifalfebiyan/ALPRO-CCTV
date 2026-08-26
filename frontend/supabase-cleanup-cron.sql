-- =========================================================
-- SUPABASE PG_CRON SETUP: AUTO-OFFLINE STALE ALARMS
-- =========================================================

-- 1. Pastikan ekstensi pg_cron aktif di database Anda (hanya perlu dijalankan sekali)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Buat jadwal cron job untuk mengeksekusi Cleanup setiap 5 menit
SELECT cron.schedule(
  'cleanup-offline-alarms', -- Nama unik untuk cron job ini
  '* * * * *', -- Berjalan SETIAP 1 MENIT (standar cron format)
  $$
    UPDATE public.iot_alarms 
    SET 
        status = 'OFFLINE', 
        description = 'Sinyal heartbeat hilang (Timeout > 3 menit)'
    WHERE 
        status != 'OFFLINE' 
        AND last_updated < NOW() - INTERVAL '3 minutes';
  $$
);

-- =========================================================
-- CONTOH PERINTAH PENDUKUNG JIKA INGIN MENGHAPUS / CEK CRON
-- =========================================================
-- (Jangan di-run kecuali Anda ingin menghapus cron-nya)

-- CEK STATUS CRON:
-- SELECT * FROM cron.job;

-- HAPUS CRON JOB:
-- SELECT cron.unschedule('cleanup-offline-alarms');
