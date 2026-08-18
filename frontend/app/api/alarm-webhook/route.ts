import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log("\n\n🔔 [WEBHOOK ALARM BARU MASUK DARI GOOGLE SCRIPT]:", data)

        // Contoh isi data: { id: "2018", nama: "Apotek...", status: "ALARM!!", keterangan: "MALING DI PINTU" }

        // Ke depannya Anda bisa langsung menyimpannya ke tabel Supabase (misal tabel alerts/iot_alarms):
        // const supabase = await createClient()
        // await supabase.from('alerts').insert([{
        //    store_id: data.id, 
        //    alert_type: data.status, 
        //    description: data.keterangan,
        //    is_resolved: false 
        // }])

        return NextResponse.json({ success: true, message: "Data alarm aman diterima oleh Dashboard Pusat Next.js" })
    } catch (error) {
        console.error("Webhook Error:", error)
        return NextResponse.json({ success: false, error: "Gagal memproses data" }, { status: 500 })
    }
}
