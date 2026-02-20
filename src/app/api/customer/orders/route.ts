import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!customer) {
            return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
        }

        return NextResponse.json({
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
            },
            orders: customer.orders.map(o => ({
                id: o.id,
                items: o.items,
                total: o.total,
                status: o.status,
                paymentMethod: o.paymentMethod,
                deliveryDate: o.deliveryDate,
                deliveryTime: o.deliveryTime,
                createdAt: o.createdAt,
            }))
        })
    } catch (error) {
        console.error('Error fetching customer orders:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}
