import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { customerId, name, address } = body

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
        }

        const updated = await prisma.customer.update({
            where: { id: parseInt(customerId) },
            data: {
                ...(name && { name }),
                ...(address !== undefined && { address }),
            }
        })

        return NextResponse.json({
            success: true,
            customer: {
                id: updated.id,
                name: updated.name,
                phone: updated.phone,
                address: updated.address,
            }
        })
    } catch (error) {
        console.error('Error updating customer:', error)
        return NextResponse.json({ error: 'حدث خطأ في تحديث البيانات' }, { status: 500 })
    }
}
