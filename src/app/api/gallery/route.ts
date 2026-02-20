import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'

export async function GET() {
    try {
        const images = await prisma.gallery.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(images)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await requirePermission('gallery')
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const body = await request.json()
        const { imagePath, title } = body

        const image = await prisma.gallery.create({
            data: { imagePath, title }
        })

        return NextResponse.json(image)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
    }
}
