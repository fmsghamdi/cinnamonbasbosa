import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await requirePermission('orders')
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const orders = await prisma.order.findMany({
            orderBy: { id: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            customerName,
            customerPhone,
            address,
            items,
            total,
            paymentMethod,
            latitude,
            longitude,
            deliveryDate,
            deliveryTime,
            details
        } = body

        if (!customerName || !customerPhone || !address || !items) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // items comes as an array, store as JSON string
        // 1. Find or Create Customer
        let customer = await prisma.customer.findUnique({
            where: { phone: customerPhone }
        })

        if (!customer) {
            // Create new customer if not exists
            // Since it's a guest checkout, we generate a placeholder password
            // In a real app, you might send an SMS with a temporary password
            customer = await prisma.customer.create({
                data: {
                    name: customerName,
                    phone: customerPhone,
                    password: Math.random().toString(36).slice(-8), // Placeholder password
                    address: address
                }
            })
        } else {
            // Optional: Update customer name/address if changed? 
            // For now, let's keep the original record intact or maybe update address if provided
        }

        const itemsString = JSON.stringify(items)

        const order = await prisma.order.create({
            data: {
                customerName,
                customerPhone,
                address,
                items: itemsString,
                total: parseFloat(total),
                paymentMethod: paymentMethod || 'cash',
                status: 'new',
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                deliveryDate,
                deliveryTime,
                details: details || null,
                customerId: customer.id // Link the order to the customer
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
