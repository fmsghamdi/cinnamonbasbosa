'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function PaymentCallbackContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { clearCart } = useCart()

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
    const [message, setMessage] = useState('جاري التحقق من عملية الدفع...')

    // Ref to prevent double execution in React Strict Mode
    const processedRef = useRef(false)

    useEffect(() => {
        const verifyPayment = async () => {
            if (processedRef.current) return

            const paymentStatus = searchParams.get('status')
            const paymentId = searchParams.get('id')
            const paymentMessage = searchParams.get('message')

            if (paymentStatus === 'paid') {
                processedRef.current = true

                try {
                    // Fetch Settings first
                    const settingsRes = await fetch('/api/settings')
                    const settings = await settingsRes.json()
                    const waNumber = settings.whatsappNumber || '966500000000'
                    const deliveryZones = settings.deliveryZones || []

                    // Recover checkout data from localStorage OR Cookie
                    let storedData = localStorage.getItem('temp_checkout_data')

                    if (!storedData) {
                        // Fallback to cookie
                        const match = document.cookie.match(new RegExp('(^| )temp_checkout_data=([^;]+)'))
                        if (match) {
                            try {
                                storedData = decodeURIComponent(match[2])
                            } catch (e) {
                                console.error('Cookie decode error', e)
                            }
                        }
                    }

                    if (!storedData) {
                        setStatus('failed')
                        setMessage('عذراً، انتهت صلاحية الجلسة. الرجاء المحاولة مرة أخرى.')
                        return
                    }

                    const checkoutData = JSON.parse(storedData)
                    const orderItems = checkoutData.items || []

                    if (orderItems.length === 0) {
                        setStatus('failed')
                        setMessage('السلة فارغة! الرجاء إعادة المحاولة.')
                        return
                    }

                    const orderTotal = checkoutData.total || 0;
                    const deliveryType = checkoutData.deliveryType || 'delivery'
                    const deliveryZoneId = checkoutData.deliveryZone || 'makkah'
                    const deliveryCost = checkoutData.deliveryCost || 0

                    // Create Order in Database
                    const orderRes = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customerName: checkoutData.customerName,
                            customerPhone: checkoutData.customerPhone,
                            address: deliveryType === 'delivery' ? checkoutData.address : 'استلام من الفرع',
                            items: orderItems,
                            total: orderTotal,
                            paymentMethod: checkoutData.paymentMethod || 'card',
                            latitude: checkoutData.location?.lat,
                            longitude: checkoutData.location?.lng,
                            deliveryDate: checkoutData.deliveryDate,
                            deliveryTime: checkoutData.deliveryTime,
                            details: `Payment ID: ${paymentId}, Type: ${deliveryType}, Zone: ${deliveryZoneId}, Cost: ${deliveryCost} | Note: ${checkoutData.customerNote || 'None'}`
                        })
                    })

                    if (!orderRes.ok) throw new Error('فشل حفظ الطلب')

                    const orderData = await orderRes.json()

                    // Prepare Detailed WhatsApp Message
                    let msg = `*طلب جديد #${orderData.id}* (تم الدفع ✅)\n`
                    msg += `الاسم: ${checkoutData.customerName}\n`
                    msg += `جوال: ${checkoutData.customerPhone}\n`

                    if (deliveryType === 'delivery') {
                        let lat = checkoutData.location?.lat
                        let lng = checkoutData.location?.lng

                        // If location object missing, try to parse from address string
                        if (!lat && checkoutData.address && checkoutData.address.includes(',')) {
                            const parts = checkoutData.address.match(/[-+]?([0-9]*\.[0-9]+)/g)
                            if (parts && parts.length >= 2) {
                                lat = parts[0]
                                lng = parts[1]
                            }
                        }

                        if (checkoutData.address) msg += `العنوان: ${checkoutData.address}\n`
                        if (lat && lng) {
                            msg += `الموقع: https://www.google.com/maps?q=${lat},${lng}\n`
                        }
                    } else {
                        msg += `طريقة الاستلام: استلام من الفرع\n`
                    }

                    if (checkoutData.deliveryDate) {
                        msg += `وقت الاستلام: ${checkoutData.deliveryDate}`
                        if (checkoutData.deliveryTime) msg += ` (${checkoutData.deliveryTime})`
                        msg += `\n`
                    }

                    msg += `\n*الطلب:* \n`
                    if (Array.isArray(orderItems)) {
                        msg += orderItems.map((i: any) => {
                            const opt = i.options ? ` (${i.options})` : ''
                            return `- ${i.quantity}x ${i.name}${opt}`
                        }).join('\n')
                    }

                    msg += `\n\nالإجمالي: *${orderTotal} ر.س*\n`
                    msg += `رقم العملية: ${paymentId}\n`

                    if (checkoutData.customerNote) {
                        msg += `\n📝 *ملاحظات:* ${checkoutData.customerNote}\n`
                    }



                    const finalLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`

                    // Save link for success page
                    sessionStorage.setItem('pending_whatsapp_link', finalLink)

                    // Clear cart and temp data
                    clearCart()
                    localStorage.removeItem('temp_checkout_data')

                    // Redirect to success page
                    router.push(`/order-success?id=${orderData.id}`)

                } catch (err: any) {
                    console.error(err)
                    setStatus('failed')
                    setMessage(err.message || 'حدث خطأ أثناء حفظ الطلب')
                }
            } else {
                // Payment Failed
                setStatus('failed')
                setMessage(paymentMessage || 'فشلت عملية الدفع')
            }
        }

        verifyPayment()
    }, [searchParams, router, clearCart])

    return (
        <div className="callback-page">
            <div className="card">
                {status === 'loading' && (
                    <div className="status loading">
                        <Loader2 className="animate-spin" size={48} />
                        <h2>جاري تأكيد الطلب...</h2>
                        <p>{message}</p>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="status failed">
                        <XCircle size={64} className="text-red-500" />
                        <h2>عذراً!</h2>
                        <p>{message}</p>
                        <button onClick={() => router.push('/checkout')} className="retry-btn">
                            محاولة مرة أخرى
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .callback-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9fafb;
                    padding: 1rem;
                }
                .card {
                    background: white;
                    padding: 3rem;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    text-align: center;
                    max-width: 500px;
                    width: 100%;
                }
                .status {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                h2 {
                    font-size: 1.5rem;
                    color: #111;
                    margin: 0;
                }
                p {
                    color: #666;
                    margin-bottom: 1.5rem;
                }
                .retry-btn {
                    background: #ef4444;
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
    )
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">جاري التحميل...</div>}>
            <PaymentCallbackContent />
        </Suspense>
    )
}
