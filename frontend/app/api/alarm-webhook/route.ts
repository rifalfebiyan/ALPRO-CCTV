import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log("\n\n🔔 [WEBHOOK ALARM BARU MASUK DARI GOOGLE SCRIPT]:", data)

        // Contoh isi data dari Google Script: { id: "2018", nama: "Apotek...", status: "ALARM!!", keterangan: "MALING" }
        // Contoh isi data dari ESP32 Heartbeat: { store_code: "2018", store_name: "Apotek...", status: "ONLINE", description: "Heartbeat" }

        // Normalisasi: Terima KEDUA format, prioritaskan format ESP32 jika ada
        const storeCode = data.store_code || data.id
        const storeName = data.store_name || data.nama
        const status = data.status
        const description = data.description || data.keterangan

        // Menyimpan data IoT Alarm secara langsung ke tabel `iot_alarms` di Supabase
        const supabase = await createClient()

        // Gunakan fungsi "upsert" agar status di Toko yang sama cuma terganti/tertimpa (bukan diduplikat)
        const { error } = await supabase.from('iot_alarms').upsert({
            store_code: storeCode,
            store_name: storeName,
            status: status,
            description: description,
            last_updated: new Date().toISOString()
        }, { onConflict: 'store_code' })

        if (error) {
            console.error("Gagal simpan ke Supabase:", error)
        }

        // Simpan ke tabel LOG RIWAYAT HANYA untuk kejadian PENTING (bukan heartbeat rutin)
        // Ini mencegah database membengkak 8 juta baris/bulan dari heartbeat 200 toko
        const statusPenting = ['ALARM!!', 'SIAGA', 'OFF', 'PENDING', 'OFFLINE', 'TIMEOUT', 'CONNECTED', 'WARNING']
        if (statusPenting.includes(status)) {
            const { error: logError } = await supabase.from('iot_alarm_logs').insert({
                store_code: storeCode,
                store_name: storeName,
                status: status,
                description: description,
            })

            if (logError) {
                console.error("Gagal simpan log riwayat:", logError)
            }
        }

        return NextResponse.json({ success: true, message: "Data alarm & log riwayat masuk ke Supabase" })
    } catch (error) {
        console.error("Webhook Error:", error)
        return NextResponse.json({ success: false, error: "Gagal memproses data" }, { status: 500 })
    }
}
