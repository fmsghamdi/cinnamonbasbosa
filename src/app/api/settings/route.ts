import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
    try {
        const settings = await prisma.setting.findMany()

        // Convert array of {key, value} to object {key: value}
        const settingsObject = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as any)

        // Default values if missing
        const defaults = {
            siteName: 'بسبوسة القرفة',
            contactEmail: 'admin@example.com',
            deliveryFee: '15',
            minOrder: '50',
            deliveryZones: JSON.stringify([
                { id: 'makkah', name: 'مكة المكرمة (داخل حد الحرم)', price: 15 },
                { id: 'makkah_far', name: 'مكة (خارج الحد / العوالي)', price: 25 },
                { id: 'jeddah', name: 'جدة', price: 45 },
                { id: 'taif', name: 'الطائف', price: 45 },
            ])
        }

        // Merge defaults
        const finalSettings = { ...defaults, ...settingsObject }

        // Parse JSON fields
        if (typeof finalSettings.deliveryZones === 'string') {
            try {
                finalSettings.deliveryZones = JSON.parse(finalSettings.deliveryZones)
            } catch (e) {
                finalSettings.deliveryZones = []
            }
        }

        // Ensure numeric fields are numbers
        if (finalSettings.deliveryFee) finalSettings.deliveryFee = Number(finalSettings.deliveryFee)
        if (finalSettings.minOrder) finalSettings.minOrder = Number(finalSettings.minOrder)

        return NextResponse.json(finalSettings)
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 })
        }

        const body = await req.json()

        // Handle special fields
        const updates: any[] = []

        for (const [key, value] of Object.entries(body)) {
            let stringValue = String(value)

            // Stringify objects/arrays
            if (typeof value === 'object' && value !== null) {
                stringValue = JSON.stringify(value)
            }

            updates.push(
                prisma.setting.upsert({
                    where: { key },
                    update: { value: stringValue },
                    create: { key, value: stringValue }
                })
            )
        }

        await prisma.$transaction(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
