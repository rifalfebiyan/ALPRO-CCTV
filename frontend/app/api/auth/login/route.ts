import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Cari user di tabel admins berdasarkan email
        const { data: user, error } = await supabase
            .from('admins')
            .select('id, username, name, email, password_hash, role')
            .eq('email', email)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: "Email tidak ditemukan atau kredensial salah" }, { status: 401 })
        }

        // 2. Bandingkan password dari form dengan hash yang ada di DB menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Kredensial salah" }, { status: 401 })
        }

        // 3. Password cocok! Buat token JWT
        const token = await signToken({
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role
        })

        // 4. Pasang Cookie (HTTP-Only) supaya aman dari serangan XSS klien
        const cookieStore = await cookies()
        cookieStore.set({
            name: 'alpro_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 Hari (secara detik)
        })

        // 5. Kirim response sukses
        return NextResponse.json({ success: true, message: "Login berhasil", user: { id: user.id, name: user.name, email: user.email } })
    } catch (error) {
        console.error("Login Error:", error)
        return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 })
    }
}
