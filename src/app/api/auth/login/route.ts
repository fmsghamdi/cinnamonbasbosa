import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Check DB first
        const passwordSetting = await prisma.setting.findUnique({
            where: { key: 'admin_password' }
        })

        // 2. Env fallback (no hardcoded password in source code)
        const defaultPassword = process.env.ADMIN_PASSWORD || ''
        const validPassword = passwordSetting?.value || defaultPassword

        if (!validPassword) {
            return NextResponse.json({ error: 'لم يتم تعيين كلمة مرور الأدمن' }, { status: 500 })
        }

        if (body.password === validPassword) {
            const cookieStore = await cookies()
            // Set secure cookie
            // Set session cookie
            // Note: For direct IP access without HTTPS, 'secure' must be false.
            // We set SameSite to 'Lax' for better compatibility.
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                path: '/',
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'حدث خطأ في تسجيل الدخول' }, { status: 500 })
    }
}
