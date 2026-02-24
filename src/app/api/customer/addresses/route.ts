import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const MAX_ADDRESSES = 5

// GET: Fetch saved addresses for a customer
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    try {
        const addresses = await prisma.savedAddress.findMany({
            where: { customerId: parseInt(customerId) },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json({ addresses })
    } catch (error) {
        console.error('Fetch addresses error:', error)
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }
}

// POST: Save a new address
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerId, label, address, latitude, longitude, isDefault } = body

        if (!customerId || !label || !address || latitude === undefined || longitude === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check max addresses limit
        const count = await prisma.savedAddress.count({
            where: { customerId: parseInt(customerId) }
        })

        if (count >= MAX_ADDRESSES) {
            return NextResponse.json({
                error: 'MAX_REACHED',
                message: `Maximum ${MAX_ADDRESSES} addresses allowed`
            }, { status: 400 })
        }

        // If setting as default, unset other defaults first
        if (isDefault) {
            await prisma.savedAddress.updateMany({
                where: { customerId: parseInt(customerId) },
                data: { isDefault: false }
            })
        }

        const newAddress = await prisma.savedAddress.create({
            data: {
                customerId: parseInt(customerId),
                label,
                address,
                latitude,
                longitude,
                isDefault: isDefault || count === 0 // First address is auto-default
            }
        })

        return NextResponse.json({ success: true, address: newAddress })
    } catch (error) {
        console.error('Save address error:', error)
        return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
    }
}

// DELETE: Remove a saved address
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const customerId = searchParams.get('customerId')

    if (!id || !customerId) {
        return NextResponse.json({ error: 'Address ID and Customer ID are required' }, { status: 400 })
    }

    try {
        // Verify ownership
        const address = await prisma.savedAddress.findFirst({
            where: {
                id: parseInt(id),
                customerId: parseInt(customerId)
            }
        })

        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 })
        }

        await prisma.savedAddress.delete({
            where: { id: parseInt(id) }
        })

        // If deleted address was default, set the newest remaining as default
        if (address.isDefault) {
            const remaining = await prisma.savedAddress.findFirst({
                where: { customerId: parseInt(customerId) },
                orderBy: { createdAt: 'desc' }
            })
            if (remaining) {
                await prisma.savedAddress.update({
                    where: { id: remaining.id },
                    data: { isDefault: true }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete address error:', error)
        return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }
}
