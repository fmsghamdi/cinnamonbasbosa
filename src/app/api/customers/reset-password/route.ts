import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { customerId, newPassword } = await request.json()

        if (!customerId || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        await prisma.customer.update({
            where: { id: parseInt(customerId) },
            data: { password: newPassword }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
