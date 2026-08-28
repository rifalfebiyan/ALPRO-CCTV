import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url)
        const storeCode = url.searchParams.get('storeCode')

        if (!storeCode) {
            return NextResponse.json({ success: false, error: "storeCode diperlukan" }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('iot_alarms')
            .delete()
            .eq('store_code', storeCode)

        if (error) {
            console.error("Database Delete Error:", error)
            return NextResponse.json({ success: false, error: "Gagal menghapus dari database" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Data alarm berhasil dihapus dari sistem" })
    } catch (e) {
        console.error("Internal API Delete Error:", e)
        return NextResponse.json({ success: false, error: "Terjadi kesalahan internal peladen" }, { status: 500 })
    }
}
