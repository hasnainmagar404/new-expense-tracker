import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export async function createToken(payload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .setIssuedAt()
        .sign(secret)
    return token
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch (error) {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const payload = await verifyToken(token)
    return payload
}

export async function setAuthCookie(token) {
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })
}

export async function removeAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
}

export async function getCurrentUser() {
    const session = await getSession()
    if (!session) return null
    return {
        id: session.userId,
        email: session.email,
        name: session.name
    }
}
