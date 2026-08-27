import { jwtVerify, SignJWT } from "jose"

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "ALPRO_SECRET_KEY_SUPER_SECURE_123!"
const key = new TextEncoder().encode(JWT_SECRET_KEY)

export async function signToken(payload: { id: string; email: string; name: string; username: string; role: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h") // Token expires in 24 hours
        .sign(key)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key)
        return payload
    } catch (error) {
        return null
    }
}
