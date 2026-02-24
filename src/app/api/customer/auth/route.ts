import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { phone, password, name, type } = body

        if (type === 'login') {
            const customer = await prisma.customer.findUnique({
                where: { phone }
            })

            if (!customer) {
                return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 })
            }

            // Support both old plain-text passwords and new hashed ones
            const isValid = customer.password.includes(':')
                ? verifyPassword(password, customer.password)
                : customer.password === password

            if (!isValid) {
                return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 })
            }

            // If old plain-text password, upgrade to hashed version
            if (!customer.password.includes(':')) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: { password: hashPassword(password) }
                })
            }

            // Get last order with location for this customer
            const lastOrder = await prisma.order.findFirst({
                where: {
                    customerId: customer.id,
                    latitude: { not: null },
                    longitude: { not: null },
                },
                orderBy: { createdAt: 'desc' },
                select: { latitude: true, longitude: true }
            })

            // Get saved addresses
            const savedAddresses = await prisma.savedAddress.findMany({
                where: { customerId: customer.id },
                orderBy: [
                    { isDefault: 'desc' },
                    { createdAt: 'desc' }
                ]
            })

            return NextResponse.json({
                success: true,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    address: customer.address,
                    latitude: lastOrder?.latitude || null,
                    longitude: lastOrder?.longitude || null,
                    savedAddresses
                }
            })
        }

        else if (type === 'register') {
            // Check if exists first
            const existing = await prisma.customer.findUnique({ where: { phone } })
            if (existing) {
                return NextResponse.json({ error: 'المستخدم موجود مسبقاً' }, { status: 400 })
            }

            // Hash the password before storing
            const hashedPassword = hashPassword(password)

            const newCustomer = await prisma.customer.create({
                data: {
                    phone,
                    password: hashedPassword,
                    name,
                    address: body.address || ''
                }
            })

            return NextResponse.json({
                success: true,
                customer: {
                    id: newCustomer.id,
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    address: newCustomer.address
                }
            })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    } catch (error) {
        console.error('Auth Error:', error)
        return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 })
    }
}
