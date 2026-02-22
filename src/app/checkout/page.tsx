'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { MapPin, Calendar, CreditCard, Banknote, Navigation, Smartphone, User, ArrowRight, Building2, Copy, Check, Info, Lock, Map } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
    interface Window {
        Moyasar: any;
    }
}

interface PaymentMethodConfig {
    id: string
    name: string
    enabled: boolean
    icon: string
    settings: Record<string, string>
}

type PaymentMethods = Record<string, PaymentMethodConfig>

interface DeliveryZone {
    id: string
    name: string
    price: number
}

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart()
    const { t, language } = useLanguage()
    const router = useRouter()

    const [customerName, setCustomerName] = useState('')
    const [welcomeName, setWelcomeName] = useState('') // Temp name for welcome banner
    const [customerPhone, setCustomerPhone] = useState('')
    const [address, setAddress] = useState('')
    const [customerNote, setCustomerNote] = useState('')
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [tempLocation, setTempLocation] = useState<{ lat: number, lng: number }>({ lat: 21.3891, lng: 39.8579 }) // Default: Makkah
    const [deliveryDate, setDeliveryDate] = useState('')
    const [deliveryTime, setDeliveryTime] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [whatsappNumber, setWhatsappNumber] = useState('966500000000')
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
    const [deliveryZone, setDeliveryZone] = useState('')
    const [deliveryCost, setDeliveryCost] = useState(0)
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])

    const subTotal = total
    const grandTotal = subTotal + deliveryCost

    // Smart Recognition States
    const [password, setPassword] = useState('')
    const [isCheckingPhone, setIsCheckingPhone] = useState(false)
    const [customerStatus, setCustomerStatus] = useState<'new' | 'existing' | 'guest'>('guest')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginError, setLoginError] = useState('')

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({})
    const [copiedField, setCopiedField] = useState('')

    // --- Effects ---

    useEffect(() => {
        if (items.length === 0) router.push('/')

        // Fetch Settings & Zones
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
                if (data.deliveryZones && Array.isArray(data.deliveryZones)) {
                    setDeliveryZones(data.deliveryZones)
                    if (data.deliveryZones.length > 0) {
                        setDeliveryZone(data.deliveryZones[0].id)
                        setDeliveryCost(data.deliveryZones[0].price)
                    }
                }
            })
            .catch(console.error)

        // Fetch Payment Methods
        fetch('/api/payment-methods')
            .then(res => res.json())
            .then((data: PaymentMethods) => {
                setPaymentMethods(data)
                // Default to first enabled
                const first = Object.values(data).find(m => m.enabled)
                if (first) setPaymentMethod(first.id)
            })
            .catch(console.error)
    }, [items, router])

    useEffect(() => {
        if (deliveryType === 'pickup') {
            setDeliveryCost(0)
        } else {
            const zone = deliveryZones.find(z => z.id === deliveryZone)
            setDeliveryCost(zone ? zone.price : 0)
        }
    }, [deliveryType, deliveryZone, deliveryZones])

    // Save state for callback recovery
    useEffect(() => {
        const data = {
            customerName,
            customerPhone,
            address,
            customerNote,
            location,
            deliveryDate,
            deliveryTime,
            paymentMethod,
            items,
            total,
            deliveryType,
            deliveryZone,
            deliveryCost
        }
        localStorage.setItem('temp_checkout_data', JSON.stringify(data))

        // Also save critical info to cookie as backup (1 hour expiry)
        const cookieData = encodeURIComponent(JSON.stringify(data))
        document.cookie = `temp_checkout_data=${cookieData}; path=/; max-age=3600; SameSite=Lax`

    }, [customerName, customerPhone, address, location, deliveryDate, deliveryTime, paymentMethod, items, total, deliveryType, deliveryZone, deliveryCost])

    // Moyasar Integration
    useEffect(() => {
        if (!['card', 'apple', 'google'].includes(paymentMethod)) return

        const methodConfig = paymentMethods[paymentMethod]
        if (!methodConfig) return

        // For Apple Pay and Google Pay, usually they share the same provider key setting as card, or have their own.
        // We fallback to a test key if none is provided.
        const apiKey = methodConfig.settings?.apiKey || paymentMethods['card']?.settings?.apiKey || 'pk_test_AQpxBV31a29qhkhUYFYUFjhwllaDVrxSq5ydVNui'

        if (window.Moyasar) {
            try {
                // Clear previous form if it exists by resetting innerHTML before init
                const formEl = document.querySelector('.moyasar-payment-form')
                if (formEl) formEl.innerHTML = ''

                window.Moyasar.init({
                    element: '.moyasar-payment-form',
                    amount: Math.round(grandTotal * 100),
                    currency: 'SAR',
                    description: `Order #${Date.now()}`,
                    publishable_api_key: apiKey,
                    callback_url: `${window.location.origin}/checkout/callback`,
                    methods: [
                        paymentMethod === 'apple' ? 'applepay' :
                            paymentMethod === 'google' ? 'googlepay' :
                                'creditcard'
                    ],
                    apple_pay: {
                        country: 'SA',
                        label: 'Cinamon Basbosa',
                        validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate'
                    },
                    on_completed: (payment: any) => console.log('Payment completed:', payment)
                })
            } catch (err) {
                console.error("Moyasar Error", err)
            }
        }
    }, [paymentMethod, grandTotal, paymentMethods])

    // --- Handlers ---

    const checkPhone = async () => {
        if (customerPhone.length < 9) return

        setIsCheckingPhone(true)
        setCustomerStatus('guest')
        setLoginError('')

        try {
            const res = await fetch(`/api/customer/check?phone=${customerPhone}`)
            const data = await res.json()

            if (data.exists) {
                setCustomerStatus('existing')
                setWelcomeName(data.name)
            } else {
                setCustomerStatus('new')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsCheckingPhone(false)
        }
    }

    const handleLogin = async () => {
        if (!password) {
            setLoginError(t('checkout.pleaseEnterPassword'))
            return
        }

        try {
            const res = await fetch('/api/customer/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'login',
                    phone: customerPhone,
                    password
                })
            })
            const data = await res.json()

            if (res.ok) {
                setCustomerName(data.customer.name)
                if (data.customer.address) setAddress(data.customer.address)
                setIsLoggedIn(true)
                setLoginError('')
            } else {
                setLoginError(t('checkout.incorrectPassword'))
            }
        } catch (e) {
            setLoginError(t('checkout.connectionError'))
        }
    }

    const [isGettingLocation, setIsGettingLocation] = useState(false)

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            // If geolocation not supported, open map with default location (Makkah)
            setShowMap(true)
            return
        }

        setIsGettingLocation(true)

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude
                const userLng = pos.coords.longitude
                setTempLocation({ lat: userLat, lng: userLng })
                setIsGettingLocation(false)
                setShowMap(true)
            },
            (error) => {
                console.error('GPS Error:', error)
                setIsGettingLocation(false)
                // If location denied, open map with default location
                setShowMap(true)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )
    }

    const handleMapLocationConfirm = (lat: number, lng: number) => {
        setLocation({ lat, lng })
        setAddress(`تم تحديد الموقع: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(''), 2000)
    }

    const handleCheckout = async () => {
        if (!customerName || !customerPhone) return alert(t('checkout.missingDetails'))
        setIsSubmitting(true)

        try {
            // Register if New Customer + Password provided
            let customerId: number | undefined = undefined

            if (customerStatus === 'new' && password) {
                const regRes = await fetch('/api/customer/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'register',
                        phone: customerPhone,
                        password,
                        name: customerName,
                        address
                    })
                })
                if (regRes.ok) {
                    const d = await regRes.json()
                    customerId = d.customer.id
                }
            }

            // Create Order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    address: deliveryType === 'delivery' ? address : 'استلام من الفرع',
                    items,
                    total: grandTotal,
                    paymentMethod,
                    latitude: location?.lat,
                    longitude: location?.lng,
                    deliveryDate,
                    deliveryTime,
                    customerId, // Will be linked automatically by backend logic anyway if phone exists
                    details: `Type: ${deliveryType}, Zone: ${deliveryZone}, Cost: ${deliveryCost} | Note: ${customerNote || 'None'}`
                })
            })

            if (!orderRes.ok) throw new Error('Failed')
            const orderData = await orderRes.json()
            const orderId = orderData.id

            // WhatsApp
            let msg = `*طلب جديد #${orderId}* 🛍️\n`
            msg += `الاسم: ${customerName}\n`
            msg += `جوال: ${customerPhone}\n`

            if (deliveryType === 'delivery') {
                msg += `العنوان: ${address}\n`
                if (location) msg += `الموقع: https://www.google.com/maps?q=${location.lat},${location.lng}\n`
            } else {
                msg += `الاستلام: من الفرع\n`
            }

            msg += `\n*الطلب:* \n`
            msg += items.map(i => {
                const opt = i.options ? ` (${i.options})` : ''
                return `- ${i.quantity}x ${i.name}${opt}`
            }).join('\n')

            msg += `\n\nالإجمالي: *${grandTotal} ر.س*\n`

            if (customerNote) {
                msg += `\n📝 *ملاحظات:* ${customerNote}\n`
            }



            clearCart()
            const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
            sessionStorage.setItem('pending_whatsapp_link', waLink)
            window.location.href = `/order-success?id=${orderId}`

        } catch (e) {
            alert(t('checkout.errorOccurred'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const getPaymentIcon = (icon: string) => <CreditCard size={20} /> // Simplify for now

    const enabledMethods = Object.values(paymentMethods).filter(m => m.enabled)

    return (
        <div className="checkout-overlay">
            <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.12.0/moyasar.css" />
            <Script src="https://cdn.moyasar.com/mpf/1.12.0/moyasar.js" strategy="lazyOnload" />

            {/* Modal Card */}
            <div className="checkout-modal">

                {/* Header */}
                <div className="modal-header">
                    <Link href="/" className="back-btn">
                        <ArrowRight size={20} />
                        <span>{t('checkout.back')}</span>
                    </Link>
                    <h2>{t('checkout.title')}</h2>
                    <div className="placeholder"></div>
                </div>

                <div className="modal-content">
                    {/* User Form */}
                    <div className="form-section">

                        {/* 1. User Info */}
                        <div className="section-block">
                            <h3 className="section-title"><User size={18} /> {t('checkout.userDetails')}</h3>

                            <div className="form-group">
                                <label>{t('checkout.phone')}</label>
                                <div className="input-with-icon">
                                    <Smartphone size={18} className="icon" />
                                    <input
                                        type="tel"
                                        dir="ltr"
                                        placeholder="05xxxxxxxx"
                                        value={customerPhone}
                                        onChange={e => {
                                            const val = e.target.value
                                                .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
                                                .replace(/[^\d+]/g, '');
                                            setCustomerPhone(val);
                                        }}
                                        onBlur={checkPhone}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); checkPhone() } }}
                                        className={customerStatus === 'existing' ? 'border-green-500' : ''}
                                    />
                                    {isCheckingPhone && <span className="spinner">⌛</span>}
                                </div>
                            </div>

                            {/* Welcome Back / Password Logic */}
                            {customerStatus === 'existing' && !isLoggedIn && (
                                <div className="welcome-banner">
                                    <div className="banner-content">
                                        <p>{t('checkout.welcomeBack')} {welcomeName} {t('checkout.again')}</p>
                                        <p className="sub-text">{t('checkout.enterPassword')}</p>
                                    </div>
                                    <div className="password-row">
                                        <input
                                            type="password"
                                            placeholder={t('checkout.enterPassword')}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLogin() } }}
                                        />
                                        <button onClick={handleLogin}>{t('checkout.login')}</button>
                                    </div>
                                    <div className="forgot-pass-container">
                                        <a
                                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحباً، نسيت كلمة المرور لرقم جوالي ${customerPhone}، أرجو المساعدة في استعادتها.`)}`}
                                            target="_blank"
                                            className="forgot-pass-link"
                                        >
                                            {t('checkout.forgotPassword')}
                                        </a>
                                    </div>
                                    {loginError && <p className="error-msg">{loginError}</p>}
                                </div>
                            )}

                            {isLoggedIn && (
                                <div className="success-banner">
                                    {t('checkout.loginSuccess')}
                                </div>
                            )}

                            {/* Show name field only for new/guest customers */}
                            {customerStatus !== 'existing' && (
                                <div className="form-group">
                                    <label>{t('checkout.name')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('checkout.namePlaceholder')}
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* New Customer Password (Optional) */}
                            {customerStatus === 'new' && (
                                <div className="form-group">
                                    <label>{t('checkout.passwordOptional')}</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="icon" />
                                        <input
                                            type="password"
                                            placeholder="******"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Delivery */}
                        <div className="section-block">
                            <h3 className="section-title"><MapPin size={18} /> {t('checkout.deliveryMethod')}</h3>

                            <div className="delivery-tabs">
                                <button
                                    className={`tab ${deliveryType === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setDeliveryType('delivery')}
                                >
                                    <Navigation size={16} /> {t('checkout.delivery')}
                                </button>
                                <button
                                    className={`tab ${deliveryType === 'pickup' ? 'active' : ''}`}
                                    onClick={() => setDeliveryType('pickup')}
                                >
                                    <Building2 size={16} /> {t('checkout.pickup')}
                                </button>
                            </div>

                            {deliveryType === 'delivery' ? (
                                <div className="delivery-fields">
                                    <select
                                        value={deliveryZone}
                                        onChange={e => setDeliveryZone(e.target.value)}
                                        className="mb-2"
                                    >
                                        {deliveryZones.map(z => (
                                            <option key={z.id} value={z.id}>{z.name} ({z.price} {t('common.currency')})</option>
                                        ))}
                                    </select>
                                    <div className="location-row">
                                        <button
                                            onClick={getCurrentLocation}
                                            className="loc-btn"
                                            title={t('checkout.locateMe')}
                                            disabled={isGettingLocation}
                                        >
                                            {isGettingLocation ? <span className="spinner-small">⏳</span> : <Navigation size={18} />}
                                        </button>
                                        <textarea
                                            placeholder={t('checkout.addressDetails')}
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            rows={2}
                                        ></textarea>
                                    </div>

                                    {location && (
                                        <div className="location-preview">
                                            <div className="location-info">
                                                <MapPin size={16} />
                                                <span dir="ltr">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                                            </div>
                                            <button
                                                onClick={() => setShowMap(true)}
                                                className="change-location-btn"
                                            >
                                                <Map size={14} /> {t('checkout.changeLocation')}
                                            </button>
                                        </div>
                                    )}

                                    {showMap && (
                                        <MapPicker
                                            lat={location?.lat || tempLocation.lat}
                                            lng={location?.lng || tempLocation.lng}
                                            onLocationChange={handleMapLocationConfirm}
                                            onClose={() => setShowMap(false)}
                                        />
                                    )}

                                </div>
                            ) : (
                                <div className="pickup-info">
                                    {t('checkout.branchPickup')}
                                </div>
                            )}

                            {/* Global Notes Field */}
                            <div className="mt-4 border-t pt-4 border-gray-100">
                                <label className="text-sm font-bold text-gray-600 mb-2 block flex items-center gap-2">
                                    <Info size={16} className="text-primary-orange" />
                                    {t('checkout.additionalNotes')}
                                </label>
                                <textarea
                                    placeholder={t('checkout.notesPlaceholder')}
                                    value={customerNote}
                                    onChange={e => setCustomerNote(e.target.value)}
                                    className="custom-note-field w-full"
                                ></textarea>
                            </div>
                        </div>

                        {/* 3. Payment */}
                        <div className="section-block">
                            <h3 className="section-title"><CreditCard size={18} /> {t('checkout.payment')}</h3>
                            <div className="payment-grid">
                                {enabledMethods.map(m => (
                                    <label key={m.id} className={`pay-card ${paymentMethod === m.id ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="pay"
                                            value={m.id}
                                            checked={paymentMethod === m.id}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        />
                                        <span>{m.name}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Payment Forms (Transfer/Moyasar) */}
                            {paymentMethod === 'transfer' && paymentMethods['transfer'] && (
                                <div className="transfer-info">
                                    <p className="bank-name">{paymentMethods['transfer'].settings.bankName}</p>
                                    <div className="iban-box">
                                        <span>{paymentMethods['transfer'].settings.iban}</span>
                                        <button onClick={() => copyToClipboard(paymentMethods['transfer'].settings.iban, 'iban')}><Copy size={14} /></button>
                                    </div>
                                    {copiedField === 'iban' && <span className="copied-tag">{t('checkout.copied')}</span>}
                                </div>
                            )}

                            {['card', 'apple', 'google'].includes(paymentMethod) && (
                                <div className="moyasar-payment-form mt-4"></div>
                            )}
                        </div>

                    </div>

                    {/* Summary Sidebar */}
                    <div className="summary-section">
                        <div className="summary-card">
                            <h3>{t('checkout.orderSummary')}</h3>
                            <div className="cart-list">
                                {items.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="summary-item">
                                        <div className="item-info">
                                            <span>{item.quantity}x {item.name}</span>
                                            {item.options && <p className="text-xs text-primary-orange">{item.options}</p>}
                                        </div>
                                        <span className="price">{item.price * item.quantity} {t('common.currency')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="totals">
                                <div className="row"><span>{t('checkout.subtotal')}</span><span>{subTotal}</span></div>
                                <div className="row"><span>{t('checkout.deliveryFee')}</span><span>{deliveryCost}</span></div>
                                <div className="row total"><span>{t('checkout.grandTotal')}</span><span>{grandTotal} {t('common.currency')}</span></div>
                            </div>

                            {!['card', 'apple'].includes(paymentMethod) && (
                                <button
                                    className="checkout-btn"
                                    onClick={handleCheckout}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('checkout.processing') : `${t('checkout.placeOrder')} (${grandTotal} ${t('common.currency')})`}
                                </button>
                            )}
                            <p className="secure-badge"><Lock size={12} /> {t('checkout.securePayment')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .checkout-overlay {
                    position: fixed;
                    inset: 0;
                    background: var(--bg);
                    backdrop-filter: blur(8px);
                    z-index: 50;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
                .checkout-modal {
                    background: var(--card-bg);
                    width: 100%;
                    max-width: 900px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    margin-top: 20px;
                    margin-bottom: 40px;
                    overflow: hidden;
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    padding: 20px 30px;
                    border-bottom: 1px solid var(--card-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--card-bg);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .modal-header h2 { font-size: 1.25rem; font-weight: 800; color: var(--text); }
                .back-btn { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; transition: color 0.2s; }
                .back-btn:hover { color: var(--primary); }

                .modal-content {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    background: var(--bg);
                }
                @media (max-width: 768px) {
                    .modal-content { 
                        grid-template-columns: 1fr; 
                        display: flex; 
                        flex-direction: column; /* CHANGED FROM column-reverse TO column */
                    }
                }

                /* Form Section */
                .form-section { padding: 30px; display: flex; flex-direction: column; gap: 24px; }
                
                .section-block {
                    background: var(--card-bg);
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                    border: 1px solid var(--card-border);
                }
                .section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text);
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Specific styles for our form inputs only to avoid breaking Moyasar */
                .form-group input, 
                .form-group select, 
                .form-group textarea,
                .password-row input,
                .input-with-icon input,
                .delivery-fields select,
                .location-row textarea,
                .custom-note-field {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid var(--card-border);
                    font-size: 0.95rem;
                    background: var(--gray-100);
                    color: var(--text);
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .custom-note-field {
                    resize: none;
                    height: 80px;
                }
                .form-group input:focus, 
                .form-group select:focus, 
                .form-group textarea:focus,
                .password-row input:focus,
                .input-with-icon input:focus,
                .delivery-fields select:focus,
                .location-row textarea:focus,
                .custom-note-field:focus {
                    background: var(--card-bg);
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.1);
                }

                /* Ensure Moyasar form is clean */
                .moyasar-payment-form {
                    direction: ltr; /* Cards are usually LTR */
                    max-width: 100%;
                }

                .input-with-icon { position: relative; }
                .input-with-icon .icon { position: absolute; right: 12px; top: 12px; color: var(--text-muted); }
                .input-with-icon input { padding-right: 40px; }

                /* Welcome Back Banner */
                .welcome-banner {
                    background: #fff7ed;
                    border: 1px solid #fed7aa;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .banner-content p { font-weight: 700; color: #9a3412; font-size: 0.95rem; }
                .sub-text { font-weight: 400 !important; color: #c2410c !important; font-size: 0.85rem !important; margin-top: 2px; }
                
                .password-row {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .password-row button {
                    background: #9a3412;
                    color: white;
                    padding: 0 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                .success-banner {
                    background: #dcfce7;
                    color: #166534;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    margin-bottom: 16px;
                    text-align: center;
                }
                .error-msg { color: #dc2626; font-size: 0.8rem; margin-top: 6px; font-weight: 600; }
                
                .forgot-pass-container { margin-top: 8px; text-align: left; }
                .forgot-pass-link { font-size: 0.75rem; color: #c2410c; text-decoration: underline; font-weight: 500; }
                .forgot-pass-link:hover { color: #9a3412; }

                /* Delivery Tabs */
                .delivery-tabs { display: flex; gap: 8px; margin-bottom: 16px; background: var(--gray-100); padding: 4px; border-radius: 10px; }
                .tab {
                    flex: 1;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .tab.active { background: var(--card-bg); color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

                .location-row { display: flex; gap: 8px; margin-top: 8px; }
                .loc-btn { background: #fee2e2; color: #ef4444; width: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                
                .pickup-info { background: #fffbeb; color: #92400e; padding: 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 500; text-align: center; border: 1px dashed #fcd34d; }

                .location-preview {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 8px 12px;
                    margin-top: 8px;
                }
                .location-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #16a34a;
                    font-size: 0.85rem;
                    font-family: monospace;
                }
                .change-location-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #dcfce7;
                    color: #15803d;
                    border: none;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .change-location-btn:hover {
                    background: #bbf7d0;
                }

                /* Payment Grid */
                .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .pay-card {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text);
                }
                .pay-card:hover { background: var(--gray-100); }
                .pay-card.active { border-color: var(--primary); background: var(--gray-100); color: var(--primary); }
                
                .transfer-info { margin-top: 16px; background: var(--gray-100); padding: 12px; border-radius: 8px; font-size: 0.9rem; color: var(--text); }
                .bank-name { font-weight: bold; margin-bottom: 8px; color: var(--text); }
                .iban-box { display: flex; justify-content: space-between; align-items: center; background: var(--card-bg); padding: 8px 12px; border-radius: 6px; border: 1px dashed var(--card-border); font-family: monospace; color: var(--text); }
                .copied-tag { font-size: 0.75rem; color: #16a34a; font-weight: bold; margin-top: 4px; display: block; text-align: left; }

                /* Summary Sidebar */
                .summary-section { padding: 30px; background: var(--card-bg); border-right: 1px solid var(--card-border); }
                .summary-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 20px; color: var(--text); }
                
                .cart-list { max-height: 300px; overflow-y: auto; margin-bottom: 20px; padding-right: 4px; }
                .summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--card-border); }
                .item-info span { font-size: 0.9rem; font-weight: 600; color: var(--text); }
                .item-info p { font-size: 0.8rem; color: var(--text-muted); }
                .price { font-weight: 700; color: var(--text); font-size: 0.9rem; }

                .totals .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-muted); }
                .totals .row.total { margin-top: 16px; padding-top: 16px; border-top: 2px solid var(--card-border); font-size: 1.25rem; font-weight: 800; color: var(--primary); }

                .checkout-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #D2691E 0%, #b55a19 100%);
                    color: white;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    margin-top: 24px;
                    box-shadow: 0 10px 20px -5px rgba(210, 105, 30, 0.3);
                    transition: transform 0.2s;
                }
                .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(210, 105, 30, 0.4); }
                .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

                .secure-badge { text-align: center; margin-top: 12px; color: #9ca3af; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 4px; }
            `}</style>
        </div>
    )
}
