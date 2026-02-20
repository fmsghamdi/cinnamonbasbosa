import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { oldPassword, newPassword } = await req.json()

        // Auth check (simple session cookie check)
        const cookieStore = await cookies()
        const isAdmin = cookieStore.get('admin_session')?.value === 'true'

        if (!isAdmin) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
        }

        // Check old password
        const passwordSetting = await prisma.setting.findUnique({
            where: { key: 'admin_password' }
        })
        const defaultPassword = process.env.ADMIN_PASSWORD || ''
        const currentPassword = passwordSetting?.value || defaultPassword

        if (oldPassword !== currentPassword) {
            return NextResponse.json({ error: 'كلمة المرور القديمة غير صحيحة' }, { status: 400 })
        }

        // Update password
        await prisma.setting.upsert({
            where: { key: 'admin_password' },
            update: { value: newPassword },
            create: { key: 'admin_password', value: newPassword }
        })

        return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء تغيير كلمة المرور' }, { status: 500 })
    }
}
