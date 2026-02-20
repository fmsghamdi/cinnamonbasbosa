import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Default payment methods structure
const DEFAULT_PAYMENT_METHODS = {
    cash: {
        id: 'cash',
        name: 'الدفع عند الاستلام',
        enabled: true,
        icon: 'banknote',
        settings: {}
    },
    transfer: {
        id: 'transfer',
        name: 'تحويل بنكي',
        enabled: true,
        icon: 'building',
        settings: {
            bankName: '',
            accountHolder: '',
            accountNumber: '',
            iban: '',
            instructions: 'يرجى التحويل وإرسال صورة الإيصال عبر الواتساب'
        }
    },
    card: {
        id: 'card',
        name: 'بطاقة (مدى / فيزا)',
        enabled: false,
        icon: 'credit-card',
        settings: {
            provider: 'manual', // manual, moyasar, tap
            merchantId: '',
            apiKey: '',
            instructions: 'سيتم التواصل معك لإتمام الدفع بالبطاقة'
        }
    },
    apple: {
        id: 'apple',
        name: 'Apple Pay',
        enabled: false,
        icon: 'smartphone',
        settings: {
            provider: 'manual', // manual, moyasar, tap
            merchantId: '',
            instructions: 'سيتم التواصل معك لإتمام الدفع عبر Apple Pay'
        }
    }
}

// GET - Fetch payment methods (public for checkout, or admin)
export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: 'payment_methods' }
        })

        if (setting) {
            const methods = JSON.parse(setting.value)
            return NextResponse.json(methods)
        }

        // Return defaults if not configured
        return NextResponse.json(DEFAULT_PAYMENT_METHODS)
    } catch (error) {
        console.error('Error fetching payment methods:', error)
        return NextResponse.json(DEFAULT_PAYMENT_METHODS)
    }
}

// PUT - Update payment methods (admin/staff with permission)
export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies()
        const adminSession = cookieStore.get('admin_session')
        const staffSession = cookieStore.get('staff_session')

        let hasAccess = adminSession?.value === 'true'

        if (!hasAccess && staffSession?.value) {
            try {
                const staff = JSON.parse(staffSession.value)
                hasAccess = staff.role === 'manager' || staff.permissions?.includes('payments')
            } catch { /* */ }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
        }

        const body = await request.json()

        await prisma.setting.upsert({
            where: { key: 'payment_methods' },
            update: { value: JSON.stringify(body) },
            create: { key: 'payment_methods', value: JSON.stringify(body) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving payment methods:', error)
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    }
}
