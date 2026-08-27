import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()

    // Hapus cookie token dari client
    cookieStore.delete('alpro_token')

    return NextResponse.json({ success: true, message: "Logout berhasil" })
}
