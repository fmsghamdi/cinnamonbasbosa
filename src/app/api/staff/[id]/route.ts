import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

// Update staff member
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get('admin_session')
        if (session?.value !== 'true') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const params = await props.params
        const id = parseInt(params.id)
        const body = await request.json()

        const updateData: Record<string, unknown> = {}
        if (body.name) updateData.name = body.name
        if (body.role) updateData.role = body.role
        if (body.permissions) updateData.permissions = JSON.stringify(body.permissions)
        if (body.active !== undefined) updateData.active = body.active
        if (body.password) updateData.password = body.password

        const staff = await prisma.staff.update({
            where: { id },
            data: updateData,
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
        console.error('Error updating staff:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}

// Delete staff member
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get('admin_session')
        if (session?.value !== 'true') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const params = await props.params
        const id = parseInt(params.id)

        await prisma.staff.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting staff:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}
