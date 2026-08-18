import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log("\n\n🔔 [WEBHOOK ALARM BARU MASUK DARI GOOGLE SCRIPT]:", data)

        // Contoh isi data: { id: "2018", nama: "Apotek...", status: "ALARM!!", keterangan: "MALING DI PINTU" }

        // Menyimpan data IoT Alarm secara langsung ke tabel `iot_alarms` di Supabase
        const supabase = await createClient()

        // Gunakan fungsi "upsert" agar status di Toko yang sama cuma terganti/tertimpa (bukan diduplikat)
        const { error } = await supabase.from('iot_alarms').upsert({
            store_code: data.id,
            store_name: data.nama,
            status: data.status,
            description: data.keterangan,
            last_updated: new Date().toISOString()
        }, { onConflict: 'store_code' })

        if (error) {
            console.error("Gagal simpan ke Supabase:", error)
        }

        return NextResponse.json({ success: true, message: "Data alarm aman masuk ke Supabase Next.js" })
    } catch (error) {
        console.error("Webhook Error:", error)
        return NextResponse.json({ success: false, error: "Gagal memproses data" }, { status: 500 })
    }
}
