import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Tambahkan path yang tidak perlu dilindungi (public paths)
const publicPaths = ['/login', '/api/auth/login', '/api/alarm-webhook', '/placeholder.svg', '/login-bg.jpg']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) ||
        pathname.startsWith('/_next') || // Static files / next internals
        pathname.includes('.') // file extension like .png, .ico

    const token = request.cookies.get('alpro_token')?.value

    const isLoginPage = pathname === '/login'

    // Khusus untuk halaman login, jika user sudah punya token valid, tendang kembali ke dashboard
    if (isLoginPage) {
        if (token) {
            const verifiedToken = await verifyToken(token)
            if (verifiedToken) {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
        return NextResponse.next() // Biarkan user buka halaman login jika belum auth
    }

    // Kalau ini public path (selain /login), boleh langsung diteruskan tanpa peduli token
    if (isPublicPath) {
        return NextResponse.next()
    }

    if (!token) {
        // Kalau ga punya token di rute yang dilindungi, tendang ke /login
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Ada token di protected route, cek validitasnya
    const verifiedToken = await verifyToken(token)

    if (!verifiedToken) {
        // Token tidak valid atau kadaluarsa, buang cookie-nya lalu tendang
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('alpro_token')
        return response
    }

    // Token valid, silakan lewat!
    return NextResponse.next()
}

// Hanya jalankan middleware ini pada route tertentu (bisa dicustom)
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - walau sebenarnya API auth kita butuh diexclude manual di atas)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
