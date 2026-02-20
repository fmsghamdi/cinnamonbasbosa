'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react'

import Image from 'next/image'

export default function CustomerLoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<'phone' | 'login' | 'register'>('phone')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [customerName, setCustomerName] = useState('')

    const handleCheckPhone = async () => {
        if (!phone || phone.length < 9) {
            setError('يرجى إدخال رقم جوال صحيح')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`/api/customer/check?phone=${phone}`)
            const data = await res.json()
            if (data.exists) {
                setCustomerName(data.name)
                setStep('login')
            } else {
                setStep('register')
            }
        } catch {
            setError('حدث خطأ، حاول مرة أخرى')
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async () => {
        if (!password) {
            setError('يرجى إدخال كلمة المرور')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/customer/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, type: 'login' })
            })
            const data = await res.json()
            if (data.success) {
                localStorage.setItem('customer', JSON.stringify(data.customer))
                router.push('/my-account')
            } else {
                setError(data.error || 'بيانات غير صحيحة')
            }
        } catch {
            setError('حدث خطأ، حاول مرة أخرى')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!name || !password) {
            setError('يرجى تعبئة جميع الحقول')
            return
        }
        if (password.length < 4) {
            setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/customer/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, name, type: 'register' })
            })
            const data = await res.json()
            if (data.success) {
                localStorage.setItem('customer', JSON.stringify(data.customer))
                router.push('/my-account')
            } else {
                setError(data.error || 'حدث خطأ')
            }
        } catch {
            setError('حدث خطأ، حاول مرة أخرى')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') action()
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* ... */}
                <div className="login-card">
                    <div className="card-header">
                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <Link href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                                <ArrowRight size={16} />
                                <span>الرئيسية</span>
                            </Link>
                        </div>
                        <div className="logo-wrapper-customer">
                            <Image src="/logo.svg" alt="Cinnamon Basbosa" width={80} height={80} />
                        </div>
                        <h1>حسابي</h1>
                        <p>
                            {step === 'phone' && 'أدخل رقم جوالك للمتابعة'}
                            {step === 'login' && `مرحباً ${customerName}! أدخل كلمة المرور`}
                            {step === 'register' && 'أنشئ حسابك الجديد'}
                        </p>
                    </div>

                    {error && (
                        <div className="error-msg">{error}</div>
                    )}

                    {/* Step 1: Phone */}
                    {step === 'phone' && (
                        <div className="form-group">
                            <label>رقم الجوال</label>
                            <div className="input-wrapper">
                                <Phone size={18} />
                                <input
                                    type="tel"
                                    placeholder="05XXXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onKeyDown={(e) => handleKeyPress(e, handleCheckPhone)}
                                    dir="ltr"
                                    autoFocus
                                />
                            </div>
                            <button
                                className="submit-btn"
                                onClick={handleCheckPhone}
                                disabled={loading}
                            >
                                {loading ? 'جاري التحقق...' : 'متابعة'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Login */}
                    {step === 'login' && (
                        <div className="form-group">
                            <div className="phone-display">
                                <Phone size={14} />
                                <span dir="ltr">{phone}</span>
                                <button onClick={() => { setStep('phone'); setPassword(''); setError('') }}>تغيير</button>
                            </div>
                            <label>كلمة المرور</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    placeholder="أدخل كلمة المرور"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyPress(e, handleLogin)}
                                    autoFocus
                                />
                            </div>
                            <button
                                className="submit-btn"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                <LogIn size={18} />
                                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Register */}
                    {step === 'register' && (
                        <div className="form-group">
                            <div className="phone-display">
                                <Phone size={14} />
                                <span dir="ltr">{phone}</span>
                                <button onClick={() => { setStep('phone'); setPassword(''); setName(''); setError('') }}>تغيير</button>
                            </div>
                            <label>الاسم الكامل</label>
                            <div className="input-wrapper">
                                <UserPlus size={18} />
                                <input
                                    type="text"
                                    placeholder="أدخل اسمك"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <label>كلمة المرور</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    placeholder="اختر كلمة مرور"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => handleKeyPress(e, handleRegister)}
                                />
                            </div>
                            <button
                                className="submit-btn"
                                onClick={handleRegister}
                                disabled={loading}
                            >
                                <UserPlus size={18} />
                                {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #fdf2e9 0%, #fef9f5 50%, #f9f5f0 100%);
                    padding: 1.5rem;
                }

                .login-container {
                    width: 100%;
                    max-width: 420px;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: var(--text);
                    opacity: 0.7;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                    transition: opacity 0.2s;
                }
                .back-link:hover {
                    opacity: 1;
                    color: var(--primary);
                }

                .login-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2.5rem 2rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
                    border: 1px solid #f3f4f6;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .logo-icon {
                    font-size: 3rem;
                    margin-bottom: 0.75rem;
                }
                .card-header h1 {
                    font-size: 1.5rem;
                    color: var(--text);
                    margin-bottom: 0.5rem;
                }
                .card-header p {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .error-msg {
                    background: #fef2f2;
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    text-align: center;
                    margin-bottom: 1rem;
                    border: 1px solid #fecaca;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                label {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #374151;
                }
                .input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    color: #9ca3af;
                    transition: border-color 0.2s;
                }
                .input-wrapper:focus-within {
                    border-color: var(--primary);
                    background: white;
                }
                .input-wrapper input {
                    flex: 1;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 1rem;
                    font-family: inherit;
                    color: var(--text);
                }

                .phone-display {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f3f4f6;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #6b7280;
                }
                .phone-display button {
                    margin-right: auto;
                    color: var(--primary);
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .submit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.85rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(210,105,30,0.25);
                }
                .submit-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(210,105,30,0.35);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    )
}
