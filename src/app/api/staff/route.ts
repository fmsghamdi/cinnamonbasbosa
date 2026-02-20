import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all staff members (admin only)
export async function GET() {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get('admin_session')
        const staffSession = cookieStore.get('staff_session')

        // Check if admin or has staff management permission
        if (session?.value !== 'true' && !staffSession?.value) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const staff = await prisma.staff.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
            }
        })

        return NextResponse.json(staff)
    } catch (error) {
        console.error('Error fetching staff:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}

// Create new staff member (admin only)
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get('admin_session')

        // Only main admin can create staff
        if (session?.value !== 'true') {
            return NextResponse.json({ error: 'غير مصرح - الأدمن فقط' }, { status: 401 })
        }

        const body = await request.json()
        const { username, password, name, role, permissions } = body

        if (!username || !password || !name) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
        }

        // Check if username exists
        const existing = await prisma.staff.findUnique({
            where: { username }
        })

        if (existing) {
            return NextResponse.json({ error: 'اسم المستخدم موجود مسبقاً' }, { status: 400 })
        }

        const staff = await prisma.staff.create({
            data: {
                username,
                password, // In production, hash this
                name,
                role: role || 'staff',
                permissions: JSON.stringify(permissions || []),
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
            }
        })

        return NextResponse.json(staff)
    } catch (error) {
        console.error('Error creating staff:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}
