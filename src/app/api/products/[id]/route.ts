import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id)
        const body = await request.json()

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                price: parseFloat(body.price),
                imagePath: body.imagePath,
                description: body.description,
            },
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id)
        await prisma.product.delete({
            where: { id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}
