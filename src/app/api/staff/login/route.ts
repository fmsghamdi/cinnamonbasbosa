import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبين' }, { status: 400 })
        }

        const staff = await prisma.staff.findUnique({
            where: { username }
        })

        if (!staff || staff.password !== password) {
            return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
        }

        if (!staff.active) {
            return NextResponse.json({ error: 'الحساب معطّل. تواصل مع الإدارة' }, { status: 403 })
        }

        const cookieStore = await cookies()

        // Set staff session cookie with staff info
        const staffData = JSON.stringify({
            id: staff.id,
            name: staff.name,
            role: staff.role,
            permissions: JSON.parse(staff.permissions)
        })

        cookieStore.set('staff_session', staffData, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'lax',
        })

        return NextResponse.json({
            success: true,
            staff: {
                id: staff.id,
                name: staff.name,
                role: staff.role,
                permissions: JSON.parse(staff.permissions)
            }
        })
    } catch (error) {
        console.error('Staff login error:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}
