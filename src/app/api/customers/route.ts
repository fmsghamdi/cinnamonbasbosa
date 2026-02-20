import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await requirePermission('customers')
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const customers = await prisma.customer.findMany({
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const customersWithStats = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            createdAt: customer.createdAt,
            ordersCount: customer.orders.length,
            totalSpent: customer.orders.reduce((sum, o) => sum + o.total, 0),
            lastOrder: customer.orders[0]?.createdAt || null,
            orders: customer.orders.map(o => ({
                id: o.id,
                items: o.items,
                total: o.total,
                status: o.status,
                paymentMethod: o.paymentMethod,
                createdAt: o.createdAt,
            }))
        }))

        return NextResponse.json(customersWithStats)
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}
