import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { phone },
            select: { id: true, name: true, phone: true }
        })

        if (customer) {
            return NextResponse.json({
                exists: true,
                name: customer.name
            })
        } else {
            return NextResponse.json({ exists: false })
        }
    } catch (error) {
        console.error('Check customer error:', error)
        return NextResponse.json({ error: 'Failed to check customer' }, { status: 500 })
    }
}
