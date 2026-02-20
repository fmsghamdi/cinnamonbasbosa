import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await requirePermission('products')
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const body = await request.json()
        const product = await prisma.product.create({
            data: {
                name: body.name,
                price: parseFloat(body.price),
                imagePath: body.imagePath,
                description: body.description,
            },
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}
